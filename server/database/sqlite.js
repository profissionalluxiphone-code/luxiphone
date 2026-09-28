// Backend de desenvolvimento local: SQLite embutido (módulo nativo node:sqlite, sem dependências extras).
// Usado automaticamente quando DATABASE_URL não está definida.
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'novacell.sqlite');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    presale: !!row.presale,
    basePrice: row.base_price ?? undefined,
    depositPrice: row.deposit_price ?? undefined,
    reservationLimit: row.reservation_limit ?? undefined,
    reservationsCount: row.reservations_count ?? 0,
    storageOptions: JSON.parse(row.storage_options || '[]'),
    novo: row.novo ? JSON.parse(row.novo) : undefined,
    recon: row.recon ? JSON.parse(row.recon) : undefined
  };
}

function mapOrderRow(row) {
  return {
    orderNumber: row.order_number,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    paymentMethod: row.payment_method,
    items: JSON.parse(row.items),
    total: row.total,
    status: row.status,
    createdAt: row.created_at,
    paymentId: row.payment_id ?? undefined,
    paymentStatus: row.payment_status ?? 'manual'
  };
}

async function init(seedData) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      presale INTEGER NOT NULL DEFAULT 0,
      base_price REAL,
      deposit_price REAL,
      reservation_limit INTEGER,
      reservations_count INTEGER NOT NULL DEFAULT 0,
      storage_options TEXT NOT NULL DEFAULT '[]',
      novo TEXT,
      recon TEXT
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      order_number TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'recebido',
      created_at TEXT NOT NULL,
      payment_id TEXT,
      payment_status TEXT NOT NULL DEFAULT 'manual'
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS counters (
      name TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    );
  `);

  const orderCols = db.prepare("PRAGMA table_info(orders)").all().map((c) => c.name);
  if (!orderCols.includes('payment_id')) {
    db.exec('ALTER TABLE orders ADD COLUMN payment_id TEXT');
  }
  if (!orderCols.includes('payment_status')) {
    db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'manual'");
  }

  const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (id, name, sort_order, presale, base_price, deposit_price, reservation_limit, reservations_count, storage_options, novo, recon)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of seedData) {
      insert.run(
        p.id, p.name, p.sortOrder || 0, p.presale ? 1 : 0,
        p.basePrice ?? null, p.depositPrice ?? null,
        p.reservationLimit ?? null, p.reservationsCount ?? 0,
        JSON.stringify(p.storageOptions || []),
        p.novo ? JSON.stringify(p.novo) : null,
        p.recon ? JSON.stringify(p.recon) : null
      );
    }
  }

  const counterExists = db.prepare('SELECT 1 AS x FROM counters WHERE name = ?').get('nextOrderSeq');
  if (!counterExists) {
    db.prepare('INSERT INTO counters (name, value) VALUES (?, ?)').run('nextOrderSeq', 100001);
  }
}

async function getProducts() {
  const rows = db.prepare('SELECT * FROM products ORDER BY sort_order ASC').all();
  return rows.map(mapProductRow);
}

async function saveProducts(products) {
  const update = db.prepare('UPDATE products SET novo = ?, recon = ?, reservations_count = ? WHERE id = ?');
  for (const p of products) {
    update.run(
      p.novo ? JSON.stringify(p.novo) : null,
      p.recon ? JSON.stringify(p.recon) : null,
      p.reservationsCount ?? 0,
      p.id
    );
  }
}

async function getOrders() {
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  return rows.map(mapOrderRow);
}

async function getOrderByNumber(orderNumber) {
  const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber);
  return row ? mapOrderRow(row) : null;
}

async function createOrder(order) {
  db.prepare(`
    INSERT INTO orders (order_number, customer_name, whatsapp, payment_method, items, total, status, created_at, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.orderNumber, order.customerName, order.whatsapp, order.paymentMethod,
    JSON.stringify(order.items), order.total, order.status, order.createdAt,
    order.paymentStatus || 'manual'
  );
  return getOrderByNumber(order.orderNumber);
}

async function updateOrderStatus(orderNumber, status) {
  db.prepare('UPDATE orders SET status = ? WHERE order_number = ?').run(status, orderNumber);
  return getOrderByNumber(orderNumber);
}

async function updateOrderPayment(orderNumber, { paymentId, paymentStatus, status }) {
  db.prepare('UPDATE orders SET payment_id = ?, payment_status = ?, status = ? WHERE order_number = ?')
    .run(paymentId, paymentStatus, status, orderNumber);
  return getOrderByNumber(orderNumber);
}

async function nextOrderNumber() {
  const row = db.prepare('SELECT value FROM counters WHERE name = ?').get('nextOrderSeq');
  const seq = row.value;
  db.prepare('UPDATE counters SET value = ? WHERE name = ?').run(seq + 1, 'nextOrderSeq');
  return `NC${seq}`;
}

module.exports = {
  init, getProducts, saveProducts, getOrders, getOrderByNumber, createOrder, updateOrderStatus, updateOrderPayment, nextOrderNumber
};
