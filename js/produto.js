// Conteúdo editorial (descrição, especificações, avaliações) de cada modelo.
// Preço/estoque sempre vêm da API (/api/products); a imagem vem do PRODUCT_IMAGES
// compartilhado em script.js (mesmo mapa usado no catálogo e no carrinho).
const PRODUCT_CONTENT = {
  'iphone-11': {
    tagline: 'O clássico que continua entregando ótima experiência por um preço muito mais baixo.',
    description: 'O iPhone 11 é a porta de entrada perfeita para o ecossistema Apple: tela Liquid Retina nítida, câmera dupla versátil para fotos no modo Noturno e um desempenho que ainda hoje dá conta do dia a dia sem esforço.',
    specs: [
      { label: 'Tela', value: '6.1" Liquid Retina HD' },
      { label: 'Chip', value: 'A13 Bionic' },
      { label: 'Câmeras', value: 'Dupla 12MP (grande angular + ultra angular) · Modo Noturno' },
      { label: 'Bateria', value: 'Até 17h de reprodução de vídeo' },
      { label: 'Resistência', value: 'IP68 (água e poeira)' }
    ],
    ratingCount: 842,
    reviews: [
      { name: 'Lucas M.', city: 'Fortaleza, CE', text: 'Comprei recondicionado e chegou parecendo novo. Bateria aguenta o dia todo.' },
      { name: 'Patrícia N.', city: 'Salvador, BA', text: 'Ótimo custo-benefício pra quem só usa WhatsApp e redes sociais. Recomendo.' }
    ]
  },
  'iphone-12': {
    tagline: 'Design com bordas retas, tela Super Retina XDR e a primeira geração 5G da Apple.',
    description: 'O iPhone 12 trouxe uma mudança geracional: Ceramic Shield na tela (4x mais resistente a quedas), OLED Super Retina XDR muito mais nítido e conectividade 5G para downloads e streaming mais rápidos.',
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A14 Bionic' },
      { label: 'Câmeras', value: 'Dupla 12MP · Modo Noturno em todas as lentes' },
      { label: 'Conectividade', value: '5G' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    ratingCount: 1204,
    reviews: [
      { name: 'Diego S.', city: 'Brasília, DF', text: 'Câmera surpreendeu muito pra essa faixa de preço. Vale cada centavo.' },
      { name: 'Camila R.', city: 'Curitiba, PR', text: 'Rápido, tela linda, nunca travou. Melhor compra que fiz esse ano.' }
    ]
  },
  'iphone-13': {
    tagline: 'O queridinho do público: equilíbrio perfeito entre preço, bateria e câmera.',
    description: 'Com sensores maiores, modo Cinematic para vídeos com foco automático e até 2h30 a mais de bateria que o modelo anterior, o iPhone 13 é hoje o modelo mais vendido do nosso catálogo, e não é à toa.',
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A15 Bionic' },
      { label: 'Câmeras', value: 'Dupla 12MP · Modo Cinematic · Modo Fotográfico' },
      { label: 'Bateria', value: 'Até 19h de reprodução de vídeo' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    ratingCount: 2310,
    reviews: [
      { name: 'Rafael T.', city: 'Belo Horizonte, MG', text: 'Bateria dura o dia inteiro mesmo com uso pesado. Câmera ótima pra vídeo.' },
      { name: 'Juliana C.', city: 'Recife, PE', text: 'Já é o segundo que compro aqui pra família. Sempre chega rapidinho.' }
    ]
  },
  'iphone-14': {
    tagline: 'Mais segurança embarcada: Detecção de Acidentes e SOS via satélite.',
    description: 'Além da câmera principal renovada com melhor captação de luz, o iPhone 14 chegou com recursos de segurança inéditos: Detecção de Acidentes e mensagens de emergência via satélite mesmo sem sinal de operadora.',
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A15 Bionic (GPU 5 núcleos)' },
      { label: 'Câmeras', value: 'Dupla 12MP · Photonic Engine' },
      { label: 'Segurança', value: 'Detecção de Acidentes · SOS via satélite' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    ratingCount: 1876,
    reviews: [
      { name: 'Felipe A.', city: 'Porto Alegre, RS', text: 'Comprei pela Detecção de Acidentes mesmo, meu filho dirige e me deixa mais tranquilo.' },
      { name: 'Beatriz L.', city: 'Salvador, BA', text: 'Tela linda, câmera excelente à noite. Superou minhas expectativas.' }
    ]
  },
  'iphone-15': {
    tagline: 'Dynamic Island, câmera de 48MP e USB-C: o salto que todo mundo queria.',
    description: 'O iPhone 15 trouxe a Dynamic Island para a linha padrão, uma câmera principal de 48MP com muito mais detalhe e a troca do conector para USB-C, o mesmo padrão de carregadores de notebooks e outros dispositivos.',
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR com Dynamic Island' },
      { label: 'Chip', value: 'A16 Bionic' },
      { label: 'Câmeras', value: 'Principal 48MP + Ultra angular 12MP' },
      { label: 'Conector', value: 'USB-C' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    ratingCount: 1532,
    reviews: [
      { name: 'Thiago G.', city: 'São Paulo, SP', text: 'USB-C facilitou demais, uso o mesmo carregador do notebook agora.' },
      { name: 'Ana P.', city: 'Curitiba, PR', text: 'Dynamic Island é surpreendentemente útil no dia a dia. Adorei.' }
    ]
  },
  'iphone-16': {
    tagline: 'Construído para Apple Intelligence, com o novo botão de Controle de Câmera.',
    description: 'O iPhone 16 introduz o botão de Controle de Câmera para capturar fotos mais rápido, o botão Ação personalizável e é o primeiro da linha padrão pensado desde o design para os recursos de Apple Intelligence.',
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A18' },
      { label: 'Câmeras', value: 'Fusion 48MP + Ultra angular · Controle de Câmera' },
      { label: 'IA', value: 'Apple Intelligence' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    ratingCount: 968,
    reviews: [
      { name: 'Carlos E.', city: 'Rio de Janeiro, RJ', text: 'Controle de Câmera é ótimo pra fotos rápidas. Chegou muito bem embalado.' },
      { name: 'Larissa M.', city: 'Fortaleza, CE', text: 'Preço justo pro que entrega. Nunca imaginei pagar tão barato num 16.' }
    ]
  },
  'iphone-17': {
    tagline: 'O lançamento mais recente: tela maior, câmera frontal Center Stage e Ceramic Shield 2.',
    description: 'O modelo mais novo da nossa vitrine chega com tela de 6.3" ProMotion, câmera frontal Center Stage que se ajusta sozinha para caber mais pessoas na foto, e a nova geração do Ceramic Shield, com o triplo de resistência a arranhões.',
    specs: [
      { label: 'Tela', value: '6.3" Super Retina XDR ProMotion' },
      { label: 'Chip', value: 'A19' },
      { label: 'Câmeras', value: 'Fusion 48MP + Ultra angular 48MP · Center Stage frontal' },
      { label: 'Armazenamento', value: 'A partir de 256GB' },
      { label: 'Proteção', value: 'Ceramic Shield 2 · IP68' }
    ],
    ratingCount: 311,
    reviews: [
      { name: 'Gabriel S.', city: 'Belo Horizonte, MG', text: 'Lançamento recente e já com desconto bom. Tela ficou incrível.' },
      { name: 'Mariana V.', city: 'Brasília, DF', text: 'Rápido no processamento, câmera frontal nova é um espetáculo em chamadas.' }
    ]
  },
  'iphone-18': {
    tagline: 'Ainda não foi lançado. Garanta o seu em pré-venda com prioridade de entrega.',
    description: 'O iPhone 18 ainda não chegou às lojas, mas você já pode reservar o seu com um pequeno depósito. Preço protegido: se baixar antes do lançamento, você paga o menor valor. Cancelamento gratuito a qualquer momento.',
    specs: [
      { label: 'Lançamento', value: 'Previsto para outubro de 2026' },
      { label: 'Armazenamento', value: '256GB, 512GB ou 1TB' },
      { label: 'Reserva', value: 'A partir de R$ 299 (estornável)' }
    ]
  }
};

function specsTableHTML(specs) {
  return `
    <table class="specs-table">
      <tbody>
        ${specs.map((s) => `<tr><th>${s.label}</th><td>${s.value}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}

function reviewsHTML(reviews) {
  return reviews.map((r) => `
    <article class="pdp-review">
      <div class="pdp-review-head">
        <strong>${r.name}</strong>
        <span>${r.city}</span>
      </div>
      <div class="pdp-review-stars">★★★★★ <span class="verified">✔ Compra verificada</span></div>
      <p>"${r.text}"</p>
    </article>
  `).join('');
}

function pdpRecalc(product, cond, storageDelta) {
  const condData = cond === 'recon' ? product.recon : product.novo;
  const price = condData.price + storageDelta;
  const priceDe = condData.de + storageDelta;
  const pct = priceDe > 0 ? Math.round((1 - price / priceDe) * 100) : 0;
  return { price, priceDe, pct, stock: condData.stock, available: condData.available };
}

async function initProductPage() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const root = document.getElementById('pdpRoot');
  const notFound = document.getElementById('pdpNotFound');

  if (!id || !PRODUCT_CONTENT[id]) {
    root.hidden = true;
    notFound.hidden = false;
    return;
  }

  let product;
  try {
    const resp = await fetch('/api/products');
    const products = await resp.json();
    product = products.find((p) => p.id === id);
  } catch (err) {
    // sem backend disponível
  }

  if (!product) {
    root.hidden = true;
    notFound.hidden = false;
    return;
  }

  const content = PRODUCT_CONTENT[id];
  document.title = `${product.name} - Lux iPhones`;
  document.getElementById('pdpBreadcrumbName').textContent = product.name;
  document.getElementById('pdpName').textContent = product.name;
  document.getElementById('pdpTagline').textContent = content.tagline;
  document.getElementById('pdpDescription').textContent = content.description;
  document.getElementById('pdpSpecs').innerHTML = specsTableHTML(content.specs);

  const reviewsBlock = document.getElementById('pdpReviewsBlock');
  if (content.reviews && content.reviews.length) {
    document.getElementById('pdpRatingCount').textContent = `baseado em ${content.ratingCount.toLocaleString('pt-BR')} avaliações verificadas`;
    document.getElementById('pdpReviewsList').innerHTML = reviewsHTML(content.reviews);
    reviewsBlock.hidden = false;
  } else {
    reviewsBlock.hidden = true;
  }

  if (product.presale) {
    // O modelo ainda não foi lançado: sem foto real, mostra o mockup em CSS
    // (o mesmo usado na seção de pré-venda da home) em vez de uma imagem que não é ele de verdade.
    document.getElementById('pdpImage').hidden = true;
    document.getElementById('pdpPresaleVisual').hidden = false;
    document.getElementById('pdpBuyBox').hidden = true;
    document.getElementById('pdpPresaleBox').hidden = false;
    document.getElementById('pdpPresalePrice').textContent = formatBRL(product.basePrice);
    return;
  }

  document.getElementById('pdpImage').src = PRODUCT_IMAGES[id] || '';
  document.getElementById('pdpImage').alt = product.name;

  document.getElementById('pdpBuyBox').hidden = false;
  document.getElementById('pdpPresaleBox').hidden = true;

  const condToggle = document.getElementById('pdpCondToggle');
  const reconBtn = condToggle.querySelector('[data-cond="recon"]');
  const novoBtn = condToggle.querySelector('[data-cond="novo"]');
  if (!product.recon || !product.recon.available) {
    reconBtn.disabled = true;
    reconBtn.title = 'Não disponível recondicionado para este modelo';
  }

  const storageSelect = document.getElementById('pdpStorageSelect');
  storageSelect.innerHTML = product.storageOptions
    .map((opt) => `<option value="${opt.delta}">${opt.label}</option>`)
    .join('');

  let currentCond = (!product.recon || !product.recon.available) ? 'novo' : 'recon';
  condToggle.querySelectorAll('.cond-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.cond === currentCond));

  function render() {
    const delta = parseInt(storageSelect.value, 10) || 0;
    const { price, priceDe, pct, stock, available } = pdpRecalc(product, currentCond, delta);

    document.getElementById('pdpPriceDe').textContent = formatBRL(priceDe);
    document.getElementById('pdpPricePor').textContent = formatBRL(price);
    document.getElementById('pdpInstallment').textContent = `ou 10x de ${formatBRL(price / 10)} sem juros`;
    document.getElementById('pdpDiscountBadge').textContent = pct > 0 ? `-${pct}%` : '';

    const addBtn = document.getElementById('pdpAddBtn');
    const stockNote = document.getElementById('pdpStockNote');
    if (!available || stock <= 0) {
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

    addBtn.onclick = () => {
      const storageLabel = storageSelect.selectedOptions[0].textContent;
      const condLabel = currentCond === 'recon' ? 'Recondicionado' : 'Novo';
      addToCart({
        id: `${product.id}-${currentCond}-${storageLabel}`,
        productId: product.id,
        condition: currentCond,
        storageLabel,
        name: product.name,
        variant: `${condLabel} · ${storageLabel}`,
        price,
        initials: product.name.replace('iPhone ', '')
      });
      showToast('🛒', 'Adicionado ao carrinho!', `${product.name} (${condLabel})`);
    };
  }

  condToggle.querySelectorAll('.cond-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      currentCond = btn.dataset.cond;
      condToggle.querySelectorAll('.cond-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    });
  });
  storageSelect.addEventListener('change', render);

  render();
}

initProductPage();
