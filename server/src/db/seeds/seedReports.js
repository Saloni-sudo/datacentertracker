require('dotenv').config();
const pool = require('../../config/db');
const { geocodeAddress } = require('../../services/geocoding.service');

// Real, publicly-documented facilities drawn from public reporting. These are
// seeded as documented_facility so the map never presents them as resident reports.
const seedData = [
  {
    address: 'Data Center Alley, Ashburn, VA',
    concern_type: 'water_usage',
    region: 'Loudoun County, VA',
    description:
      "Publicly documented. Loudoun County's data centers — the densest concentration in the world — use close to 1 billion gallons of water annually. (Documented facility, not a resident report.)"
  },
  {
    address: 'Sterling, VA',
    concern_type: 'utility_bills',
    region: 'Loudoun County, VA',
    description:
      "Publicly documented. Part of the Ashburn–Sterling corridor, the world's densest data center cluster, with significant grid and utility demand."
  },
  {
    address: 'Google Data Center, The Dalles, OR',
    concern_type: 'water_usage',
    region: 'The Dalles, OR',
    description:
      "Publicly documented. Water use nearly tripled in five years, reaching about 355 million gallons in 2021 — roughly 29% of the city's total water demand."
  },
  {
    address: 'Google Data Center, Council Bluffs, IA',
    concern_type: 'water_usage',
    region: 'Council Bluffs, IA',
    description:
      'Publicly documented. Reported as the city\'s number-one water customer, accounting for about 21% of total municipal water use.'
  },
  {
    address: 'xAI Data Center, Memphis, TN',
    concern_type: 'health',
    region: 'Memphis, TN',
    description:
      'Publicly documented. Residents raised concerns over daily water withdrawals from aging public water infrastructure.'
  },
  {
    address: 'Stargate Data Center Campus, Abilene, TX',
    concern_type: 'utility_bills',
    region: 'Abilene, TX',
    description:
      'Publicly documented. A 1.2-gigawatt campus anchoring a $100B AI infrastructure venture, in a water-stressed region.'
  },
  {
    address: 'NSA Data Center, Bluffdale, UT',
    concern_type: 'water_usage',
    region: 'Bluffdale, UT',
    description:
      'Publicly documented. Reported to have consumed more than 126 million gallons of water between October 2024 and September 2025.'
  },
  {
    address: 'Meta Data Center, Newton County, GA',
    concern_type: 'water_usage',
    region: 'Newton County, GA',
    description:
      "Publicly documented. Reported to use about 500,000 gallons of water per day — roughly 10% of the county's water consumption."
  },
  {
    address: 'Data Center, Fort Worth, TX',
    concern_type: 'noise',
    region: 'Fort Worth, TX',
    description:
      'Publicly documented. Neighbors mounted opposition citing noise, light pollution, energy consumption, and water use.'
  }
];

// LocationIQ's free tier is rate-limited (~1 req/sec sustainable); a 1s delay keeps seeding safely under it.
const GEOCODE_DELAY_MS = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seed() {
  // Re-running refreshes the documented set without duplicating it, and leaves
  // resident submissions alone.
  const [deleted] = await pool.execute('DELETE FROM reports WHERE source = ?', [
    'documented_facility'
  ]);

  const sql = `
    INSERT INTO reports (address, latitude, longitude, concern_type, description, region, status, source)
    VALUES (?, ?, ?, ?, ?, ?, 'approved', 'documented_facility')
  `;

  const unplaced = [];

  for (const [index, facility] of seedData.entries()) {
    if (index > 0) {
      await sleep(GEOCODE_DELAY_MS);
    }

    const coordinates = await geocodeAddress(facility.address);

    if (!coordinates) {
      unplaced.push(facility.address);
    }

    await pool.execute(sql, [
      facility.address,
      coordinates?.latitude ?? null,
      coordinates?.longitude ?? null,
      facility.concern_type,
      facility.description,
      facility.region
    ]);
  }

  console.log(`Removed ${deleted.affectedRows} previously seeded documented facilities.`);
  console.log(
    `Seed complete: ${seedData.length} inserted, ${seedData.length - unplaced.length} geocoded, ${unplaced.length} saved without coordinates.`
  );

  if (unplaced.length > 0) {
    console.log(`Not geocoded: ${unplaced.join('; ')}`);
  }
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
