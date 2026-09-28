// Login com Google, sem depender de serviços externos para guardar dados de usuário.
// O token do Google só é usado pra confirmar a identidade; tudo que importa (usuário, sessão)
// fica no nosso próprio banco (Postgres/SQLite), visível e exportável pelo painel admin.
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-session-secret-troque-em-producao';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
const SESSION_COOKIE = 'luxiphones_session';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function isGoogleLoginConfigured() {
  return !!googleClient;
}

async function verifyGoogleCredential(credential) {
  if (!googleClient) throw new Error('Login com Google não configurado no servidor.');
  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) throw new Error('Token do Google inválido.');
  return {
    googleSub: payload.sub,
    email: payload.email,
    name: payload.name || payload.email
  };
}

function signSession(userId) {
  const expires = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${userId}.${expires}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts;
  const payload = `${userId}.${expires}`;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  if (Date.now() > Number(expires)) return null;
  return userId;
}

// ---------- Senha (cadastro sem Google) ----------
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const hashBuf = Buffer.from(hash, 'hex');
  const testBuf = crypto.scryptSync(password, salt, 64);
  return hashBuf.length === testBuf.length && crypto.timingSafeEqual(hashBuf, testBuf);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

// ---------- Limitador simples de tentativas (login/cadastro) ----------
// Em memória: suficiente pra uma única instância (plano free do Render), sem
// precisar de Redis. Reinicia a cada deploy, o que é aceitável aqui.
const attempts = new Map();
function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.start > windowMs) {
    attempts.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

function setSessionCookie(res, userId, secure) {
  res.cookie(SESSION_COOKIE, signSession(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: SESSION_MAX_AGE_MS
  });
}

function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE);
}

function getSessionUserId(req) {
  return verifySession(req.cookies && req.cookies[SESSION_COOKIE]);
}

module.exports = {
  GOOGLE_CLIENT_ID,
  SESSION_COOKIE,
  isGoogleLoginConfigured,
  verifyGoogleCredential,
  hashPassword,
  verifyPassword,
  normalizeEmail,
  rateLimit,
  setSessionCookie,
  clearSessionCookie,
  getSessionUserId
};
