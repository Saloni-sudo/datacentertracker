require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const reportsRoutes = require('./routes/reports.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const statsRoutes = require('./routes/stats.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5050;

// Render terminates TLS at its proxy, so without this every request looks like it
// comes from the proxy and the rate limiter buckets all visitors together.
app.set('trust proxy', 1);

app.use(
  helmet({
    // The API only returns JSON, so there is no HTML for a CSP to protect, and the
    // browser must be allowed to read responses from the frontend's origin.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Comma-separated, so staging and production can both be allowed. Left unset in
// development, where Vite proxies /api and the browser only sees one origin.
const allowedOrigins = (process.env.CLIENT_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );
}

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
