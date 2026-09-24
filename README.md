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

## Stage 2 — Public reports API

Routes are mounted under `/api/reports`. The layering is routes → middleware → controller → service; all SQL lives in the service layer and every query that touches user input uses `?` placeholders.

### Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/reports` | Public submission. Always stored as `pending`. |
| `GET` | `/api/reports` | Lists **approved** reports only. |
| `GET` | `/api/reports/:id` | Single **approved** report; 404 otherwise. |

Submission body: `address` (required), `concern_type` (required, one of `water_usage`, `utility_bills`, `noise`, `health`, `other`), `description` (required), `region` (optional).

`latitude`/`longitude` are not accepted from the client — they're filled by geocoding in a later stage, so new reports are inserted with NULL coordinates. `status` is not accepted either: it's written as a literal `'pending'` in the service, so a submitter cannot self-approve. Validation failures return `400` with a list naming each problem.

Every response carries `"disclaimer": "unverified resident submission"`. Unapproved reports return `404` rather than `403`, so IDs can't be probed to discover pending submissions.

### Spam protection

**Rate limit** — `POST /api/reports` allows **5 submissions per IP per 10 minutes**. A resident reporting a few nearby sites in one sitting stays well under it, while a script hits the limit after five requests and gets a `429`. The window is short enough that a real person blocked by accident only waits a few minutes.

**Honeypot** — the submission accepts a `website` field that will be hidden in the UI, so only bots fill it. When it arrives non-empty the API returns a normal-looking `201` and inserts nothing, so a bot gets no signal that it was caught.

Both are a first line of defence. CAPTCHA and other deeper checks are deliberately out of scope at this stage.

### Testing the endpoints

Start the server with `npm run dev`, then:

```bash
curl -i -X POST http://localhost:5050/api/reports -H 'Content-Type: application/json' -d '{"address":"100 Server Farm Rd, Ashburn VA","concern_type":"water_usage","description":"Cooling towers running all night.","region":"Loudoun County, VA"}'
```

```bash
curl -i http://localhost:5050/api/reports
```

The list is empty until a report is approved. Until the admin dashboard exists, approve one directly in MySQL:

```bash
/usr/local/mysql/bin/mysql -u root -p datacentertracker -e "UPDATE reports SET status='approved' WHERE id=1;"
```
