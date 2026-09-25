const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

// Defaults to the full schema; pass a path to run a single migration file instead.
const target = process.argv[2] ?? path.join(__dirname, 'schema.sql');

async function migrate() {
  const sql = fs.readFileSync(path.resolve(target), 'utf8');

  // The pool keeps multipleStatements off (it limits the damage of any injection bug),
  // so the file is run one statement at a time.
  const statements = sql
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }

  console.log(`Migration succeeded: ${statements.length} statements applied.`);
}

migrate()
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
