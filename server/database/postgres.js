// Backend de produção: PostgreSQL (usado quando DATABASE_URL está definida, ex.: no Render).
const { Pool } = require('pg');

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

function normalizeCond(c) {
  if (!c) return undefined;
  return { price: Number(c.price), de: Number(c.de), stock: Number(c.stock), available: !!c.available };
}

function mapProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    presale: row.presale,
    basePrice: row.base_price != null ? Number(row.base_price) : undefined,
    depositPrice: row.deposit_price != null ? Number(row.deposit_price) : undefined,
    reservationLimit: row.reservation_limit ?? undefined,
    reservationsCount: row.reservations_count ?? 0,
    storageOptions: row.storage_options || [],
    novo: normalizeCond(row.novo),
    recon: normalizeCond(row.recon)
  };
}

function mapOrderRow(row) {
  return {
    orderNumber: row.order_number,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    paymentMethod: row.payment_method,
    items: row.items,
    total: Number(row.total),
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
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
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    lastLoginAt: row.last_login_at instanceof Date ? row.last_login_at.toISOString() : row.last_login_at
  };
}

async function init(seedData) {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      presale BOOLEAN NOT NULL DEFAULT false,
      base_price NUMERIC,
      deposit_price NUMERIC,
      reservation_limit INTEGER,
      reservations_count INTEGER NOT NULL DEFAULT 0,
      storage_options JSONB NOT NULL DEFAULT '[]',
      novo JSONB,
      recon JSONB
    );
  `);
  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_sub TEXT UNIQUE,
      email TEXT NOT NULL,
      name TEXT,
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_login_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Migração: bancos criados antes do login por e-mail/senha tinham google_sub NOT NULL.
  await p.query('ALTER TABLE users ALTER COLUMN google_sub DROP NOT NULL').catch(() => {});
  await p.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT');
  await p.query('CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email))');
  await p.query(`
    CREATE TABLE IF NOT EXISTS orders (
      order_number TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      items JSONB NOT NULL,
      total NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'recebido',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      payment_id TEXT,
      payment_status TEXT NOT NULL DEFAULT 'manual',
      user_id TEXT
    );
  `);
  await p.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT');
  await p.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'manual'");
  await p.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT');
  await p.query(`
    CREATE TABLE IF NOT EXISTS counters (
      name TEXT PRIMARY KEY,
      value INTEGER NOT NULL
    );
  `);

  const { rows } = await p.query('SELECT COUNT(*)::int AS count FROM products');
  if (rows[0].count === 0) {
    for (const item of seedData) {
      await p.query(
        `INSERT INTO products (id, name, sort_order, presale, base_price, deposit_price, reservation_limit, reservations_count, storage_options, novo, recon)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          item.id, item.name, item.sortOrder || 0, !!item.presale,
          item.basePrice ?? null, item.depositPrice ?? null,
          item.reservationLimit ?? null, item.reservationsCount ?? 0,
          JSON.stringify(item.storageOptions || []),
          item.novo ? JSON.stringify(item.novo) : null,
          item.recon ? JSON.stringify(item.recon) : null
        ]
      );
    }
  }

  const { rowCount } = await p.query('SELECT 1 FROM counters WHERE name = $1', ['nextOrderSeq']);
  if (rowCount === 0) {
    await p.query('INSERT INTO counters (name, value) VALUES ($1, $2)', ['nextOrderSeq', 100001]);
  }

  // storage_options é estrutura do catálogo definida no código (não editável pelo admin),
  // então sempre sincronizamos com o seedData — diferente de preço/estoque, que o
  // lojista edita pelo painel e por isso nunca são sobrescritos aqui.
  for (const item of seedData) {
    await p.query('UPDATE products SET storage_options = $1 WHERE id = $2', [JSON.stringify(item.storageOptions || []), item.id]);
  }
}

async function getProducts() {
  const { rows } = await getPool().query('SELECT * FROM products ORDER BY sort_order ASC');
  return rows.map(mapProductRow);
}

async function saveProducts(products) {
  for (const item of products) {
    await getPool().query(
      `UPDATE products
       SET novo = $1, recon = $2, reservations_count = $3, base_price = $4, deposit_price = $5, reservation_limit = $6
       WHERE id = $7`,
      [
        item.novo ? JSON.stringify(item.novo) : null,
        item.recon ? JSON.stringify(item.recon) : null,
        item.reservationsCount ?? 0,
        item.basePrice ?? null,
        item.depositPrice ?? null,
        item.reservationLimit ?? null,
        item.id
      ]
    );
  }
}

async function getOrders() {
  const { rows } = await getPool().query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows.map(mapOrderRow);
}

async function getOrderByNumber(orderNumber) {
  const { rows } = await getPool().query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
  return rows[0] ? mapOrderRow(rows[0]) : null;
}

async function createOrder(order) {
  await getPool().query(
    `INSERT INTO orders (order_number, customer_name, whatsapp, payment_method, items, total, status, created_at, payment_status, user_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [
      order.orderNumber, order.customerName, order.whatsapp, order.paymentMethod,
      JSON.stringify(order.items), order.total, order.status, order.createdAt,
      order.paymentStatus || 'manual', order.userId || null
    ]
  );
  return getOrderByNumber(order.orderNumber);
}

async function getUserById(id) {
  const { rows } = await getPool().query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ? mapUserRow(rows[0]) : null;
}

async function getUserByEmailRaw(email) {
  const { rows } = await getPool().query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
  return rows[0] || null;
}

async function getUserByEmail(email) {
  const row = await getUserByEmailRaw(email);
  return row ? mapUserRow(row) : null;
}

async function getUserAuthByEmail(email) {
  const row = await getUserByEmailRaw(email);
  if (!row) return null;
  return { id: row.id, passwordHash: row.password_hash, hasGoogle: !!row.google_sub };
}

async function getOrdersByUser(userId) {
  const { rows } = await getPool().query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
  return rows.map(mapOrderRow);
}

function newUserId() {
  return `U${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}

async function createEmailUser({ name, email, passwordHash }) {
  const id = newUserId();
  const { rows } = await getPool().query(
    `INSERT INTO users (id, email, name, password_hash) VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, email, name, passwordHash]
  );
  return mapUserRow(rows[0]);
}

async function upsertGoogleUser({ googleSub, email, name }) {
  const { rows } = await getPool().query('SELECT * FROM users WHERE google_sub = $1', [googleSub]);
  let existing = rows[0];

  // Se o e-mail (verificado pelo Google) já pertence a uma conta criada por
  // senha, vinculamos o Google a ela em vez de criar um cadastro duplicado.
  if (!existing) existing = await getUserByEmailRaw(email);

  if (existing) {
    const { rows: updated } = await getPool().query(
      `UPDATE users SET google_sub = $1, email = $2, name = $3, last_login_at = now() WHERE id = $4 RETURNING *`,
      [googleSub, email, name, existing.id]
    );
    return mapUserRow(updated[0]);
  }

  const id = newUserId();
  const { rows: created } = await getPool().query(
    `INSERT INTO users (id, google_sub, email, name) VALUES ($1,$2,$3,$4) RETURNING *`,
    [id, googleSub, email, name]
  );
  return mapUserRow(created[0]);
}

async function getUsers() {
  const { rows } = await getPool().query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(mapUserRow);
}

async function updateOrderStatus(orderNumber, status) {
  await getPool().query('UPDATE orders SET status = $1 WHERE order_number = $2', [status, orderNumber]);
  return getOrderByNumber(orderNumber);
}

async function updateOrderPayment(orderNumber, { paymentId, paymentStatus, status }) {
  await getPool().query(
    'UPDATE orders SET payment_id = $1, payment_status = $2, status = $3 WHERE order_number = $4',
    [paymentId, paymentStatus, status, orderNumber]
  );
  return getOrderByNumber(orderNumber);
}

async function nextOrderNumber() {
  const { rows } = await getPool().query(
    `UPDATE counters SET value = value + 1 WHERE name = 'nextOrderSeq' RETURNING value - 1 AS seq`
  );
  return `NC${rows[0].seq}`;
}

module.exports = {
  init, getProducts, saveProducts, getOrders, getOrderByNumber, createOrder, updateOrderStatus, updateOrderPayment, nextOrderNumber,
  getUserById, upsertGoogleUser, getUsers, getUserByEmail, getUserAuthByEmail, createEmailUser, getOrdersByUser
};
