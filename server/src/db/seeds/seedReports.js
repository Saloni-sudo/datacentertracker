require('dotenv').config();
const pool = require('../../config/db');
const { geocodeAddress } = require('../../services/geocoding.service');

// TODO: real data-center locations added in a later stage
const seedData = [];

// LocationIQ's free tier allows 2 requests/second, so seeding stays under it.
const GEOCODE_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
  const sql = `
    INSERT INTO reports (address, latitude, longitude, concern_type, description, region, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  for (const [index, report] of seedData.entries()) {
    if (index > 0) {
      await sleep(GEOCODE_DELAY_MS);
    }

    const coordinates = await geocodeAddress(report.address);

    await pool.execute(sql, [
      report.address,
      coordinates?.latitude ?? null,
      coordinates?.longitude ?? null,
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
