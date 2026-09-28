const express = require('express');
const path = require('path');
const db = require('./database');
const mercadopago = require('./payments/mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'novacell-admin';

const ROOT_DIR = path.join(__dirname, '..');

function getBaseUrl(req) {
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `${req.protocol}://${req.get('host')}`
  ).replace(/\/$/, '');
}

app.use(express.json());
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

function conditionLabel(cond) {
  return cond === 'recon' ? 'Recondicionado' : 'Novo';
}

// ---------- PUBLIC: PRODUCTS ----------
app.get('/api/products', asyncHandler(async (req, res) => {
  res.json(await db.getProducts());
}));

// ---------- PUBLIC: CREATE ORDER ----------
app.post('/api/orders', asyncHandler(async (req, res) => {
  const { customerName, whatsapp, paymentMethod, items } = req.body || {};

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

  const order = {
    orderNumber: await db.nextOrderNumber(),
    customerName,
    whatsapp,
    paymentMethod: paymentMethod || 'pix',
    items: resolvedItems,
    total,
    status: usePaymentGateway ? 'aguardando pagamento' : 'recebido',
    createdAt: new Date().toISOString(),
    paymentStatus: usePaymentGateway ? 'pendente' : 'manual'
  };

  const saved = await db.createOrder(order);

  if (!usePaymentGateway) {
    return res.status(201).json(saved);
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

// ---------- ADMIN: STOCK ----------
app.patch('/api/admin/products/:id/stock', requireAdmin, asyncHandler(async (req, res) => {
  const { condition, stock } = req.body || {};
  const products = await db.getProducts();
  const product = products.find((p) => p.id === req.params.id);

  if (!product) return res.status(404).json({ error: 'Produto não encontrado.' });
  if (!product[condition]) return res.status(400).json({ error: 'Condição inválida.' });

  product[condition].stock = Math.max(0, parseInt(stock, 10) || 0);
  await db.saveProducts(products);
  res.json(product);
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
    console.log(`NovaCell rodando em http://localhost:${PORT} (banco: ${db.backend})`);
    console.log(`Painel admin em http://localhost:${PORT}/admin.html`);
  });
});
