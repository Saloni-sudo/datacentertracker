const pool = require('../config/db');

const PUBLIC_FIELDS =
  'id, address, latitude, longitude, concern_type, description, region, created_at';

async function createReport({ address, concern_type, description, region }) {
  // status is a literal here, never taken from the caller — a public submitter
  // must not be able to self-approve. latitude/longitude stay NULL until geocoding.
  const sql = `
    INSERT INTO reports (address, concern_type, description, region, latitude, longitude, status)
    VALUES (?, ?, ?, ?, NULL, NULL, 'pending')
  `;

  const [result] = await pool.execute(sql, [
    address,
    concern_type,
    description,
    region ?? null
  ]);

  return { id: result.insertId, status: 'pending' };
}

async function listApprovedReports() {
  // Approved-only is hard-coded: pending/rejected/flagged reports never go public.
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_FIELDS} FROM reports WHERE status = 'approved' ORDER BY created_at DESC`
  );

  return rows;
}

async function getApprovedReportById(id) {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM reports WHERE id = ? AND status = 'approved'`,
    [id]
  );

  return rows[0] ?? null;
}

module.exports = { createReport, listApprovedReports, getApprovedReportById };
