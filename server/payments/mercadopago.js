// Integração com o Mercado Pago (Checkout Pro) — Pix, cartão e boleto num único checkout.
// Ativado automaticamente quando MP_ACCESS_TOKEN está definida; caso contrário, o site
// segue no fluxo manual (pedido confirmado por WhatsApp), sem quebrar nada.
const {
  MercadoPagoConfig,
  Preference,
  Payment,
  WebhookSignatureValidator,
  InvalidWebhookSignatureError
} = require('mercadopago');

function isConfigured() {
  return !!process.env.MP_ACCESS_TOKEN;
}

function isTestToken() {
  return (process.env.MP_ACCESS_TOKEN || '').startsWith('TEST-');
}

let client;
function getClient() {
  if (!client) {
    client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
  }
  return client;
}

async function createPreference(order, baseUrl) {
  const preference = new Preference(getClient());
  const result = await preference.create({
    body: {
      items: order.items.map((item) => ({
        title: `${item.name} — ${item.variant}`.slice(0, 256),
        quantity: item.qty,
        unit_price: Number(item.unitPrice),
        currency_id: 'BRL'
      })),
      payer: { name: order.customerName },
      external_reference: order.orderNumber,
      back_urls: {
        success: `${baseUrl}/?pedido=${order.orderNumber}&status=success`,
        pending: `${baseUrl}/?pedido=${order.orderNumber}&status=pending`,
        failure: `${baseUrl}/?pedido=${order.orderNumber}&status=failure`
      },
      auto_return: 'approved',
      notification_url: `${baseUrl}/api/payments/webhook`,
      statement_descriptor: 'NOVACELL'
    }
  });

  return {
    preferenceId: result.id,
    checkoutUrl: isTestToken() ? result.sandbox_init_point : result.init_point
  };
}

async function getPayment(paymentId) {
  const payment = new Payment(getClient());
  return payment.get({ id: paymentId });
}

// status do pagamento no Mercado Pago -> status do pedido na loja
function mapPaymentStatusToOrderStatus(paymentStatus) {
  switch (paymentStatus) {
    case 'approved': return 'pago';
    case 'rejected': return 'pagamento recusado';
    case 'cancelled': return 'cancelado';
    case 'refunded':
    case 'charged_back': return 'estornado';
    default: return 'aguardando pagamento';
  }
}

// Valida a assinatura do webhook (cabeçalhos x-signature / x-request-id) quando
// MP_WEBHOOK_SECRET estiver configurado. Sem o secret, não há como validar —
// nesse caso apenas seguimos em frente (o valor real do pagamento é sempre
// confirmado consultando a API do Mercado Pago, nunca confiando cegamente no payload).
function verifyWebhookSignature(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers['x-signature'],
      xRequestId: req.headers['x-request-id'],
      dataId,
      secret
    });
    return true;
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) return false;
    throw err;
  }
}

module.exports = {
  isConfigured,
  isTestToken,
  createPreference,
  getPayment,
  mapPaymentStatusToOrderStatus,
  verifyWebhookSignature
};
