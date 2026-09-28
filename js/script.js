// ================= HELPERS =================
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ================= HEADER: scroll shadow + mobile menu =================
const siteHeader = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  siteHeader.classList.toggle('scrolled', window.scrollY > 10);
});

const hamburgerBtn = document.getElementById('hamburgerBtn');
const mainNav = document.getElementById('mainNav');
hamburgerBtn.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('[data-close-menu]').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

// ================= HEADER SEARCH =================
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  document.querySelectorAll('.product-card').forEach(card => {
    const model = card.dataset.model.toLowerCase();
    card.classList.toggle('hidden', q.length > 0 && !model.includes(q));
  });
});

// ================= PRODUCT CARDS: condition + storage pricing =================
function recalcCard(card) {
  const activeBtn = card.querySelector('.cond-btn.active');
  const cond = activeBtn ? activeBtn.dataset.cond : 'novo';
  const storageDelta = parseInt(card.querySelector('.storage-select').value, 10) || 0;

  const base = cond === 'recon' ? parseInt(card.dataset.recon, 10) : parseInt(card.dataset.novo, 10);
  const baseDe = cond === 'recon' ? parseInt(card.dataset.reconDe, 10) : parseInt(card.dataset.novoDe, 10);

  const price = base + storageDelta;
  const priceDe = baseDe + storageDelta;
  const installment = price / 10;

  card.querySelector('.price-de').textContent = formatBRL(priceDe);
  card.querySelector('.price-por').textContent = formatBRL(price);
  card.querySelector('.price-installment').textContent = `ou 10x de ${formatBRL(installment)} sem juros`;

  const discountBadge = card.querySelector('.badge-discount');
  if (discountBadge && priceDe > 0) {
    const pct = Math.round((1 - price / priceDe) * 100);
    discountBadge.textContent = `-${pct}%`;
  }

  card.dataset.currentPrice = price;

  // Reflect live stock (populated by loadLiveStock) on the add-to-cart button
  const stockKey = cond === 'recon' ? 'reconStock' : 'novoStock';
  const addBtn = card.querySelector('.btn-add-cart');
  const stockNote = card.querySelector('.stock-note');
  if (card.dataset[stockKey] !== undefined) {
    const stock = parseInt(card.dataset[stockKey], 10);
    if (stock <= 0) {
      addBtn.disabled = true;
      addBtn.textContent = 'Esgotado';
      stockNote.textContent = '✖ Sem estoque no momento';
      stockNote.style.color = 'var(--danger)';
    } else {
      addBtn.disabled = false;
      addBtn.textContent = 'Adicionar ao carrinho';
      stockNote.textContent = `✔ Em estoque (${stock} unid.) · Envio em 24h`;
      stockNote.style.color = 'var(--success)';
    }
  }
}

// ================= LIVE CATALOG (backend) =================
let liveProducts = [];

async function loadLiveStock() {
  if (location.protocol === 'file:') return; // no backend to talk to when opened as a plain file
  try {
    const resp = await fetch('/api/products');
    if (!resp.ok) return;
    liveProducts = await resp.json();

    document.querySelectorAll('.product-card[data-product-id]').forEach((card) => {
      const product = liveProducts.find((p) => p.id === card.dataset.productId);
      if (!product) return;

      card.dataset.novo = product.novo.price;
      card.dataset.novoDe = product.novo.de;
      card.dataset.novoStock = product.novo.stock;
      if (product.recon && product.recon.available) {
        card.dataset.recon = product.recon.price;
        card.dataset.reconDe = product.recon.de;
        card.dataset.reconStock = product.recon.stock;
        card.dataset.reconAvailable = 'true';
      } else {
        card.dataset.reconAvailable = 'false';
        const reconBtn = card.querySelector('.cond-btn[data-cond="recon"]');
        if (reconBtn) reconBtn.disabled = true;
      }
      recalcCard(card);
    });

    const presale = liveProducts.find((p) => p.presale);
    if (presale) {
      PRESALE_BASE = presale.basePrice;
      PRESALE_DEPOSIT = presale.depositPrice;
      updatePresalePrice();
      const remaining = Math.max(0, (presale.reservationLimit || 0) - (presale.reservationsCount || 0));
      const scarcityEl = document.getElementById('presaleScarcity');
      if (scarcityEl && presale.reservationLimit) {
        scarcityEl.textContent = `⚡ ${remaining} de ${presale.reservationLimit} vagas de reserva antecipada disponíveis`;
      }
    }
  } catch (err) {
    // Backend not running (e.g. page opened directly via file://) — keep static demo prices.
  }
}

document.querySelectorAll('.product-card').forEach(card => {
  recalcCard(card);

  card.querySelectorAll('.cond-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      card.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      recalcCard(card);
    });
  });

  card.querySelector('.storage-select').addEventListener('change', () => recalcCard(card));

  card.querySelector('.btn-add-cart').addEventListener('click', () => {
    const addBtn = card.querySelector('.btn-add-cart');
    if (addBtn.disabled) return;

    const condRaw = card.querySelector('.cond-btn.active').dataset.cond;
    const cond = condRaw === 'recon' ? 'Recondicionado' : 'Novo';
    const storageLabel = card.querySelector('.storage-select').selectedOptions[0].textContent;
    const price = parseInt(card.dataset.currentPrice, 10);
    addToCart({
      id: `${card.dataset.productId}-${condRaw}-${storageLabel}`,
      productId: card.dataset.productId,
      condition: condRaw,
      storageLabel,
      name: card.dataset.model,
      variant: `${cond} · ${storageLabel}`,
      price,
      initials: card.dataset.model.replace('iPhone ', '')
    });
    flashAdded(addBtn);
    showToast('🛒', 'Adicionado ao carrinho!', `${card.dataset.model} (${cond})`);
  });
});

function flashAdded(btn) {
  const original = btn.textContent;
  btn.textContent = '✔ Adicionado!';
  btn.classList.add('added');
  setTimeout(() => { btn.textContent = original; btn.classList.remove('added'); }, 1400);
}

// ================= FILTER TABS =================
const filterTabs = document.querySelectorAll('.filter-tab');
filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;

    if (filter === 'presale-link') {
      document.getElementById('presale').scrollIntoView({ behavior: 'smooth' });
      return;
    }

    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    document.querySelectorAll('.product-card').forEach(card => {
      const reconAvailable = card.dataset.reconAvailable === 'true';

      if (filter === 'todos') {
        card.classList.remove('hidden');
      } else if (filter === 'novo') {
        card.classList.remove('hidden');
        setCondition(card, 'novo');
      } else if (filter === 'recon') {
        if (reconAvailable) {
          card.classList.remove('hidden');
          setCondition(card, 'recon');
        } else {
          card.classList.add('hidden');
        }
      }
    });
    searchInput.value = '';
  });
});

function setCondition(card, cond) {
  const btn = card.querySelector(`.cond-btn[data-cond="${cond}"]`);
  if (!btn || btn.disabled) return;
  card.querySelectorAll('.cond-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  recalcCard(card);
}

// ================= SORT =================
document.getElementById('sortSelect').addEventListener('change', (e) => {
  const grid = document.getElementById('productGrid');
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const mode = e.target.value;

  cards.sort((a, b) => {
    if (mode === 'menor') return a.dataset.currentPrice - b.dataset.currentPrice;
    if (mode === 'maior') return b.dataset.currentPrice - a.dataset.currentPrice;
    return 0;
  });

  cards.forEach(card => grid.appendChild(card));
});

// ================= BLACK FRIDAY: countdown =================
const bfEndDate = new Date('2026-12-01T23:59:59').getTime();
function updateBFCountdown() {
  const now = Date.now();
  const diff = Math.max(0, bfEndDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('bfDays').textContent = String(days).padStart(2, '0');
  document.getElementById('bfHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('bfMin').textContent = String(mins).padStart(2, '0');
  document.getElementById('bfSec').textContent = String(secs).padStart(2, '0');
}
updateBFCountdown();
setInterval(updateBFCountdown, 1000);

// ================= PRESALE: countdown =================
const launchDate = new Date('2026-10-20T00:00:00').getTime();
function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, launchDate - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
  document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
  document.getElementById('cdMin').textContent = String(mins).padStart(2, '0');
  document.getElementById('cdSec').textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ================= PRESALE: price + actions =================
let PRESALE_BASE = 7499;
let PRESALE_DEPOSIT = 299;
const presaleStorageSelect = document.getElementById('presaleStorage');
function updatePresalePrice() {
  const delta = parseInt(presaleStorageSelect.value, 10) || 0;
  const price = PRESALE_BASE + delta;
  document.getElementById('presalePrice').textContent = formatBRL(price);
  document.querySelector('.presale-price-block .price-installment').textContent =
    `ou 12x de ${formatBRL(price / 12)} sem juros`;
}
presaleStorageSelect.addEventListener('change', updatePresalePrice);
updatePresalePrice();

document.getElementById('reserveDepositBtn').addEventListener('click', () => {
  const storageLabel = presaleStorageSelect.selectedOptions[0].textContent;
  addToCart({
    id: `iphone-18-reserva-${storageLabel}`,
    productId: 'iphone-18',
    reservationOnly: true,
    storageLabel,
    name: 'iPhone 18 (Reserva)',
    variant: `Depósito de reserva · ${storageLabel}`,
    price: PRESALE_DEPOSIT,
    initials: '18'
  });
  openCart();
  showToast('⚡', 'Reserva confirmada!', `Depósito de ${formatBRL(PRESALE_DEPOSIT)} adicionado ao carrinho`);
});

document.getElementById('buyFullPresaleBtn').addEventListener('click', () => {
  const storageLabel = presaleStorageSelect.selectedOptions[0].textContent;
  const delta = parseInt(presaleStorageSelect.value, 10) || 0;
  addToCart({
    id: `iphone-18-full-${storageLabel}`,
    productId: 'iphone-18',
    reservationOnly: false,
    storageLabel,
    name: 'iPhone 18 (Pré-venda)',
    variant: `Valor cheio · ${storageLabel}`,
    price: PRESALE_BASE + delta,
    initials: '18'
  });
  openCart();
});

// ================= TESTIMONIAL CAROUSEL =================
const track = document.getElementById('testimonialTrack');
document.getElementById('carouselPrev').addEventListener('click', () => track.scrollBy({ left: -340, behavior: 'smooth' }));
document.getElementById('carouselNext').addEventListener('click', () => track.scrollBy({ left: 340, behavior: 'smooth' }));

// ================= CART =================
let cart = [];
try { cart = JSON.parse(localStorage.getItem('novacell_cart')) || []; } catch (e) { cart = []; }

const cartItemsEl = document.getElementById('cartItems');
const cartEmptyMsg = document.getElementById('cartEmptyMsg');
const cartSubtotalEl = document.getElementById('cartSubtotal');
const cartCountEl = document.getElementById('cartCount');
const modalTotalEl = document.getElementById('modalTotal');

function saveCart() {
  try { localStorage.setItem('novacell_cart', JSON.stringify(cart)); } catch (e) {}
}

function addToCart(item) {
  const existing = cart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCountEl.textContent = totalQty;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(cartEmptyMsg);
    cartEmptyMsg.style.display = 'block';
  } else {
    cartEmptyMsg.style.display = 'none';
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-line">
        <div class="cart-line-thumb">${item.initials}</div>
        <div class="cart-line-info">
          <strong>${item.name} ${item.qty > 1 ? `× ${item.qty}` : ''}</strong>
          <span>${item.variant}</span>
          <button class="cart-line-remove" data-id="${item.id}">Remover</button>
        </div>
        <div class="cart-line-price">${formatBRL(item.price * item.qty)}</div>
      </div>
    `).join('');

    cartItemsEl.querySelectorAll('.cart-line-remove').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }

  const total = cartTotal();
  cartSubtotalEl.textContent = formatBRL(total);
  modalTotalEl.textContent = formatBRL(total);
}
renderCart();

// ================= CART DRAWER OPEN/CLOSE =================
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('active');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('active');
}
document.getElementById('cartOpenBtn').addEventListener('click', openCart);
document.getElementById('cartCloseBtn').addEventListener('click', closeCart);
overlay.addEventListener('click', () => { closeCart(); closeCheckout(); });

// ================= CHECKOUT MODAL =================
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutStep1 = document.getElementById('checkoutStep1');
const checkoutStep2 = document.getElementById('checkoutStep2');

function openCheckout() {
  if (cart.length === 0) {
    showToast('🛒', 'Carrinho vazio', 'Adicione um produto antes de finalizar a compra');
    return;
  }
  checkoutOverlay.classList.add('active');
  checkoutStep1.hidden = false;
  checkoutStep2.hidden = true;
}
function closeCheckout() {
  checkoutOverlay.classList.remove('active');
}
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('checkoutCloseBtn').addEventListener('click', closeCheckout);
checkoutOverlay.addEventListener('click', (e) => { if (e.target === checkoutOverlay) closeCheckout(); });

const SUCCESS_VARIANTS = {
  manual: {
    icon: '✅',
    title: 'Pedido recebido!',
    message: 'Nossa equipe entrará em contato pelo WhatsApp em até 1 hora útil para confirmar o pagamento e o prazo de entrega.'
  },
  success: {
    icon: '✅',
    title: 'Pagamento aprovado!',
    message: 'Recebemos a confirmação do Mercado Pago. Seu pedido já entrou na fila de separação — em breve você recebe as novidades pelo WhatsApp.'
  },
  pending: {
    icon: '⏳',
    title: 'Pagamento em análise',
    message: 'Assim que o Pix/boleto for compensado ou o cartão for aprovado, atualizamos seu pedido automaticamente. Você pode acompanhar pelo WhatsApp.'
  },
  failure: {
    icon: '⚠️',
    title: 'Pagamento não aprovado',
    message: 'Não foi possível concluir o pagamento. Você pode tentar novamente pelo carrinho ou escolher outra forma de pagamento.'
  }
};

function finishCheckoutUI(orderNumber, variant = 'manual') {
  const info = SUCCESS_VARIANTS[variant] || SUCCESS_VARIANTS.manual;
  document.getElementById('orderNumber').textContent = `#${orderNumber}`;
  document.getElementById('successIcon').textContent = info.icon;
  document.getElementById('successTitle').textContent = info.title;
  document.getElementById('successMessage').textContent = info.message;
  checkoutOverlay.classList.add('active');
  checkoutStep1.hidden = true;
  checkoutStep2.hidden = false;
  cart = [];
  saveCart();
  renderCart();
}

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const customerName = form.querySelector('input[type="text"]').value.trim();
  const whatsapp = form.querySelector('input[type="tel"]').value.trim();
  const paymentMethod = form.querySelector('input[name="payment"]:checked').value;
  const submitBtn = form.querySelector('button[type="submit"]');

  const payload = {
    customerName,
    whatsapp,
    paymentMethod,
    items: cart.map((item) => ({
      productId: item.productId,
      condition: item.condition,
      storageLabel: item.storageLabel,
      reservationOnly: !!item.reservationOnly,
      qty: item.qty
    }))
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando pedido...';

  if (location.protocol === 'file:') {
    // No backend to talk to when opened as a plain file — simulate locally.
    const orderNum = 'NC' + Math.floor(100000 + Math.random() * 899999);
    finishCheckoutUI(orderNum);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar pedido';
    return;
  }

  try {
    const resp = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();

    if (!resp.ok) {
      showToast('⚠️', 'Não foi possível concluir', data.error || 'Tente novamente em instantes.');
      loadLiveStock();
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmar pedido';
      return;
    }

    if (data.checkoutUrl) {
      // Pedido criado como "aguardando pagamento" — o cliente conclui Pix/cartão/boleto
      // na página segura do Mercado Pago e volta para o site já com o status atualizado.
      cart = [];
      saveCart();
      renderCart();
      window.location.href = data.checkoutUrl;
      return;
    }

    if (data.paymentError) {
      showToast('⚠️', 'Pagamento indisponível no momento', 'Seu pedido foi registrado; nossa equipe vai te chamar no WhatsApp para combinar o pagamento.');
    }

    finishCheckoutUI(data.orderNumber, 'manual');
    loadLiveStock();
  } catch (err) {
    // Backend not running (e.g. page opened directly via file://) — fall back to a local simulation.
    const orderNum = 'NC' + Math.floor(100000 + Math.random() * 899999);
    finishCheckoutUI(orderNum, 'manual');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = 'Confirmar pedido';
});

document.getElementById('closeSuccessBtn').addEventListener('click', () => {
  closeCheckout();
  closeCart();
});

// ================= NEWSLETTER =================
document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('newsletterMsg').textContent = '✔ Inscrito com sucesso! Fique de olho no seu e-mail.';
  e.target.reset();
});

// ================= TOASTS: manual + social proof feed =================
const toastContainer = document.getElementById('toastContainer');

function showToast(icon, title, subtitle) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><div><strong>${title}</strong><span>${subtitle}</span></div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

const socialProofFeed = [
  ['Mariana R.', 'São Paulo, SP', 'iPhone 13 Recondicionado'],
  ['Carlos E.', 'Rio de Janeiro, RJ', 'iPhone 15 Novo'],
  ['Beatriz A.', 'Belo Horizonte, MG', 'iPhone 18 (Reserva)'],
  ['Lucas M.', 'Fortaleza, CE', 'iPhone 11 Recondicionado'],
  ['Camila V.', 'Curitiba, PR', 'iPhone 14 Novo'],
  ['Diego S.', 'Brasília, DF', 'iPhone 16 Recondicionado'],
  ['Patrícia N.', 'Salvador, BA', 'iPhone 12 Novo'],
];
let feedIndex = 0;
function runSocialProofFeed() {
  const [name, city, product] = socialProofFeed[feedIndex % socialProofFeed.length];
  showToast('✅', `${name} · ${city}`, `Comprou ${product} agora mesmo`);
  feedIndex++;
}
setTimeout(runSocialProofFeed, 6000);
setInterval(runSocialProofFeed, 16000);

// ================= SCROLL REVEAL =================
const revealTargets = document.querySelectorAll(
  '.product-card, .recon-feature, .security-card, .testimonial-card, .faq-item'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => observer.observe(el));

// ================= WHATSAPP FLOAT =================
document.getElementById('whatsappFloat').addEventListener('click', (e) => {
  e.preventDefault();
  showToast('💬', 'Atendimento NovaCell', 'Em um site real, este botão abriria o WhatsApp da loja.');
});

// ================= PAYMENT RETURN: coming back from Mercado Pago checkout =================
async function handlePaymentReturn() {
  const params = new URLSearchParams(location.search);
  const orderNumber = params.get('pedido');
  const status = params.get('status');
  if (!orderNumber || !status) return;

  // Limpa a URL para não reabrir o modal se a pessoa atualizar a página.
  history.replaceState(null, '', location.pathname);

  let variant = status === 'success' ? 'success' : status === 'pending' ? 'pending' : 'failure';

  try {
    const resp = await fetch(`/api/orders/${encodeURIComponent(orderNumber)}`);
    if (resp.ok) {
      const order = await resp.json();
      if (order.paymentStatus === 'approved') variant = 'success';
      else if (order.paymentStatus === 'rejected') variant = 'failure';
    }
  } catch (err) {
    // Mantém o status vindo da URL se não conseguir consultar o pedido.
  }

  finishCheckoutUI(orderNumber, variant);
}

// ================= INIT: pull live prices/stock from the backend, if running =================
loadLiveStock();
handlePaymentReturn();
