const express = require('express');
const reportsController = require('../controllers/reports.controller');
const honeypot = require('../middleware/honeypot');
const { submitLimiter } = require('../middleware/rateLimit');
const { validateCreateReport, validateIdParam } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  submitLimiter,
  honeypot,
  validateCreateReport,
  reportsController.createReport
);

router.get('/', reportsController.listReports);
router.get('/:id', validateIdParam, reportsController.getReportById);

module.exports = router;
