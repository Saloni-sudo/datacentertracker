const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const TOKEN_EXPIRY = '8h';

async function findUserByUsername(username) {
  const [rows] = await pool.execute(
    'SELECT id, username, password_hash, role FROM users WHERE username = ?',
    [username]
  );

  return rows[0] ?? null;
}

// Returns null for both an unknown username and a wrong password, so the caller
// can't tell them apart and usernames can't be enumerated.
async function authenticate(username, password) {
  const user = await findUserByUsername(username);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }

  // Payload carries identity only — never the password or its hash.
  const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, secret, {
    expiresIn: TOKEN_EXPIRY
  });

  return { token, user: { id: user.id, username: user.username, role: user.role } };
}

module.exports = { authenticate, findUserByUsername };
