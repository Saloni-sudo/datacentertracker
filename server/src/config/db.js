const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Aiven requires TLS and gives you a CA certificate. Supply it either inline
// (DB_SSL_CA, handy for Render's env vars) or as a file path (DB_SSL_CA_PATH).
// With neither set the pool connects unencrypted, which is what local MySQL wants.
function sslOptions() {
  const ca = process.env.DB_SSL_CA || readCaFile(process.env.DB_SSL_CA_PATH);

  return ca ? { ca, rejectUnauthorized: true } : undefined;
}

function readCaFile(path) {
  return path ? fs.readFileSync(path, 'utf8') : null;
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  ssl: sslOptions(),
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
