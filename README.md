# Data Center Tracker

A map of AI data centers and what people living nearby report about them: water use, utility bills, noise, health.

Grey pins are documented sites, seeded from published reporting, each linking to its source. Terracotta pins are resident reports. Those are moderated before they show up, but moderated only means someone read it, and the site says so on every one.

Student project. Express + MySQL, React + Leaflet.

## Setup

Node 18+ and MySQL 8.

```bash
mysql -u root -p -e "CREATE DATABASE datacentertracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

cd server
npm install
cp .env.example .env     # MySQL login, JWT_SECRET, admin user, LocationIQ + Cloudinary keys

npm run db:migrate       # tables
npm run db:create-admin  # admin account from .env
npm run db:seed          # nine documented sites, ~10s (geocoding rate limit)
```

Run both halves in separate terminals:

```bash
cd server && npm run dev                   # 5050
cd client && npm install && npm run dev    # 5173
```

Admin is at `/admin`, not linked from anywhere public.

## Notes

LocationIQ assigns your account a region. Requests fail against the wrong one, so check whether your `.env` needs `us1` or `eu1`.

Port 5000 is AirPlay on macOS, which answers with a 403 and looks like a broken server. Hence 5050.

Submissions are always stored as pending, written as a SQL literal so nothing public can approve itself. Public endpoints hard-code `WHERE status = 'approved'` and filters only narrow within that. Every query with user input uses `?` placeholders.

Geocoding is enrichment, not a gate. If LocationIQ fails the report still saves, just without a pin.

Photos go to Cloudinary and are re-encoded on the way in, which strips EXIF. Phone photos carry GPS in there and the stored file is publicly reachable, so stripping it only at display time isn't enough.

Spam: 5 submissions per IP per 10 minutes, plus a hidden field bots fill and humans don't. No CAPTCHA, deliberately.

Upgrading an older database needs `npm run db:migrate:source` and `npm run db:migrate:citation`. Running either twice errors with "Duplicate column name" — harmless.

## Deployment

Three free services: Aiven for MySQL, Render for the API, Vercel for the client.

**Aiven.** Create a MySQL service and download its CA certificate. Run the migrations from your laptop against it rather than from the server — copy `.env.example` to `.env.aiven`, fill in the Aiven host, port, user, password and database, paste the certificate into `DB_SSL_CA`, then:

```bash
npm run db:migrate:prod
npm run admin:create:prod
npm run db:seed:prod
```

Those use Node's `--env-file`, and the app never overwrites variables that are already set, so nothing local leaks in.

**Render.** Web service, root `server/`, build `npm install`, start `npm start`. Set every variable from `.env.example`: the Aiven connection details plus `DB_SSL_CA`, `JWT_SECRET`, the LocationIQ and Cloudinary keys, and `CLIENT_ORIGIN` with your Vercel URL. Leave `PORT` alone, Render sets it.

**Vercel.** Root `client/`, framework Vite. One variable: `VITE_API_BASE_URL`, pointing at the Render URL with no trailing slash. `vercel.json` rewrites everything to `index.html` so refreshing `/reports` or `/admin` doesn't 404.

`CLIENT_ORIGIN` takes a comma-separated list if you want preview deployments allowed too. Without it the API sends no CORS headers at all, which is what you want locally, where Vite proxies `/api` and the browser sees one origin.

Two things about free tiers that look like bugs. Render sleeps after 15 minutes idle and takes 30-50 seconds to wake, so the first request after a quiet spell hangs. Aiven's free database powers off after a longer idle period and has to be resumed from their console, and until you do the API just fails to connect.

## To do

- Deploy: Render for the API, Vercel for the client
- Real repo URL in `client/src/config.js`
- Memphis seed pin geocodes well off target; the address is a facility name, not a postal one
