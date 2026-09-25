const express = require('express');
const adminController = require('../controllers/admin.controller');
const requireAuth = require('../middleware/auth');
const { validateIdParam, validateStatusQuery, validateStatusUpdate } = require('../middleware/validate');

const router = express.Router();

// Everything below this line requires a valid admin token.
router.use(requireAuth);

router.get('/reports', validateStatusQuery, adminController.listReports);
router.patch(
  '/reports/:id/status',
  validateIdParam,
  validateStatusUpdate,
  adminController.updateReportStatus
);

module.exports = router;
