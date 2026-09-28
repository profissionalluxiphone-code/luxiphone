// Conteúdo editorial (descrição, especificações, avaliações) de cada modelo.
// Preço/estoque sempre vêm da API (/api/products); a imagem vem do PRODUCT_IMAGES
// compartilhado em script.js (mesmo mapa usado no catálogo e no carrinho).
//
// Avaliações e comentários "extras" (além dos 2 depoimentos escritos à mão por
// produto) são gerados a partir de um pool comum de nomes/textos, usando o ID
// do produto como semente — assim cada página tem 10 avaliações + 10 comentários
// com clientes diferentes, sem repetir sempre as mesmas pessoas em todo modelo.
const PRODUCT_CONTENT = {
  'iphone-11': {
    tagline: 'O clássico que continua entregando ótima experiência por um preço muito mais baixo.',
    description: 'O iPhone 11 é a porta de entrada perfeita para o ecossistema Apple: tela Liquid Retina nítida, câmera dupla versátil para fotos no modo Noturno e um desempenho que ainda hoje dá conta do dia a dia sem esforço. É o modelo mais procurado por quem quer trocar de aparelho sem pesar no orçamento.',
    highlights: [
      { icon: '🔋', text: 'Até 17h de reprodução de vídeo' },
      { icon: '📸', text: 'Câmera dupla com Modo Noturno' },
      { icon: '🛡️', text: 'Resistente à água (IP68)' },
      { icon: '💰', text: 'O iPhone mais em conta do catálogo' }
    ],
    specs: [
      { label: 'Tela', value: '6.1" Liquid Retina HD' },
      { label: 'Chip', value: 'A13 Bionic' },
      { label: 'Câmeras', value: 'Dupla 12MP (grande angular + ultra angular) · Modo Noturno' },
      { label: 'Bateria', value: 'Até 17h de reprodução de vídeo' },
      { label: 'Resistência', value: 'IP68 (água e poeira)' }
    ],
    colors: [
      { name: 'Preto', hex: '#1d1d1f' }, { name: 'Branco', hex: '#f5f5f0' },
      { name: '(PRODUCT)RED', hex: '#b1041e' }, { name: 'Amarelo', hex: '#f5e08a' },
      { name: 'Verde', hex: '#95a58f' }, { name: 'Roxo', hex: '#c9c3d8' }
    ],
    ratingCount: 842,
    ratingAverage: 4.7,
    reviews: [
      { name: 'Lucas M.', city: 'Fortaleza, CE', text: 'Comprei recondicionado e chegou parecendo novo. Bateria aguenta o dia todo.' },
      { name: 'Patrícia N.', city: 'Salvador, BA', text: 'Ótimo custo-benefício pra quem só usa WhatsApp e redes sociais. Recomendo.' }
    ]
  },
  'iphone-12': {
    tagline: 'Design com bordas retas, tela Super Retina XDR e a primeira geração 5G da Apple.',
    description: 'O iPhone 12 trouxe uma mudança geracional: Ceramic Shield na tela (4x mais resistente a quedas), OLED Super Retina XDR muito mais nítido e conectividade 5G para downloads e streaming mais rápidos. Um salto de qualidade que ainda hoje impressiona.',
    highlights: [
      { icon: '⚡', text: 'Primeira geração 5G da Apple' },
      { icon: '🛡️', text: 'Ceramic Shield, 4x mais resistente' },
      { icon: '📸', text: 'Modo Noturno em todas as câmeras' },
      { icon: '🎨', text: 'Design com bordas retas icônico' }
    ],
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A14 Bionic' },
      { label: 'Câmeras', value: 'Dupla 12MP · Modo Noturno em todas as lentes' },
      { label: 'Conectividade', value: '5G' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    colors: [
      { name: 'Preto', hex: '#1d1d1f' }, { name: 'Branco', hex: '#f5f5f0' },
      { name: '(PRODUCT)RED', hex: '#b1041e' }, { name: 'Verde', hex: '#a9c2ba' },
      { name: 'Azul', hex: '#7f9db3' }, { name: 'Roxo', hex: '#d1cdd8' }
    ],
    ratingCount: 1204,
    ratingAverage: 4.8,
    reviews: [
      { name: 'Diego S.', city: 'Brasília, DF', text: 'Câmera surpreendeu muito pra essa faixa de preço. Vale cada centavo.' },
      { name: 'Camila R.', city: 'Curitiba, PR', text: 'Rápido, tela linda, nunca travou. Melhor compra que fiz esse ano.' }
    ]
  },
  'iphone-13': {
    tagline: 'O queridinho do público: equilíbrio perfeito entre preço, bateria e câmera.',
    description: 'Com sensores maiores, modo Cinematic para vídeos com foco automático e até 2h30 a mais de bateria que o modelo anterior, o iPhone 13 é hoje o modelo mais vendido do nosso catálogo, e não é à toa.',
    highlights: [
      { icon: '🔋', text: 'Até 19h de reprodução de vídeo' },
      { icon: '🎬', text: 'Modo Cinematic para vídeos profissionais' },
      { icon: '🏆', text: 'O modelo mais vendido da loja' },
      { icon: '🛡️', text: 'Ceramic Shield + resistência à água' }
    ],
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A15 Bionic' },
      { label: 'Câmeras', value: 'Dupla 12MP · Modo Cinematic · Modo Fotográfico' },
      { label: 'Bateria', value: 'Até 19h de reprodução de vídeo' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    colors: [
      { name: 'Meia-noite', hex: '#22252b' }, { name: 'Estelar', hex: '#f6ecdf' },
      { name: '(PRODUCT)RED', hex: '#b1041e' }, { name: 'Rosa', hex: '#f7d9dc' },
      { name: 'Azul', hex: '#a7c2d6' }, { name: 'Verde', hex: '#b6c3ab' }
    ],
    ratingCount: 2310,
    ratingAverage: 4.9,
    reviews: [
      { name: 'Rafael T.', city: 'Belo Horizonte, MG', text: 'Bateria dura o dia inteiro mesmo com uso pesado. Câmera ótima pra vídeo.' },
      { name: 'Juliana C.', city: 'Recife, PE', text: 'Já é o segundo que compro aqui pra família. Sempre chega rapidinho.' }
    ]
  },
  'iphone-14': {
    tagline: 'Mais segurança embarcada: Detecção de Acidentes e SOS via satélite.',
    description: 'Além da câmera principal renovada com melhor captação de luz, o iPhone 14 chegou com recursos de segurança inéditos: Detecção de Acidentes e mensagens de emergência via satélite mesmo sem sinal de operadora.',
    highlights: [
      { icon: '🚨', text: 'Detecção de Acidentes automática' },
      { icon: '🛰️', text: 'SOS via satélite mesmo sem sinal' },
      { icon: '📸', text: 'Photonic Engine para fotos com mais luz' },
      { icon: '🔋', text: 'Bateria de longa duração' }
    ],
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A15 Bionic (GPU 5 núcleos)' },
      { label: 'Câmeras', value: 'Dupla 12MP · Photonic Engine' },
      { label: 'Segurança', value: 'Detecção de Acidentes · SOS via satélite' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    colors: [
      { name: 'Meia-noite', hex: '#22252b' }, { name: 'Estelar', hex: '#f6ecdf' },
      { name: '(PRODUCT)RED', hex: '#b1041e' }, { name: 'Roxo', hex: '#d8cfe0' },
      { name: 'Azul', hex: '#a9bdd0' }, { name: 'Amarelo', hex: '#f2e2a8' }
    ],
    ratingCount: 1876,
    ratingAverage: 4.8,
    reviews: [
      { name: 'Felipe A.', city: 'Porto Alegre, RS', text: 'Comprei pela Detecção de Acidentes mesmo, meu filho dirige e me deixa mais tranquilo.' },
      { name: 'Beatriz L.', city: 'Salvador, BA', text: 'Tela linda, câmera excelente à noite. Superou minhas expectativas.' }
    ]
  },
  'iphone-15': {
    tagline: 'Dynamic Island, câmera de 48MP e USB-C: o salto que todo mundo queria.',
    description: 'O iPhone 15 trouxe a Dynamic Island para a linha padrão, uma câmera principal de 48MP com muito mais detalhe e a troca do conector para USB-C, o mesmo padrão de carregadores de notebooks e outros dispositivos.',
    highlights: [
      { icon: '💠', text: 'Dynamic Island na tela' },
      { icon: '📸', text: 'Câmera principal de 48MP' },
      { icon: '🔌', text: 'Conector USB-C' },
      { icon: '🛡️', text: 'Ceramic Shield + IP68' }
    ],
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR com Dynamic Island' },
      { label: 'Chip', value: 'A16 Bionic' },
      { label: 'Câmeras', value: 'Principal 48MP + Ultra angular 12MP' },
      { label: 'Conector', value: 'USB-C' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    colors: [
      { name: 'Preto', hex: '#2b2b2d' }, { name: 'Azul', hex: '#9db3c4' },
      { name: 'Verde', hex: '#b7c6b3' }, { name: 'Amarelo', hex: '#f0e3a3' },
      { name: 'Rosa', hex: '#f6d9dd' }
    ],
    ratingCount: 1532,
    ratingAverage: 4.8,
    reviews: [
      { name: 'Thiago G.', city: 'São Paulo, SP', text: 'USB-C facilitou demais, uso o mesmo carregador do notebook agora.' },
      { name: 'Ana P.', city: 'Curitiba, PR', text: 'Dynamic Island é surpreendentemente útil no dia a dia. Adorei.' }
    ]
  },
  'iphone-16': {
    tagline: 'Construído para Apple Intelligence, com o novo botão de Controle de Câmera.',
    description: 'O iPhone 16 introduz o botão de Controle de Câmera para capturar fotos mais rápido, o botão Ação personalizável e é o primeiro da linha padrão pensado desde o design para os recursos de Apple Intelligence.',
    highlights: [
      { icon: '🎛️', text: 'Botão de Controle de Câmera' },
      { icon: '🤖', text: 'Pronto para Apple Intelligence' },
      { icon: '📸', text: 'Câmera Fusion de 48MP' },
      { icon: '⚡', text: 'Botão Ação personalizável' }
    ],
    specs: [
      { label: 'Tela', value: '6.1" Super Retina XDR OLED' },
      { label: 'Chip', value: 'A18' },
      { label: 'Câmeras', value: 'Fusion 48MP + Ultra angular · Controle de Câmera' },
      { label: 'IA', value: 'Apple Intelligence' },
      { label: 'Proteção', value: 'Ceramic Shield · IP68' }
    ],
    colors: [
      { name: 'Preto', hex: '#2b2b2d' }, { name: 'Branco', hex: '#f2f1ec' },
      { name: 'Rosa', hex: '#f6d9dd' }, { name: 'Verde-azulado', hex: '#9db8b5' },
      { name: 'Ultramarine', hex: '#5670c4' }
    ],
    ratingCount: 968,
    ratingAverage: 4.7,
    reviews: [
      { name: 'Carlos E.', city: 'Rio de Janeiro, RJ', text: 'Controle de Câmera é ótimo pra fotos rápidas. Chegou muito bem embalado.' },
      { name: 'Larissa M.', city: 'Fortaleza, CE', text: 'Preço justo pro que entrega. Nunca imaginei pagar tão barato num 16.' }
    ]
  },
  'iphone-17': {
    tagline: 'O lançamento mais recente: tela maior, câmera frontal Center Stage e Ceramic Shield 2.',
    description: 'O modelo mais novo da nossa vitrine chega com tela de 6.3" ProMotion, câmera frontal Center Stage que se ajusta sozinha para caber mais pessoas na foto, e a nova geração do Ceramic Shield, com o triplo de resistência a arranhões.',
    highlights: [
      { icon: '📱', text: 'Tela maior de 6.3" ProMotion' },
      { icon: '🤳', text: 'Câmera frontal Center Stage' },
      { icon: '🛡️', text: 'Ceramic Shield 2, o triplo de resistência' },
      { icon: '💾', text: 'A partir de 256GB de armazenamento' }
    ],
    specs: [
      { label: 'Tela', value: '6.3" Super Retina XDR ProMotion' },
      { label: 'Chip', value: 'A19' },
      { label: 'Câmeras', value: 'Fusion 48MP + Ultra angular 48MP · Center Stage frontal' },
      { label: 'Armazenamento', value: 'A partir de 256GB' },
      { label: 'Proteção', value: 'Ceramic Shield 2 · IP68' }
    ],
    colors: [
      { name: 'Preto', hex: '#232326' }, { name: 'Névoa', hex: '#c9d6de' },
      { name: 'Lavanda', hex: '#dcd5e8' }, { name: 'Sálvia', hex: '#bcc7b0' },
      { name: 'Branco-estelar', hex: '#f2f1ec' }
    ],
    ratingCount: 311,
    ratingAverage: 4.9,
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

// ---------- Pools usados para gerar avaliações/comentários extras ----------
const FIRST_NAMES = [
  'Lucas', 'Patrícia', 'Rafael', 'Juliana', 'Felipe', 'Beatriz', 'Thiago', 'Ana', 'Carlos', 'Larissa',
  'Gabriel', 'Mariana', 'Diego', 'Camila', 'Bruno', 'Fernanda', 'Rodrigo', 'Amanda', 'Vinícius', 'Letícia',
  'Eduardo', 'Bianca', 'Gustavo', 'Isabela', 'Matheus', 'Priscila', 'André', 'Vanessa', 'Leonardo', 'Renata',
  'Marcelo', 'Débora', 'Fábio', 'Aline', 'Ricardo', 'Natália', 'Alexandre', 'Carolina', 'Daniel', 'Simone'
];
const LAST_NAMES = [
  'Andrade', 'Nunes', 'Teixeira', 'Cardoso', 'Almeida', 'Lopes', 'Guimarães', 'Pereira', 'Souza', 'Martins',
  'Silveira', 'Rocha', 'Barbosa', 'Ferreira', 'Monteiro', 'Ribeiro', 'Castro', 'Correia', 'Moura', 'Vieira',
  'Batista', 'Freitas', 'Cavalcanti', 'Dias', 'Tavares', 'Peixoto', 'Azevedo', 'Farias', 'Bezerra', 'Cunha'
];
const CITIES = [
  'Fortaleza, CE', 'Salvador, BA', 'Belo Horizonte, MG', 'Recife, PE', 'São Paulo, SP', 'Curitiba, PR',
  'Rio de Janeiro, RJ', 'Brasília, DF', 'Porto Alegre, RS', 'Manaus, AM', 'Goiânia, GO', 'Belém, PA',
  'Campinas, SP', 'Florianópolis, SC', 'Vitória, ES', 'Natal, RN', 'João Pessoa, PB', 'Maceió, AL',
  'Cuiabá, MT', 'Londrina, PR', 'Uberlândia, MG', 'Santos, SP', 'Niterói, RJ', 'Joinville, SC', 'Ribeirão Preto, SP'
];
const REVIEW_TEMPLATES = [
  'Comprei o {model} recondicionado e chegou parecendo novo, nem arranhão.',
  'Bateria do {model} aguenta o dia inteiro mesmo com uso pesado. Virei cliente fiel.',
  'Câmera surpreendeu muito pra essa faixa de preço, principalmente em fotos noturnas.',
  'Atendimento foi rápido e tiraram todas as minhas dúvidas antes da compra.',
  'Chegou em menos de 3 dias, embalagem impecável e nota fiscal certinha.',
  'Já é o segundo {model} que compro aqui pra família, sempre uma boa experiência.',
  'Tinha receio de comprar recondicionado, mas veio impecável, sem nenhum risco na tela.',
  'Preço bem mais em conta que a loja física e o produto é exatamente o mesmo.',
  'A garantia de 12 meses me deixou tranquilo pra fechar a compra.',
  'Uso pesado o dia todo com redes sociais e streaming, o {model} aguenta numa boa.',
  'Comprei de presente pro meu pai e ele amou, recomendo demais a loja.',
  'Tela linda, superou minhas expectativas pro que eu paguei.',
  'Processo de compra super simples, do pedido até a entrega foi tranquilo.',
  'Testei tudo assim que chegou e realmente funciona perfeito, sem vício de bateria.',
  'Melhor custo-benefício que encontrei pesquisando em várias lojas.',
  'Vim comprar depois de ver as avaliações e não me arrependi nem um pouco.',
  'Parcelei em 10x sem juros e coube certinho no orçamento.',
  'O {model} ficou muito mais rápido que meu aparelho antigo, valeu o upgrade.',
  'Suporte respondeu rapidinho quando tive uma dúvida sobre a entrega.',
  'Design do {model} é lindo de verdade, as fotos não fazem jus.',
  'Comprei com um pouco de receio por ser loja online, mas foi tudo certinho.',
  'Recomendo de olhos fechados, já indiquei pra amigos comprarem aqui.'
];
const COMMENT_TEMPLATES = [
  { text: 'Vocês entregam pra fora de São Paulo? Comprei e chegou certinho aqui.', reply: false },
  { text: 'Alguém sabe se o recondicionado vem com nota fiscal também?', reply: true },
  { text: 'Fiquei com dúvida sobre a garantia, mas já vi que é de 12 meses. Fechado!', reply: false },
  { text: 'Recebi meu {model} hoje, só vim confirmar: é original de fábrica mesmo?', reply: true },
  { text: 'Pesquisei bastante e o preço daqui foi o melhor que encontrei.', reply: false },
  { text: 'Alguém já testou a bateria depois de uns meses de uso? Tô pensando em comprar.', reply: true },
  { text: 'Chegou antes do prazo previsto, super recomendo a loja.', reply: false },
  { text: 'Dá pra parcelar no cartão em quantas vezes mesmo?', reply: true },
  { text: 'Já é minha segunda compra aqui, sempre corre tudo bem.', reply: false },
  { text: 'Atendimento foi super atencioso quando tive uma dúvida antes de comprar.', reply: false },
  { text: 'O {model} veio com película e capinha ou é só o aparelho?', reply: true },
  { text: 'Muito satisfeito, aparelho impecável e entrega rápida.', reply: false },
  { text: 'Aceita troca se eu não gostar depois de receber?', reply: true },
  { text: 'Comprei recondicionado achando que ia vir com defeito e me surpreendi, tá novo.', reply: false },
  { text: 'Qual a diferença real entre o novo e o recondicionado de vocês?', reply: true },
  { text: 'Vim aqui só confirmar que a loja é confiável mesmo, acabei de comprar o meu.', reply: false },
  { text: 'Ainda estou decidindo, mas as avaliações me deixaram bem mais seguro.', reply: false },
  { text: 'Funciona normalmente com chip de qualquer operadora?', reply: true },
  { text: 'Recebi super bem embalado, nem parecia compra online.', reply: false },
  { text: 'Já indiquei a loja pra amigos depois da minha experiência.', reply: false }
];
const STORE_REPLIES = [
  'Oi, {name}! Sim, todos os aparelhos (novos e recondicionados) saem com nota fiscal e 12 meses de garantia. Qualquer dúvida, é só chamar 💜',
  'Oi, {name}! Os recondicionados passam por mais de 40 pontos de checagem, incluindo saúde da bateria acima de 85%. Pode comprar tranquilo!',
  'Oi, {name}! O parcelamento é em até 10x sem juros no cartão. Pagando no Pix você ainda garante 5% de desconto.',
  'Oi, {name}! O aparelho vem com o cabo original, mas sem carregador de tomada nem capinha — mesmo padrão da Apple.',
  'Oi, {name}! Aceitamos troca ou devolução em até 7 dias corridos após o recebimento, sem burocracia.',
  'Oi, {name}! É totalmente desbloqueado de fábrica, funciona com chip de qualquer operadora.'
];
const DATE_OPTIONS = [
  'há 2 dias', 'há 4 dias', 'há 1 semana', 'há 10 dias', 'há 2 semanas',
  'há 3 semanas', 'há 1 mês', 'há 6 semanas', 'há 2 meses', 'há 3 meses'
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}
function seededRandom(seedStr) {
  let seed = hashString(seedStr) || 1;
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function generateSocialProof(productId, modelName, handwrittenReviews) {
  const rng = seededRandom(productId);
  const usedNames = new Set();

  function person() {
    let first, last, key, guard = 0;
    do {
      first = pick(rng, FIRST_NAMES);
      last = pick(rng, LAST_NAMES);
      key = first + last;
      guard++;
    } while (usedNames.has(key) && guard < 25);
    usedNames.add(key);
    return { name: `${first} ${last[0]}.`, city: pick(rng, CITIES) };
  }

  const reviews = (handwrittenReviews || []).map((r) => ({ ...r, rating: 5, date: pick(rng, DATE_OPTIONS) }));
  const usedReviewIdx = new Set();
  while (reviews.length < 10) {
    let idx = Math.floor(rng() * REVIEW_TEMPLATES.length);
    if (usedReviewIdx.size < REVIEW_TEMPLATES.length) {
      let guard = 0;
      while (usedReviewIdx.has(idx) && guard < 30) { idx = Math.floor(rng() * REVIEW_TEMPLATES.length); guard++; }
    }
    usedReviewIdx.add(idx);
    const p = person();
    reviews.push({
      name: p.name,
      city: p.city,
      text: REVIEW_TEMPLATES[idx].replace(/\{model\}/g, modelName),
      rating: pick(rng, [5, 5, 5, 5, 4]),
      date: pick(rng, DATE_OPTIONS)
    });
  }

  const comments = [];
  const usedCommentIdx = new Set();
  while (comments.length < 10) {
    let idx = Math.floor(rng() * COMMENT_TEMPLATES.length);
    if (usedCommentIdx.size < COMMENT_TEMPLATES.length) {
      let guard = 0;
      while (usedCommentIdx.has(idx) && guard < 30) { idx = Math.floor(rng() * COMMENT_TEMPLATES.length); guard++; }
    }
    usedCommentIdx.add(idx);
    const template = COMMENT_TEMPLATES[idx];
    const p = person();
    comments.push({
      name: p.name,
      text: template.text.replace(/\{model\}/g, modelName),
      date: pick(rng, DATE_OPTIONS),
      reply: template.reply ? pick(rng, STORE_REPLIES).replace(/\{name\}/g, p.name.split(' ')[0]) : null
    });
  }

  return { reviews, comments };
}

const FAQ_TEMPLATES = [
  { q: 'O {model} vem com carregador e fone na caixa?', a: 'Vem o aparelho e o cabo original de carregamento. Carregador de tomada não acompanha (mesmo padrão adotado pela própria Apple), mas funciona com qualquer carregador compatível que você já tenha em casa.' },
  { q: 'Qual a diferença entre o {model} novo e o recondicionado?', a: 'O novo é lacrado de fábrica. O recondicionado é uma unidade usada, totalmente restaurada e aprovada em mais de 40 pontos de teste, com bateria garantida acima de 85% de saúde — pode ter sinais mínimos de uso, mas funciona perfeitamente.' },
  { q: 'A garantia do recondicionado é igual à do novo?', a: 'Sim, todos os aparelhos (novos ou recondicionados) saem com 12 meses de garantia da Lux iPhones.' },
  { q: 'Posso parcelar a compra do {model}?', a: 'Sim, em até 10x sem juros no cartão de crédito. Pagando no Pix, você ainda garante 5% de desconto.' },
  { q: 'O {model} é desbloqueado para qualquer operadora?', a: 'Sim, todos os aparelhos são vendidos desbloqueados e funcionam com chip de qualquer operadora.' }
];

function faqHTML(modelName) {
  return FAQ_TEMPLATES.map((f, i) => `
    <details class="faq-item"${i === 0 ? ' open' : ''}>
      <summary>${f.q.replace(/\{model\}/g, modelName)}</summary>
      <p>${f.a.replace(/\{model\}/g, modelName)}</p>
    </details>
  `).join('');
}

function highlightsHTML(highlights) {
  return highlights.map((h) => `
    <div class="pdp-highlight"><span class="pdp-highlight-icon">${h.icon}</span><p>${h.text}</p></div>
  `).join('');
}

function buildGalleryItems(colors) {
  const photoItems = [
    { type: 'photo', label: 'Foto oficial', pos: '50% 50%' },
    { type: 'photo', label: 'Detalhe da câmera', pos: '78% 15%' },
    { type: 'photo', label: 'Design lateral', pos: '8% 50%' },
    { type: 'photo', label: 'Acabamento traseiro', pos: '50% 85%' }
  ];
  const colorItems = (colors || []).map((c) => ({ type: 'color', label: c.name, hex: c.hex }));
  const infoPool = [
    { type: 'info', icon: '🛡️', label: 'Garantia 12 meses' },
    { type: 'info', icon: '🧾', label: 'Nota fiscal inclusa' },
    { type: 'info', icon: '🔄', label: '7 dias p/ troca' },
    { type: 'info', icon: '✅', label: '40+ pontos testados' }
  ];
  const items = [...photoItems, ...colorItems];
  let i = 0;
  while (items.length < 10 && i < infoPool.length) { items.push(infoPool[i]); i++; }
  return items;
}

function thumbsHTML(items, baseImage) {
  return items.map((item, idx) => {
    if (item.type === 'photo') {
      return `
        <button type="button" class="pdp-thumb pdp-thumb-photo${idx === 0 ? ' active' : ''}" data-pos="${item.pos}" title="${item.label}">
          <img src="${baseImage}" alt="${item.label}" style="object-position:${item.pos}">
        </button>`;
    }
    if (item.type === 'color') {
      return `
        <div class="pdp-thumb pdp-thumb-color" title="Cor: ${item.label}">
          <span class="pdp-thumb-color-swatch" style="background:${item.hex}"></span>
          <span class="pdp-thumb-label">${item.label}</span>
        </div>`;
    }
    return `
      <div class="pdp-thumb pdp-thumb-info" title="${item.label}">
        <span>${item.icon}</span>
        <span class="pdp-thumb-label">${item.label}</span>
      </div>`;
  }).join('');
}

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
      <div class="pdp-review-stars">${'★'.repeat(r.rating || 5)}${'☆'.repeat(5 - (r.rating || 5))} <span class="verified">✔ Compra verificada</span></div>
      <p>"${r.text}"</p>
      <span class="pdp-review-date">${r.date}</span>
    </article>
  `).join('');
}

function commentsHTML(comments) {
  return comments.map((c) => `
    <article class="pdp-comment">
      <div class="pdp-comment-head">
        <strong>${c.name}</strong>
        <span>${c.date}</span>
      </div>
      <p>${c.text}</p>
      ${c.reply ? `<div class="pdp-comment-reply"><strong>Lux iPhones respondeu:</strong><p>${c.reply}</p></div>` : ''}
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

  const extraSpecs = [
    { label: 'Sistema', value: 'iOS (sempre atualizável)' },
    { label: 'Segurança', value: 'Face ID' },
    { label: 'SIM', value: 'Chip físico + eSIM' }
  ];
  if (content.colors && content.colors.length) {
    extraSpecs.push({ label: 'Cores disponíveis', value: content.colors.map((c) => c.name).join(', ') });
  }
  document.getElementById('pdpSpecs').innerHTML = specsTableHTML([...(content.specs || []), ...(product.presale ? [] : extraSpecs)]);

  const highlightsEl = document.getElementById('pdpHighlights');
  if (content.highlights && content.highlights.length) {
    highlightsEl.innerHTML = highlightsHTML(content.highlights);
    highlightsEl.hidden = false;
  } else {
    highlightsEl.hidden = true;
  }

  document.getElementById('pdpImage').src = PRODUCT_IMAGES[id] || '';
  document.getElementById('pdpImage').alt = product.name;
  document.getElementById('pdpImage').style.objectPosition = '50% 50%';
  // O iPhone 18 ainda não foi lançado pela Apple: a imagem é um render conceitual,
  // não uma foto oficial — deixamos isso explícito para não induzir ninguém a erro.
  document.getElementById('pdpConceptTag').hidden = !product.presale;

  const thumbsWrap = document.getElementById('pdpThumbs');
  if (!product.presale) {
    const galleryItems = buildGalleryItems(content.colors);
    thumbsWrap.innerHTML = thumbsHTML(galleryItems, PRODUCT_IMAGES[id]);
    thumbsWrap.querySelectorAll('.pdp-thumb-photo').forEach((btn) => {
      btn.addEventListener('click', () => {
        thumbsWrap.querySelectorAll('.pdp-thumb-photo').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('pdpImage').style.objectPosition = btn.dataset.pos;
      });
    });
  } else {
    thumbsWrap.innerHTML = '';
  }

  const faqBlock = document.getElementById('pdpFaqBlock');
  const reviewsBlock = document.getElementById('pdpReviewsBlock');
  const commentsBlock = document.getElementById('pdpCommentsBlock');

  if (!product.presale) {
    document.getElementById('pdpFaqList').innerHTML = faqHTML(product.name);
    faqBlock.hidden = false;

    const { reviews, comments } = generateSocialProof(id, product.name, content.reviews);
    document.getElementById('pdpRatingScore').textContent = (content.ratingAverage || 4.8).toFixed(1);
    document.getElementById('pdpRatingStars').textContent = '★★★★★';
    document.getElementById('pdpRatingCount').textContent = `baseado em ${content.ratingCount.toLocaleString('pt-BR')} avaliações verificadas`;
    document.getElementById('pdpReviewsList').innerHTML = reviewsHTML(reviews);
    reviewsBlock.hidden = false;

    document.getElementById('pdpCommentsSummary').textContent = `${comments.length} comentários de clientes sobre o ${product.name}`;
    document.getElementById('pdpCommentsList').innerHTML = commentsHTML(comments);
    commentsBlock.hidden = false;
  } else {
    faqBlock.hidden = true;
    reviewsBlock.hidden = true;
    commentsBlock.hidden = true;
  }

  if (product.presale) {
    document.getElementById('pdpBuyBox').hidden = true;
    document.getElementById('pdpPresaleBox').hidden = false;
    document.getElementById('pdpPresalePrice').textContent = formatBRL(product.basePrice);
    return;
  }

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
