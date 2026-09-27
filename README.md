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

## Stage 7 — Filtering and statistics

### Filtering the public map

`GET /api/reports` accepts three optional query params:

| Param | Values | Matching |
| --- | --- | --- |
| `concern_type` | one of the five enums | exact |
| `source` | `resident_submission` or `documented_facility` | exact |
| `region` | free text | parameterized `LIKE '%value%'` |

```bash
curl "http://localhost:5050/api/reports?concern_type=water_usage&region=TX"
```

Invalid `concern_type` or `source` values return `400`. Filters **narrow within approved reports**: the query starts from a hard-coded `WHERE status = 'approved'` and filters are appended as additional `AND` clauses with `?` placeholders, so no param can surface a pending, rejected or flagged report. `status` is not a filterable param — passing `?status=pending` simply has no effect.

On the map, the filter bar above it re-fetches as you change a dropdown or type a region, and the pin count updates alongside.

### Statistics

`GET /api/stats` is public — aggregate counts only, no per-report detail:

```json
{
  "disclaimer": "unverified resident submission",
  "data": {
    "total_approved": 9,
    "by_concern_type": [{ "concern_type": "water_usage", "count": 5 }],
    "by_source": [{ "source": "documented_facility", "count": 9 }],
    "by_region": [{ "region": "Loudoun County, VA", "count": 2 }]
  }
}
```

Every figure is computed by MySQL with `COUNT(*)` and `GROUP BY` in `stats.service.js`, not by looping in JavaScript, and each query carries the same hard-coded `WHERE status = 'approved'`. Regions are capped at the top 10 via a parameterized `LIMIT ?`.

The dashboard lives at http://localhost:5173/stats, linked from the map header. It renders three Recharts charts — reports by concern (bar), by source (pie), and top regions (horizontal bar) — all responsive, using the shared labels from `config.js`.

## Stage 8 — Photo uploads (Cloudinary)

Reports can carry up to three optional photos. Files are parsed by multer into memory and uploaded to Cloudinary; the returned `secure_url` is stored in the existing `report_images` table.

### Env vars

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Limits

- **3 photos** per submission
- **5 MB** per photo
- **JPEG, PNG or WebP** only

Exceeding any of these returns a `400` with a plain message. The mimetype is client-supplied, so it's only a first filter; Cloudinary's `resource_type: 'image'` upload is the second check.

### Why Cloudinary, not local disk

Multer uses memory storage and nothing is written to the server's filesystem. The deploy target's disk is ephemeral — files written there disappear on restart or redeploy — so uploads go straight to Cloudinary, which also handles resizing and format conversion for thumbnails.

### Order of operations

Middleware on `POST /api/reports` runs rate limit → multer → honeypot → validation → controller. Multer has to run before the honeypot because `express.json()` does not parse `multipart/form-data`; without it `req.body` would be empty and the honeypot would silently stop catching bots. Multer only buffers in memory, so **nothing is uploaded to Cloudinary until the request has passed both the honeypot and validation** — a bot or an invalid submission never costs an upload.

Photos are optional enrichment, like geocoding. The report row is inserted first; if an upload fails it is logged server-side and skipped, and the response still returns `201` with `photos_saved` telling the client how many made it.

### Viewing photos

`GET /api/reports`, `GET /api/reports/:id` and the admin queue each include an `images` array. Images for a whole page of reports are fetched in one `WHERE report_id IN (?)` query and attached in JS, so there is no N+1. Thumbnails are requested from Cloudinary at `w_300,f_auto,q_auto` rather than full size, and clicking one opens the original in a new tab.

### Known limitation

Photos attached to a **pending** report are stored at unguessable but technically public Cloudinary URLs. The public API never serves them until the report is approved, so they are not discoverable through the app — but anyone holding the URL could open it. Private delivery with signed URLs is out of scope for now.

## Stage 9 — Marker clustering

Nearby pins group into a numbered bubble at low zoom and split apart as you zoom in; clicking or tapping a cluster zooms to its contents. With facilities concentrated in places like the Ashburn–Sterling corridor, this keeps overlapping pins readable.

Clustering uses **`react-leaflet-cluster`** (v4), whose peer dependencies match this project exactly: React 19, react-leaflet 5 and `@react-leaflet/core` 3. Earlier major versions target react-leaflet 4 and would not work here. It wraps `leaflet.markercluster`, whose two stylesheets (`MarkerCluster.css` and `MarkerCluster.Default.css`) are imported in `ReportsMap.jsx` — without them the cluster bubbles and zoom animations render unstyled.

The change is confined to `ReportsMap.jsx`: the existing markers are wrapped in a `MarkerClusterGroup`. Popups, source labels, photo thumbnails, filters, the null-coordinate skip and the default-icon fix are all unchanged.

## Stage 10 — Public site redesign

The public site is now branded **Data Center Watch** (set once as `SITE_NAME` in `client/src/config.js`). The look: Libre Caslon Text for display headings, system sans for body copy, a warm off-white ground (`#faf7f2`), terracotta (`#c1663f`) for primary actions and highlights, thin neutral borders and generous whitespace.

### Page structure

| Route | Contents |
| --- | --- |
| `/` | Hero, map with side panel, key figures strip, then Recent reports + Reported issues |
| `/reports` | Every approved report and site, with concern / source / region filters |
| `/methodology` | How the data is gathered, the disclaimer, and contact |
| `/stats` | The Recharts statistics dashboard from Stage 7 |
| `/admin`, `/admin/login` | Unchanged, and deliberately absent from the public navigation |

Methodology is its own page rather than a homepage section: the homepage already carries the map, figures and two columns, and a standalone page gives the nav a stable destination to link to.

The map keeps its clustering, filters and null-coordinate skip. Markers are coloured by source — terracotta for resident submissions, dark grey for documented sites — with a legend using the same labels as everywhere else. Selecting a pin opens the side panel (right on desktop, stacked below the map on phones); it always leads with the source label. Scroll-wheel zoom is off so the page scrolls normally past the map; the +/− buttons, double-click, drag and pinch all still zoom.

### API additions

`GET /api/stats` now also returns, all computed in SQL over approved reports only:

- `sites_tracked` — approved `documented_facility` count
- `resident_reports` — approved `resident_submission` count
- `reports_last_30_days` — approved reports with `created_at >= NOW() - INTERVAL 30 DAY`
- `last_updated` — the most recent `updated_at`, shown as "Updated <date>" in the hero

`GET /api/reports` accepts an optional **`limit`**: an integer from 1 to 50, validated before use and passed as a `?` placeholder. The homepage uses `?source=resident_submission&limit=6` for its Recent reports list. Out-of-range, non-integer or injected values return `400`.

All earlier trust rules are untouched: public endpoints remain approved-only, filters and `limit` only narrow within that, submissions are still forced to `pending` / `resident_submission`, and the honeypot is unchanged.

## Stage 10b — Trust, transparency and the full footer

### Source citations on documented sites

`reports` gained two nullable columns, `source_name VARCHAR(255)` and `source_url VARCHAR(2048)`. Fresh databases get them from `schema.sql`; an existing one needs migration 002:

```bash
npm run db:migrate:citation
```

Like migration 001, MySQL has no `ADD COLUMN IF NOT EXISTS`, so a second run fails with `Duplicate column name` — expected and safe to ignore. Re-seed afterwards so the documented sites carry their citations:

```bash
npm run db:seed
```

Public submissions can never set these. They are written as SQL literal `NULL` in `createReport`, alongside the forced `pending` status and `resident_submission` source, and they are not part of submission validation. Both fields are returned by the public API, and documented sites render "Source: &lt;name&gt; ↗" as an external link in the side panel and on the Reports page. The full list lives at `/methodology#data-sources`.

### Photo privacy (EXIF)

Uploaded photos can carry EXIF metadata including GPS coordinates. Every image the site shows or links — thumbnails **and** the full-size view, on the public site and in the admin queue — goes through `imageUrl()` in `client/src/config.js`, which rewrites the URL to a Cloudinary transformation (`w_…,f_auto,q_auto`). Cloudinary re-encodes the file on delivery, which strips that metadata. The original `secure_url` is never linked directly.

### Trust signals

A line beside the map reads "Resident reports are reviewed by a moderator before publication. Reviewed does not mean verified," linking to Methodology. The submission form carries a privacy note asking people to leave out personal details and to avoid photos showing faces or private interiors. Lists use loading skeletons and the empty state "No reports match these filters", photos have descriptive `alt` text, and keyboard focus is visible throughout.

### New pages

`/about`, `/privacy`, `/guidelines` and `/corrections`, each marked as a plain-language notice rather than a legal document. The footer has four columns — brand, Explore, About, Trust &amp; policies — over a bottom bar with the copyright, OpenStreetMap and LocationIQ attribution, the Cloudinary note, a GitHub link and the last-updated date. Set `GITHUB_REPO_URL` in `client/src/config.js`; it currently holds a placeholder.
