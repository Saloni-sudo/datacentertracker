// Last middleware in the stack: logs the real error server-side and sends the
// client a generic message, so stack traces and SQL details never leak.
function errorHandler(err, req, res, next) {
  console.error(`${req.method} ${req.originalUrl} failed:`, err);

  if (res.headersSent) {
    return next(err);
  }

  // Client errors (e.g. malformed JSON from the body parser) keep their status and
  // message; anything else is reported as a generic 500.
  const status = err.status ?? err.statusCode;

  if (status >= 400 && status < 500) {
    return res.status(status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
