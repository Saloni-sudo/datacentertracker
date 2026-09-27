const express = require('express');
const reportsController = require('../controllers/reports.controller');
const honeypot = require('../middleware/honeypot');
const { submitLimiter } = require('../middleware/rateLimit');
const uploadReportPhotos = require('../middleware/upload');
const {
  validateCreateReport,
  validateIdParam,
  validateReportFilters
} = require('../middleware/validate');

const router = express.Router();

// Order matters: multer parses multipart/form-data, which express.json() does not,
// so it must run before the honeypot and validator or req.body arrives empty and the
// honeypot silently stops catching bots. It only buffers in memory — nothing reaches
// Cloudinary until the request has passed both.
router.post(
  '/',
  submitLimiter,
  uploadReportPhotos,
  honeypot,
  validateCreateReport,
  reportsController.createReport
);

router.get('/', validateReportFilters, reportsController.listReports);
router.get('/:id', validateIdParam, reportsController.getReportById);

module.exports = router;
