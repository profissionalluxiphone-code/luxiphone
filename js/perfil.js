// Página "Minha conta": mostra o formulário de login/cadastro (componente
// compartilhado de script.js) quando deslogado, ou os dados do cliente e o
// histórico de pedidos quando logado.
const PAYMENT_STATUS_LABELS = {
  manual: '💬 Pagamento a combinar', pendente: '⏳ Pendente', approved: '✅ Aprovado',
  pending: '⏳ Pendente', in_process: '⏳ Em análise', rejected: '❌ Recusado',
  cancelled: '✖ Cancelado', refunded: '↩️ Estornado', charged_back: '↩️ Chargeback'
};

function initials(name) {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

function formatDatePT(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch (err) {
    return iso;
  }
}

function ordersHTML(orders) {
  return `<div class="order-list">${orders.map((o) => `
    <article class="order-card">
      <div class="order-card-head">
        <strong>Pedido #${o.orderNumber}</strong>
        <span class="order-status-badge">${o.status}</span>
      </div>
      <div class="order-card-items">${o.items.map((i) => `${i.qty}x ${i.name} <span>(${i.variant})</span>`).join('<br>')}</div>
      <div class="order-card-foot">
        <span>${formatDatePT(o.createdAt)}</span>
        <strong>${formatBRL(o.total)}</strong>
      </div>
      <div class="order-card-payment">${PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus || '-'}</div>
    </article>
  `).join('')}</div>`;
}

async function renderProfile() {
  const root = document.getElementById('profileRoot');

  if (!currentUser) {
    root.innerHTML = `
      <div class="profile-card profile-auth-card">
        <h1>Minha conta</h1>
        <div id="profileAuthMount"></div>
      </div>
    `;
    mountAuthUI('profileAuthMount', {
      introText: 'Entre ou crie sua conta para ver seus dados e acompanhar seus pedidos.',
      onSuccess: () => { updateAccountLink(); renderProfile(); }
    });
    return;
  }

  root.innerHTML = `
    <div class="profile-card profile-header">
      <div class="profile-avatar">${initials(currentUser.name)}</div>
      <div class="profile-header-info">
        <h1>${currentUser.name}</h1>
        <p>${currentUser.email}</p>
        <p class="profile-meta">Cliente desde ${formatDatePT(currentUser.createdAt)}${currentUser.hasGoogle ? ' · Login com Google' : ''}</p>
      </div>
      <button type="button" class="logout-link" id="profileLogoutBtn">Sair da conta</button>
    </div>

    <div class="profile-card profile-orders">
      <h2>Meus pedidos</h2>
      <div id="profileOrdersList"><p class="empty-msg">Carregando pedidos...</p></div>
    </div>
  `;

  document.getElementById('profileLogoutBtn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    currentUser = null;
    updateAccountLink();
    renderProfile();
  });

  const listEl = document.getElementById('profileOrdersList');
  try {
    const resp = await fetch('/api/me/orders');
    if (resp.status === 401) { currentUser = null; updateAccountLink(); renderProfile(); return; }
    const orders = resp.ok ? await resp.json() : [];
    listEl.innerHTML = orders.length
      ? ordersHTML(orders)
      : '<p class="empty-msg">Você ainda não fez nenhum pedido. <a href="index.html#catalogo">Ver catálogo</a></p>';
  } catch (err) {
    listEl.innerHTML = '<p class="empty-msg">Não foi possível carregar seus pedidos agora. Tente recarregar a página.</p>';
  }
}

async function initProfilePage() {
  await loadAuthConfig();
  await loadCurrentUser();
  renderProfile();
}

initProfilePage();
