const rateLimit = require('express-rate-limit');

// First line of defence only. CAPTCHA and similar deeper checks are out of scope
// for now.

// 5 submissions per IP per 10 minutes: comfortably above a resident filing a few
// reports in one sitting, low enough that scripted flooding hits the wall fast.
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many reports submitted from this IP. Try again in a few minutes.' }
});

module.exports = { submitLimiter };
