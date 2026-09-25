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

## Stage 3 — Geocoding (LocationIQ)

Submitted addresses are converted to coordinates by [LocationIQ](https://locationiq.com) forward geocoding, called inside `POST /api/reports` before the insert.

### Getting a key

1. Sign up for a free LocationIQ account and copy the access token from the dashboard.
2. Add it to `server/.env`:

```
LOCATIONIQ_API_KEY=pk.your_real_key_here
LOCATIONIQ_BASE_URL=https://us1.locationiq.com/v1
```

LocationIQ assigns each account a regional endpoint. US accounts use `us1`, EU accounts use `eu1` — check your dashboard and set `LOCATIONIQ_BASE_URL` to match, or every request will fail. The key is read from the environment only; it is never committed.

### Resilience rule

Geocoding is enrichment, not a gate. If the provider errors, times out (5 seconds), returns no match, or the key is missing, `geocodeAddress` returns `null` and the report is still saved with NULL coordinates. A failed lookup produces a saved-but-unmapped report, never a dropped submission. Failures are logged server-side; the client only sees `coordinates_resolved: false` in the 201 response, so a later UI can show "location pending".

### Testing

```bash
curl -i -X POST http://localhost:5050/api/reports -H 'Content-Type: application/json' -d '{"address":"21110 Ridgetop Circle, Sterling, VA 20166","concern_type":"water_usage","description":"Cooling towers audible at night.","region":"Loudoun County, VA"}'
```

Expect `201` with `"coordinates_resolved": true`, and populated lat/lng in the row.

```bash
curl -i -X POST http://localhost:5050/api/reports -H 'Content-Type: application/json' -d '{"address":"zzzzqqq not a real place 99999 xyzzy","concern_type":"noise","description":"Unresolvable address test."}'
```

Expect `201` with `"coordinates_resolved": false`, saved with NULL coordinates.

```bash
/usr/local/mysql/bin/mysql -u root -p datacentertracker -e "SELECT id, address, latitude, longitude, status FROM reports;"
```

### Seeding

`seedReports.js` geocodes each address before inserting and waits 1 second between lookups, since LocationIQ's free tier allows 2 requests/second. The seed array is still empty; real locations come in a later stage.

## Stage 4 — Public frontend (React + Leaflet)

`client/` is a Vite + React app (plain JavaScript) showing approved reports as pins on a Leaflet map, with the public submission form in a side panel.

### Running it

The backend must already be running on port 5050:

```bash
cd server && npm run dev
```

Then, in a second terminal:

```bash
cd client && npm install && npm run dev
```

Open http://localhost:5173.

### Dev proxy

Vite serves the app on 5173 while the API is on 5050. Rather than opening CORS on the backend, `vite.config.js` proxies `/api` to `http://localhost:5050`, so the browser only ever talks to one origin in development. The API base path lives in `client/src/config.js` as `API_BASE_URL`, empty by default; set `VITE_API_BASE_URL` to point the client at a deployed API instead.

### What you'll see

The map is centered on the continental US. **It will be empty until a report is approved** — the public endpoint returns approved reports only, and the admin dashboard is a later stage. To see a pin, submit a report and then approve it by hand:

```bash
/usr/local/mysql/bin/mysql -u root -p datacentertracker -e "UPDATE reports SET status='approved' WHERE id=1;"
```

Refresh the map and the pin appears. Clicking it opens a popup with the concern type in human-readable form, the description, the region and the address, headed by an "Unverified resident submission" banner.

Reports that failed geocoding have NULL coordinates and are skipped by the map — they can't be placed yet.

### Submission form

"Report a data center" opens the form panel. It posts JSON to `/api/reports`, shows a pending-review confirmation on success, and displays the backend's messages on a validation error. It includes the hidden `website` honeypot field that pairs with the Stage 2 backend check. Photo upload is a later stage.

## Stage 5 — Admin auth and moderation

Admins authenticate with a username and password; the password is stored only as a bcrypt hash (cost 12) and checked with `bcrypt.compare`. A successful login returns a JWT signed with `JWT_SECRET`, valid for 8 hours, whose payload carries only the user id, username and role — never the password or its hash. Every `/api/admin` route requires that token as `Authorization: Bearer <token>`.

### New env vars

```
JWT_SECRET=a_long_random_string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose_a_strong_password
```

Generate a secret with `openssl rand -base64 48`. `ADMIN_USERNAME`/`ADMIN_PASSWORD` are read once by the create-admin script; the password is hashed on insert and never stored as typed.

### Creating the first admin

```bash
npm run db:migrate
npm run db:create-admin
```

The migration adds the `users` table; the second command inserts the admin from your `.env`. Re-running it updates that admin's password rather than creating a duplicate.

### Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | none | Returns a JWT. Wrong username and wrong password give the same `401 Invalid credentials`, so usernames can't be enumerated. Limited to 10 attempts per IP per 15 minutes. |
| `GET` | `/api/admin/reports?status=pending` | Bearer | Moderation queue. Sees every status; defaults to `pending`. The status is validated against the allowed set before use. |
| `PATCH` | `/api/admin/reports/:id/status` | Bearer | Sets a report to `approved`, `rejected` or `flagged`. |

The public `GET /api/reports` is unchanged and still returns approved reports only. A report can reach `approved` only through an authenticated admin calling the PATCH endpoint — that is the single path that changes a status after creation.

### Using the dashboard

Log in at http://localhost:5173/admin/login. `/admin` redirects there when no token is stored. The queue defaults to pending, with filter chips for each status and Approve / Reject / Flag on each card; the list refreshes after each action. "Log out" clears the token.

The token is kept in `localStorage`, so a refresh doesn't sign you out. The tradeoff is that any JavaScript on the page can read it, so an XSS bug would expose it; keeping it in memory only would avoid that at the cost of logging admins out on every reload.

## Stage 6 — Documented facilities

Reports now carry a `source`: `resident_submission` (the default, for anything submitted through the public form) or `documented_facility` (the seeded, publicly-reported data centers). The map labels the two differently so a documented fact and an unverified complaint never look alike.

Like `status`, `source` is written as a SQL literal in `createReport` and is never read from the request body — a public submitter cannot post a report as a documented facility.

### Upgrading an existing database

`schema.sql` uses `CREATE TABLE IF NOT EXISTS`, so editing it does not alter a table that already exists. Run the ALTER migration once against your existing database:

```bash
npm run db:migrate:source
```

It adds the `source` column and its index. MySQL has no `ADD COLUMN IF NOT EXISTS`, so running it a second time fails with `Duplicate column name 'source'` — that error is expected and safe to ignore. A fresh database created with `npm run db:migrate` already has the column.

### Seeding documented facilities

```bash
npm run db:seed
```

This inserts nine real, publicly-documented facilities (Ashburn and Sterling VA, The Dalles OR, Council Bluffs IA, Memphis TN, Abilene TX, Bluffdale UT, Newton County GA, Fort Worth TX) as `approved` + `documented_facility`, so they appear on the map immediately. Their descriptions summarise figures from public reporting on each site; they are documented facilities, not resident complaints, and the map says so.

Each address is geocoded through the existing LocationIQ service with a **1-second delay between requests**, since the free tier allows 2 requests/second. Nine addresses therefore take roughly 10 seconds. An address that fails to geocode is still inserted with NULL coordinates and named in the summary, so the seed never stops halfway.

The seed is safe to re-run: it first deletes rows where `source = 'documented_facility'`, refreshing the documented set without creating duplicates and without touching resident submissions.

### On the map

Documented facilities get a green pin and a green "Publicly documented data center" label. Resident submissions keep the blue pin and the yellow "Unverified resident submission" disclaimer.
