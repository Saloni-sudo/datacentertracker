const pool = require('../config/db');

// Every aggregate counts approved reports only — same trust rule as the public list.
const APPROVED = "WHERE status = 'approved'";
const TOP_REGIONS = 10;
const RECENT_DAYS = 30;

async function getStats() {
  const [byConcernType] = await pool.query(
    `SELECT concern_type, COUNT(*) AS count FROM reports ${APPROVED}
     GROUP BY concern_type ORDER BY count DESC`
  );

  const [bySource] = await pool.query(
    `SELECT source, COUNT(*) AS count FROM reports ${APPROVED}
     GROUP BY source ORDER BY count DESC`
  );

  const [byRegion] = await pool.execute(
    `SELECT region, COUNT(*) AS count FROM reports ${APPROVED} AND region IS NOT NULL
     GROUP BY region ORDER BY count DESC LIMIT ?`,
    [TOP_REGIONS]
  );

  const [[totals]] = await pool.execute(
    `SELECT
       COUNT(*) AS total_approved,
       SUM(source = 'documented_facility') AS sites_tracked,
       SUM(source = 'resident_submission') AS resident_reports,
       SUM(created_at >= NOW() - INTERVAL ? DAY) AS reports_last_30_days,
       MAX(updated_at) AS last_updated
     FROM reports ${APPROVED}`,
    [RECENT_DAYS]
  );

  return {
    total_approved: totals.total_approved,
    sites_tracked: Number(totals.sites_tracked ?? 0),
    resident_reports: Number(totals.resident_reports ?? 0),
    reports_last_30_days: Number(totals.reports_last_30_days ?? 0),
    last_updated: totals.last_updated,
    by_concern_type: byConcernType,
    by_source: bySource,
    by_region: byRegion
  };
}

module.exports = { getStats };
