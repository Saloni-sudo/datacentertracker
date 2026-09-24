const pool = require('../../config/db');

// TODO: real data-center locations added in a later stage
const seedData = [];

async function seed() {
  const sql = `
    INSERT INTO reports (address, latitude, longitude, concern_type, description, region, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  for (const report of seedData) {
    await pool.execute(sql, [
      report.address,
      report.latitude ?? null,
      report.longitude ?? null,
      report.concern_type,
      report.description,
      report.region ?? null,
      report.status ?? 'pending'
    ]);
  }

  console.log(`Seed complete: ${seedData.length} reports inserted.`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
