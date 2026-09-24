# DataCenterTracker

A crowdsourced map where residents report AI data centers and the concerns that come with them — water usage, utility bills, noise, and health impacts.

The project is a monorepo: `server/` is a Node.js + Express API backed by MySQL (via `mysql2`, raw parameterized SQL), and `client/` will hold the frontend.

## Stage 1 — Database foundation

### Prerequisites

- Node.js 18+
- MySQL 8+

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Create the database

```bash
mysql -u root -p -e "CREATE DATABASE datacentertracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `server/.env` and fill in your MySQL credentials. `DB_NAME` must match the database created above.

### 4. Run the migration

```bash
npm run db:migrate
```

Creates the `reports` and `report_images` tables. Safe to re-run.

### 5. (Optional) Run the seed

```bash
npm run db:seed
```

The seed data is empty for now, so this inserts nothing.

### 6. Start the server

```bash
npm run dev
```

Or `npm start` without auto-reload. Check it's up:

```bash
curl http://localhost:5050/health
```

Expected response: `{"status":"ok"}`
