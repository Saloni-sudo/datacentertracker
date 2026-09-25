const pool = require('../config/db');
const { geocodeAddress } = require('./geocoding.service');

const PUBLIC_FIELDS =
  'id, address, latitude, longitude, concern_type, description, region, source, created_at';

async function createReport({ address, concern_type, description, region }) {
  // Returns null when the address can't be resolved; the report is saved either way.
  const coordinates = await geocodeAddress(address);

  // status and source are literals here, never taken from the caller: a public
  // submitter must not be able to self-approve or pose as a documented facility.
  const sql = `
    INSERT INTO reports (address, concern_type, description, region, latitude, longitude, status, source)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', 'resident_submission')
  `;

  const [result] = await pool.execute(sql, [
    address,
    concern_type,
    description,
    region ?? null,
    coordinates?.latitude ?? null,
    coordinates?.longitude ?? null
  ]);

  return {
    id: result.insertId,
    status: 'pending',
    coordinates_resolved: coordinates !== null
  };
}

async function listApprovedReports(filters = {}) {
  // Approved-only is hard-coded and always applies; filters only ever narrow within
  // it by appending AND clauses, so no param can surface a non-approved report.
  const clauses = ["status = 'approved'"];
  const params = [];

  if (filters.concern_type) {
    clauses.push('concern_type = ?');
    params.push(filters.concern_type);
  }

  if (filters.source) {
    clauses.push('source = ?');
    params.push(filters.source);
  }

  if (filters.region) {
    clauses.push('region LIKE ?');
    params.push(`%${filters.region}%`);
  }

  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM reports WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`,
    params
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

const MODERATION_FIELDS = `${PUBLIC_FIELDS}, status, updated_at`;

async function listReportsByStatus(status) {
  const [rows] = await pool.execute(
    `SELECT ${MODERATION_FIELDS} FROM reports WHERE status = ? ORDER BY created_at DESC`,
    [status]
  );

  return rows;
}

// The only path that changes a report's status after creation, and it sits behind
// the admin auth middleware — nothing public can approve a report.
async function updateReportStatus(id, status) {
  const [result] = await pool.execute('UPDATE reports SET status = ? WHERE id = ?', [status, id]);

  if (result.affectedRows === 0) {
    return null;
  }

  const [rows] = await pool.execute(`SELECT ${MODERATION_FIELDS} FROM reports WHERE id = ?`, [id]);

  return rows[0] ?? null;
}

module.exports = {
  createReport,
  listApprovedReports,
  getApprovedReportById,
  listReportsByStatus,
  updateReportStatus
};
