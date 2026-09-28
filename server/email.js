// Envio de e-mail de confirmação de pedido via SMTP do Gmail (Nodemailer).
// Sem EMAIL_USER/EMAIL_APP_PASSWORD configurados, o envio é ignorado silenciosamente
// (o pedido continua funcionando normalmente pelo fluxo manual/WhatsApp).
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || '';
const STORE_NAME = 'Lux iPhones';

let transporter = null;
function isEmailConfigured() {
  return !!(EMAIL_USER && EMAIL_APP_PASSWORD);
}

function getTransporter() {
  if (!transporter && isEmailConfigured()) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD }
    });
  }
  return transporter;
}

function formatBRL(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const STATUS_MESSAGES = {
  'aguardando pagamento': 'Estamos aguardando a confirmação do seu pagamento. Assim que for aprovado, você recebe um novo aviso por aqui.',
  recebido: 'Recebemos seu pedido! Nossa equipe vai confirmar o pagamento pelo WhatsApp em até 1 hora útil.'
};

function orderConfirmationHTML(order) {
  const itemsRows = order.items.map((i) => `
    <tr>
      <td style="padding:8px 0;color:#565a68;font-size:14px;">${i.qty}x ${i.name} <span style="color:#8a8f9e;">(${i.variant})</span></td>
      <td style="padding:8px 0;text-align:right;font-size:14px;font-weight:600;">${formatBRL(i.unitPrice * i.qty)}</td>
    </tr>
  `).join('');

  const statusMsg = STATUS_MESSAGES[order.status] || 'Seu pedido está sendo processado pela nossa equipe.';

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;background:#ffffff;">
    <div style="background:#12141c;padding:24px 30px;">
      <span style="color:#ffffff;font-size:20px;font-weight:bold;">Lux <span style="color:#8b5cf6;">iPhones</span></span>
    </div>
    <div style="padding:30px;">
      <h1 style="font-size:20px;margin:0 0 8px;color:#12141c;">Olá, ${order.customerName.split(' ')[0]}! 👋</h1>
      <p style="color:#565a68;font-size:14px;line-height:1.6;margin:0 0 20px;">${statusMsg}</p>

      <div style="background:#f7f7fa;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
        <p style="margin:0;font-size:13px;color:#8a8f9e;">Número do pedido</p>
        <p style="margin:2px 0 0;font-size:18px;font-weight:bold;color:#12141c;">#${order.orderNumber}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        ${itemsRows}
      </table>
      <table style="width:100%;border-collapse:collapse;border-top:1px dashed #e6e8ee;padding-top:10px;">
        <tr>
          <td style="padding-top:10px;font-size:15px;font-weight:bold;">Total</td>
          <td style="padding-top:10px;text-align:right;font-size:15px;font-weight:bold;">${formatBRL(order.total)}</td>
        </tr>
      </table>

      <p style="color:#8a8f9e;font-size:12px;margin-top:28px;">Dúvidas? Responda este e-mail ou chame a gente pelo WhatsApp que você informou no pedido.</p>
    </div>
    <div style="background:#f7f7fa;padding:16px 30px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#8a8f9e;">© ${new Date().getFullYear()} Lux iPhones Store</p>
    </div>
  </div>`;
}

async function sendOrderConfirmationEmail(order) {
  if (!order.email) return;
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: `"${STORE_NAME}" <${EMAIL_USER}>`,
      to: order.email,
      subject: `Pedido #${order.orderNumber} recebido — ${STORE_NAME}`,
      html: orderConfirmationHTML(order)
    });
  } catch (err) {
    console.error(`Falha ao enviar e-mail de confirmação do pedido #${order.orderNumber}:`, err.message);
  }
}

module.exports = { isEmailConfigured, sendOrderConfirmationEmail };
