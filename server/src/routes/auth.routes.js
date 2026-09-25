const express = require('express');
const authController = require('../controllers/auth.controller');
const { loginLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/login', loginLimiter, authController.login);

module.exports = router;
