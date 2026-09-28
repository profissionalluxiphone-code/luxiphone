// Backend de desenvolvimento local: SQLite embutido (módulo nativo node:sqlite, sem dependências extras).
// Usado automaticamente quando DATABASE_URL não está definida.
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'luxiphones.sqlite');
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
    paymentStatus: row.payment_status ?? 'manual',
    userId: row.user_id ?? undefined
  };
}

function mapUserRow(row) {
  return {
    id: row.id,
    googleSub: row.google_sub || undefined,
    email: row.email,
    name: row.name,
    hasPassword: !!row.password_hash,
    hasGoogle: !!row.google_sub,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
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
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT UNIQUE,
      email TEXT NOT NULL,
      name TEXT,
      password_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const userCols = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
  if (!userCols.includes('password_hash')) {
    db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email COLLATE NOCASE)');
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
      payment_status TEXT NOT NULL DEFAULT 'manual',
      user_id TEXT
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
  if (!orderCols.includes('user_id')) {
    db.exec('ALTER TABLE orders ADD COLUMN user_id TEXT');
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

  // storage_options é estrutura do catálogo definida no código (não editável pelo admin),
  // então sempre sincronizamos com o seedData — diferente de preço/estoque, que o
  // lojista edita pelo painel e por isso nunca são sobrescritos aqui.
  const updateStorage = db.prepare('UPDATE products SET storage_options = ? WHERE id = ?');
  for (const item of seedData) {
    updateStorage.run(JSON.stringify(item.storageOptions || []), item.id);
  }
}

async function getProducts() {
  const rows = db.prepare('SELECT * FROM products ORDER BY sort_order ASC').all();
  return rows.map(mapProductRow);
}

async function saveProducts(products) {
  const update = db.prepare(`
    UPDATE products
    SET novo = ?, recon = ?, reservations_count = ?, base_price = ?, deposit_price = ?, reservation_limit = ?
    WHERE id = ?
  `);
  for (const p of products) {
    update.run(
      p.novo ? JSON.stringify(p.novo) : null,
      p.recon ? JSON.stringify(p.recon) : null,
      p.reservationsCount ?? 0,
      p.basePrice ?? null,
      p.depositPrice ?? null,
      p.reservationLimit ?? null,
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
    INSERT INTO orders (order_number, customer_name, whatsapp, payment_method, items, total, status, created_at, payment_status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    order.orderNumber, order.customerName, order.whatsapp, order.paymentMethod,
    JSON.stringify(order.items), order.total, order.status, order.createdAt,
    order.paymentStatus || 'manual', order.userId || null
  );
  return getOrderByNumber(order.orderNumber);
}

async function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? mapUserRow(row) : null;
}

function getUserByEmailRaw(email) {
  return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email);
}

async function getUserByEmail(email) {
  const row = getUserByEmailRaw(email);
  return row ? mapUserRow(row) : null;
}

async function getUserAuthByEmail(email) {
  const row = getUserByEmailRaw(email);
  if (!row) return null;
  return { id: row.id, passwordHash: row.password_hash, hasGoogle: !!row.google_sub };
}

function newUserId() {
  return `U${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

async function createEmailUser({ name, email, passwordHash }) {
  const id = newUserId();
  db.prepare(`
    INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)
  `).run(id, email, name, passwordHash);
  return getUserById(id);
}

async function upsertGoogleUser({ googleSub, email, name }) {
  let existing = db.prepare('SELECT * FROM users WHERE google_sub = ?').get(googleSub);
  if (!existing) existing = getUserByEmailRaw(email);

  if (existing) {
    db.prepare(`
      UPDATE users SET google_sub = ?, email = ?, name = ?, last_login_at = datetime('now') WHERE id = ?
    `).run(googleSub, email, name, existing.id);
    return getUserById(existing.id);
  }

  const id = newUserId();
  db.prepare(`
    INSERT INTO users (id, google_sub, email, name) VALUES (?, ?, ?, ?)
  `).run(id, googleSub, email, name);
  return getUserById(id);
}

async function getUsers() {
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  return rows.map(mapUserRow);
}

async function getOrdersByUser(userId) {
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  return rows.map(mapOrderRow);
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
  init, getProducts, saveProducts, getOrders, getOrderByNumber, createOrder, updateOrderStatus, updateOrderPayment, nextOrderNumber,
  getUserById, upsertGoogleUser, getUsers, getUserByEmail, getUserAuthByEmail, createEmailUser, getOrdersByUser
};
