const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./database');
const mercadopago = require('./payments/mercadopago');
const auth = require('./auth');
const mailer = require('./email');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'luxiphones-admin';

const ROOT_DIR = path.join(__dirname, '..');

function getBaseUrl(req) {
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `${req.protocol}://${req.get('host')}`
  ).replace(/\/$/, '');
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(ROOT_DIR));

function asyncHandler(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function requireAdmin(req, res, next) {
  if (req.headers['x-admin-token'] !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  next();
}

// Exige estar logado (Google ou e-mail/senha) — não valida token de admin.
async function requireUser(req, res, next) {
  const userId = auth.getSessionUserId(req);
  const user = userId ? await db.getUserById(userId) : null;
  if (!user) return res.status(401).json({ error: 'Faça login para continuar.' });
  req.user = user;
  next();
}

function requestIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || 'unknown';
}

function conditionLabel(cond) {
  return cond === 'recon' ? 'Recondicionado' : 'Novo';
}

// ---------- PUBLIC: PRODUCTS ----------
app.get('/api/products', asyncHandler(async (req, res) => {
  res.json(await db.getProducts());
}));

// ---------- AUTH: LOGIN COM GOOGLE ----------
app.get('/api/auth/config', (req, res) => {
  res.json({ googleClientId: auth.isGoogleLoginConfigured() ? auth.GOOGLE_CLIENT_ID : null });
});

app.post('/api/auth/google', asyncHandler(async (req, res) => {
  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: 'Credencial do Google ausente.' });

  let profile;
  try {
    profile = await auth.verifyGoogleCredential(credential);
  } catch (err) {
    console.error('Falha ao verificar credencial do Google:', err.message);
    return res.status(401).json({ error: 'Não foi possível validar o login do Google.' });
  }

  const user = await db.upsertGoogleUser(profile);
  auth.setSessionCookie(res, user.id, req.protocol === 'https' || process.env.NODE_ENV === 'production');
  res.json({ user });
}));

app.get('/api/auth/me', asyncHandler(async (req, res) => {
  const userId = auth.getSessionUserId(req);
  const user = userId ? await db.getUserById(userId) : null;
  if (!user) return res.status(401).json({ error: 'Não autenticado.' });
  res.json({ user });
}));

app.post('/api/auth/logout', (req, res) => {
  auth.clearSessionCookie(res);
  res.json({ ok: true });
});

// ---------- AUTH: CADASTRO E LOGIN POR E-MAIL/SENHA ----------
app.post('/api/auth/register', asyncHandler(async (req, res) => {
  if (!auth.rateLimit(`register:${requestIp(req)}`, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
  }

  const { name, email, password } = req.body || {};
  const emailNorm = auth.normalizeEmail(email);

  if (!name || !name.trim()) return res.status(400).json({ error: 'Informe seu nome.' });
  if (!emailNorm || !emailNorm.includes('@')) return res.status(400).json({ error: 'Informe um e-mail válido.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'A senha precisa ter pelo menos 6 caracteres.' });

  const existing = await db.getUserByEmail(emailNorm);
  if (existing) return res.status(409).json({ error: 'Esse e-mail já está cadastrado. Faça login.' });

  const user = await db.createEmailUser({ name: name.trim(), email: emailNorm, passwordHash: auth.hashPassword(password) });
  auth.setSessionCookie(res, user.id, req.protocol === 'https' || process.env.NODE_ENV === 'production');
  res.status(201).json({ user });
}));

app.post('/api/auth/login', asyncHandler(async (req, res) => {
  if (!auth.rateLimit(`login:${requestIp(req)}`, 10, 10 * 60 * 1000)) {
    return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.' });
  }

  const { email, password } = req.body || {};
  const emailNorm = auth.normalizeEmail(email);
  if (!emailNorm || !password) return res.status(400).json({ error: 'Informe e-mail e senha.' });

  const authRow = await db.getUserAuthByEmail(emailNorm);
  if (!authRow || !authRow.passwordHash) {
    if (authRow && authRow.hasGoogle) {
      return res.status(401).json({ error: 'Essa conta usa login com Google. Entre pelo botão do Google.' });
    }
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  if (!auth.verifyPassword(password, authRow.passwordHash)) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  const user = await db.getUserById(authRow.id);
  auth.setSessionCookie(res, user.id, req.protocol === 'https' || process.env.NODE_ENV === 'production');
  res.json({ user });
}));

// ---------- CLIENTE: MEUS PEDIDOS ----------
app.get('/api/me/orders', requireUser, asyncHandler(async (req, res) => {
  res.json(await db.getOrdersByUser(req.user.id));
}));

// ---------- PUBLIC: CREATE ORDER (exige login com Google) ----------
app.post('/api/orders', requireUser, asyncHandler(async (req, res) => {
  const { customerName, whatsapp, email: customerEmail, paymentMethod, items } = req.body || {};

  if (!customerName || !whatsapp || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Preencha nome, WhatsApp e adicione ao menos um item.' });
  }

  const products = await db.getProducts();
  const resolvedItems = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Produto não encontrado: ${item.productId}` });
    }

    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    const storage = (product.storageOptions || []).find((s) => s.label === item.storageLabel);
    const delta = storage ? storage.delta : 0;

    if (product.presale) {
      const unitPrice = item.reservationOnly ? product.depositPrice : product.basePrice + delta;
      total += unitPrice * qty;
      resolvedItems.push({
        productId: product.id,
        name: product.name,
        variant: `${item.reservationOnly ? 'Reserva' : 'Pré-venda'} · ${item.storageLabel || ''}`.trim(),
        unitPrice,
        qty
      });
      product.reservationsCount = (product.reservationsCount || 0) + qty;
      continue;
    }

    const cond = item.condition === 'recon' ? 'recon' : 'novo';
    const condData = product[cond];

    if (!condData || condData.available === false) {
      return res.status(400).json({ error: `${product.name} (${conditionLabel(cond)}) não está disponível no momento.` });
    }
    if (condData.stock < qty) {
      return res.status(409).json({
        error: `Estoque insuficiente para ${product.name} (${conditionLabel(cond)}). Restam ${condData.stock} unidade(s).`
      });
    }

    const unitPrice = condData.price + delta;
    total += unitPrice * qty;
    resolvedItems.push({
      productId: product.id,
      name: product.name,
      variant: `${conditionLabel(cond)} · ${item.storageLabel || ''}`.trim(),
      unitPrice,
      qty
    });
    condData.stock -= qty;
  }

  await db.saveProducts(products);

  const usePaymentGateway = mercadopago.isConfigured();
  // Cartão com Brick embutido é cobrado direto pelo /api/payments/card, logo em seguida —
  // esse pedido fica "aguardando pagamento" até a cobrança confirmar, nunca é dado como concluído aqui.
  const useEmbeddedCard = (paymentMethod === 'cartao') && mercadopago.isCardPaymentConfigured();

  const order = {
    orderNumber: await db.nextOrderNumber(),
    customerName,
    whatsapp,
    email: customerEmail || req.user.email,
    paymentMethod: paymentMethod || 'pix',
    items: resolvedItems,
    total,
    status: usePaymentGateway ? 'aguardando pagamento' : 'recebido',
    createdAt: new Date().toISOString(),
    paymentStatus: usePaymentGateway ? 'pendente' : 'manual',
    userId: req.user.id
  };

  const saved = await db.createOrder(order);
  mailer.sendOrderConfirmationEmail(saved).catch(() => {});

  if (!usePaymentGateway) {
    return res.status(201).json(saved);
  }

  if (useEmbeddedCard) {
    return res.status(201).json({ ...saved, checkoutUrl: null, embeddedCard: true });
  }

  try {
    const { checkoutUrl } = await mercadopago.createPreference(saved, getBaseUrl(req));
    res.status(201).json({ ...saved, checkoutUrl });
  } catch (err) {
    console.error('Erro ao criar preferência de pagamento no Mercado Pago:', err);
    // O pedido já existe (status "aguardando pagamento"); o cliente pode tentar de novo
    // ou o time pode confirmar manualmente. Não derruba o checkout por falha do gateway.
    res.status(201).json({ ...saved, checkoutUrl: null, paymentError: true });
  }
}));

// ---------- PUBLIC: PAYMENT CONFIG (chave pública para o Brick de cartão) ----------
app.get('/api/payments/config', (req, res) => {
  res.json({
    embeddedCard: mercadopago.isCardPaymentConfigured(),
    publicKey: mercadopago.isCardPaymentConfigured() ? mercadopago.getPublicKey() : null
  });
});

// ---------- PUBLIC: CHARGE CARD (Custom Checkout — token gerado no navegador) ----------
app.post('/api/payments/card', asyncHandler(async (req, res) => {
  if (!mercadopago.isCardPaymentConfigured()) {
    return res.status(400).json({ error: 'Pagamento por cartão indisponível no momento.' });
  }

  const { orderNumber, token, paymentMethodId, installments, issuerId, payerEmail, docType, docNumber } = req.body || {};
  if (!orderNumber || !token || !paymentMethodId || !payerEmail) {
    return res.status(400).json({ error: 'Dados de pagamento incompletos.' });
  }

  const order = await db.getOrderByNumber(orderNumber);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (order.paymentStatus === 'approved') {
    return res.json({ status: 'approved', statusDetail: 'already_approved', order });
  }

  try {
    const payment = await mercadopago.chargeCard({
      orderNumber, amount: order.total, token, paymentMethodId, installments, issuerId, payerEmail, docType, docNumber
    });

    const status = mercadopago.mapPaymentStatusToOrderStatus(payment.status);
    const updated = await db.updateOrderPayment(orderNumber, {
      paymentId: String(payment.id),
      paymentStatus: payment.status,
      status
    });

    res.json({ status: payment.status, statusDetail: payment.status_detail, order: updated });
  } catch (err) {
    console.error('Erro ao cobrar cartão no Mercado Pago:', err);
    res.status(402).json({ error: 'Não foi possível processar o pagamento. Verifique os dados do cartão e tente novamente.' });
  }
}));

// ---------- PUBLIC: ORDER LOOKUP ----------
app.get('/api/orders/:orderNumber', asyncHandler(async (req, res) => {
  const order = await db.getOrderByNumber(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  res.json(order);
}));

// ---------- ADMIN: ORDERS ----------
app.get('/api/admin/orders', requireAdmin, asyncHandler(async (req, res) => {
  res.json(await db.getOrders());
}));

app.patch('/api/admin/orders/:orderNumber/status', requireAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Informe o novo status.' });

  const order = await db.getOrderByNumber(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const updated = await db.updateOrderStatus(req.params.orderNumber, status);
  res.json(updated);
}));

// ---------- ADMIN: PRODUCTS (preço, preço cheio, estoque, disponibilidade, pré-venda) ----------
app.patch('/api/admin/products/:id', requireAdmin, asyncHandler(async (req, res) => {
  const products = await db.getProducts();
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });

  const body = req.body || {};

  if (product.presale) {
    if (body.basePrice != null) product.basePrice = Math.max(0, Number(body.basePrice) || 0);
    if (body.depositPrice != null) product.depositPrice = Math.max(0, Number(body.depositPrice) || 0);
    if (body.reservationLimit != null) product.reservationLimit = Math.max(0, parseInt(body.reservationLimit, 10) || 0);
  } else {
    for (const cond of ['novo', 'recon']) {
      const data = body[cond];
      if (!data || !product[cond]) continue;
      if (data.price != null) product[cond].price = Math.max(0, Number(data.price) || 0);
      if (data.de != null) product[cond].de = Math.max(0, Number(data.de) || 0);
      if (data.stock != null) product[cond].stock = Math.max(0, parseInt(data.stock, 10) || 0);
      if (data.available != null) product[cond].available = !!data.available;
    }
  }

  await db.saveProducts(products);
  res.json(product);
}));

// ---------- ADMIN: USERS (clientes cadastrados via Google) ----------
app.get('/api/admin/users', requireAdmin, asyncHandler(async (req, res) => {
  res.json(await db.getUsers());
}));

// ---------- ADMIN: EXPORT (backup completo dos dados em JSON) ----------
app.get('/api/admin/export', requireAdmin, asyncHandler(async (req, res) => {
  const [products, orders, users] = await Promise.all([db.getProducts(), db.getOrders(), db.getUsers()]);
  const filename = `luxiphones-backup-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json({ exportedAt: new Date().toISOString(), products, orders, users });
}));

// ---------- PAYMENTS: MERCADO PAGO WEBHOOK ----------
app.post('/api/payments/webhook', asyncHandler(async (req, res) => {
  if (!mercadopago.isConfigured()) return res.sendStatus(200);

  const type = req.body?.type || req.body?.topic || req.query.type || req.query.topic;
  const dataId = req.body?.data?.id || req.query.id || req.query['data.id'];

  if (type !== 'payment' || !dataId) {
    return res.sendStatus(200);
  }

  if (!mercadopago.verifyWebhookSignature(req, dataId)) {
    console.warn('Webhook do Mercado Pago com assinatura inválida — ignorado.');
    return res.sendStatus(200);
  }

  try {
    const payment = await mercadopago.getPayment(dataId);
    const orderNumber = payment.external_reference;
    if (!orderNumber) return res.sendStatus(200);

    const status = mercadopago.mapPaymentStatusToOrderStatus(payment.status);
    await db.updateOrderPayment(orderNumber, {
      paymentId: String(dataId),
      paymentStatus: payment.status,
      status
    });
  } catch (err) {
    console.error('Erro ao processar webhook do Mercado Pago:', err);
  }

  res.sendStatus(200);
}));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

db.ready.then(() => {
  app.listen(PORT, () => {
    console.log(`Lux iPhones rodando em http://localhost:${PORT} (banco: ${db.backend})`);
    console.log(`Painel admin em http://localhost:${PORT}/admin.html`);
  });
});
