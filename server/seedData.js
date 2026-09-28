// Catálogo inicial da loja — preços especiais de Black Friday.
// "de" é o preço cheio (fora da promoção) e "price" é o preço da Black Friday.
module.exports = [
  {
    id: 'iphone-11',
    name: 'iPhone 11',
    sortOrder: 1,
    storageOptions: [
      { label: '64GB', delta: 0 },
      { label: '128GB', delta: 400 },
      { label: '256GB', delta: 800 }
    ],
    novo: { price: 1279, de: 1899, stock: 22, available: true },
    recon: { price: 799, de: 1399, stock: 30, available: true }
  },
  {
    id: 'iphone-12',
    name: 'iPhone 12',
    sortOrder: 2,
    storageOptions: [
      { label: '64GB', delta: 0 },
      { label: '128GB', delta: 400 },
      { label: '256GB', delta: 800 }
    ],
    novo: { price: 2099, de: 2999, stock: 20, available: true },
    recon: { price: 1499, de: 2299, stock: 26, available: true }
  },
  {
    id: 'iphone-13',
    name: 'iPhone 13',
    sortOrder: 3,
    storageOptions: [
      { label: '128GB', delta: 0 },
      { label: '256GB', delta: 400 },
      { label: '512GB', delta: 800 }
    ],
    novo: { price: 2499, de: 3699, stock: 18, available: true },
    recon: { price: 1899, de: 2899, stock: 24, available: true }
  },
  {
    id: 'iphone-14',
    name: 'iPhone 14',
    sortOrder: 4,
    storageOptions: [
      { label: '128GB', delta: 0 },
      { label: '256GB', delta: 400 },
      { label: '512GB', delta: 800 }
    ],
    novo: { price: 2999, de: 4399, stock: 16, available: true },
    recon: { price: 2299, de: 3499, stock: 20, available: true }
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    sortOrder: 5,
    storageOptions: [
      { label: '128GB', delta: 0 },
      { label: '256GB', delta: 400 },
      { label: '512GB', delta: 800 }
    ],
    novo: { price: 3699, de: 5299, stock: 14, available: true },
    recon: { price: 2899, de: 4299, stock: 16, available: true }
  },
  {
    id: 'iphone-16',
    name: 'iPhone 16',
    sortOrder: 6,
    storageOptions: [
      { label: '128GB', delta: 0 },
      { label: '256GB', delta: 400 },
      { label: '512GB', delta: 800 }
    ],
    novo: { price: 4399, de: 6199, stock: 12, available: true },
    recon: { price: 3699, de: 5199, stock: 10, available: true }
  },
  {
    id: 'iphone-17',
    name: 'iPhone 17',
    sortOrder: 7,
    storageOptions: [
      { label: '128GB', delta: 0 },
      { label: '256GB', delta: 400 },
      { label: '512GB', delta: 800 }
    ],
    novo: { price: 5399, de: 6999, stock: 9, available: true },
    recon: { price: 0, de: 0, stock: 0, available: false }
  },
  {
    id: 'iphone-18',
    name: 'iPhone 18',
    sortOrder: 8,
    presale: true,
    basePrice: 7499,
    depositPrice: 299,
    storageOptions: [
      { label: '256GB', delta: 0 },
      { label: '512GB', delta: 600 },
      { label: '1TB', delta: 1200 }
    ],
    reservationLimit: 500,
    reservationsCount: 0
  }
];
