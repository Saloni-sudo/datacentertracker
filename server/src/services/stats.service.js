const pool = require('../config/db');

// Every aggregate counts approved reports only — same trust rule as the public list.
const APPROVED = "WHERE status = 'approved'";
const TOP_REGIONS = 10;

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

  const [[totals]] = await pool.query(
    `SELECT COUNT(*) AS total_approved FROM reports ${APPROVED}`
  );

  return {
    total_approved: totals.total_approved,
    by_concern_type: byConcernType,
    by_source: bySource,
    by_region: byRegion
  };
}

module.exports = { getStats };
