const { DISCLAIMER } = require('../constants');

// `website` is hidden in the UI, so only bots fill it. When it arrives filled we
// answer like a normal success and insert nothing, so the bot can't tell it was caught.
function honeypot(req, res, next) {
  const trap = req.body?.website;

  if (typeof trap === 'string' && trap.trim().length > 0) {
    return res.status(201).json({
      status: 'pending',
      message: 'Report submitted for review',
      disclaimer: DISCLAIMER
    });
  }

  next();
}

module.exports = honeypot;
