// Ponto único de acesso ao banco de dados.
// Com DATABASE_URL definida (ex.: no Render) usa PostgreSQL; sem ela, usa SQLite local.
const seedData = require('../seedData');

const impl = process.env.DATABASE_URL ? require('./postgres') : require('./sqlite');
const backend = process.env.DATABASE_URL ? 'postgres' : 'sqlite';

const ready = impl.init(seedData).catch((err) => {
  console.error(`Falha ao inicializar o banco de dados (${backend}):`, err);
  process.exit(1);
});

async function withReady(fn) {
  await ready;
  return fn();
}

module.exports = {
  backend,
  ready,
  getProducts: (...args) => withReady(() => impl.getProducts(...args)),
  saveProducts: (...args) => withReady(() => impl.saveProducts(...args)),
  getOrders: (...args) => withReady(() => impl.getOrders(...args)),
  getOrderByNumber: (...args) => withReady(() => impl.getOrderByNumber(...args)),
  createOrder: (...args) => withReady(() => impl.createOrder(...args)),
  updateOrderStatus: (...args) => withReady(() => impl.updateOrderStatus(...args)),
  updateOrderPayment: (...args) => withReady(() => impl.updateOrderPayment(...args)),
  nextOrderNumber: (...args) => withReady(() => impl.nextOrderNumber(...args)),
  getUserById: (...args) => withReady(() => impl.getUserById(...args)),
  upsertGoogleUser: (...args) => withReady(() => impl.upsertGoogleUser(...args)),
  getUsers: (...args) => withReady(() => impl.getUsers(...args)),
  getUserByEmail: (...args) => withReady(() => impl.getUserByEmail(...args)),
  getUserAuthByEmail: (...args) => withReady(() => impl.getUserAuthByEmail(...args)),
  createEmailUser: (...args) => withReady(() => impl.createEmailUser(...args)),
  getOrdersByUser: (...args) => withReady(() => impl.getOrdersByUser(...args))
};
