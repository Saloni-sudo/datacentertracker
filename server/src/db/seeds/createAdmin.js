require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../../config/db');

const SALT_ROUNDS = 12;

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
  }

  // Only the hash is ever written, and the password is never logged.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.execute(
    `INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    [username, passwordHash]
  );

  const action = result.affectedRows === 1 ? 'created' : 'password updated';
  console.log(`Admin "${username}" ${action}.`);
}

createAdmin()
  .catch((err) => {
    console.error('Admin creation failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
