const pool = require('../config/db');
const { geocodeAddress } = require('./geocoding.service');
const { uploadReportImages } = require('./imageUpload.service');

const PUBLIC_FIELDS =
  'id, address, latitude, longitude, concern_type, description, region, source, source_name, source_url, created_at';

// One query for every report in the page, rather than one per report.
async function attachImages(reports) {
  if (reports.length === 0) {
    return reports;
  }

  const [rows] = await pool.query(
    'SELECT report_id, image_url FROM report_images WHERE report_id IN (?) ORDER BY id',
    [reports.map((report) => report.id)]
  );

  const byReport = new Map();

  for (const row of rows) {
    byReport.set(row.report_id, [...(byReport.get(row.report_id) ?? []), row.image_url]);
  }

  return reports.map((report) => ({ ...report, images: byReport.get(report.id) ?? [] }));
}

async function saveReportImages(reportId, files) {
  const urls = await uploadReportImages(files);

  for (const url of urls) {
    await pool.execute('INSERT INTO report_images (report_id, image_url) VALUES (?, ?)', [
      reportId,
      url
    ]);
  }

  return urls.length;
}

async function createReport({ address, concern_type, description, region }, files = []) {
  // Returns null when the address can't be resolved; the report is saved either way.
  const coordinates = await geocodeAddress(address);

  // status, source and the citation columns are literals here, never taken from the
  // caller: a public submitter must not self-approve, pose as a documented facility,
  // or attach a source citation to their own report.
  const sql = `
    INSERT INTO reports (address, concern_type, description, region, latitude, longitude, status, source, source_name, source_url)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', 'resident_submission', NULL, NULL)
  `;

  const [result] = await pool.execute(sql, [
    address,
    concern_type,
    description,
    region ?? null,
    coordinates?.latitude ?? null,
    coordinates?.longitude ?? null
  ]);

  // The report is already saved at this point, so a failed upload costs a photo,
  // never the submission.
  const photosSaved = files.length > 0 ? await saveReportImages(result.insertId, files) : 0;

  return {
    id: result.insertId,
    status: 'pending',
    coordinates_resolved: coordinates !== null,
    photos_saved: photosSaved
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

  // The limit is validated and capped upstream; it still travels as a placeholder.
  const limitClause = filters.limit ? ' LIMIT ?' : '';

  if (filters.limit) {
    params.push(filters.limit);
  }

  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM reports WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC${limitClause}`,
    params
  );

  return attachImages(rows);
}

async function getApprovedReportById(id) {
  const [rows] = await pool.execute(
    `SELECT ${PUBLIC_FIELDS} FROM reports WHERE id = ? AND status = 'approved'`,
    [id]
  );

  const [withImages] = await attachImages(rows);

  return withImages ?? null;
}

const MODERATION_FIELDS = `${PUBLIC_FIELDS}, status, updated_at`;

async function listReportsByStatus(status) {
  const [rows] = await pool.execute(
    `SELECT ${MODERATION_FIELDS} FROM reports WHERE status = ? ORDER BY created_at DESC`,
    [status]
  );

  return attachImages(rows);
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
