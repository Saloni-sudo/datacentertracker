const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { username, password } = req.body ?? {};

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const result = await authService.authenticate(username, password);

    // Same message whether the username is unknown or the password is wrong.
    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { login };
