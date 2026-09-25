const CONCERN_TYPES = ['water_usage', 'utility_bills', 'noise', 'health', 'other'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateCreateReport(req, res, next) {
  const { address, concern_type, description, region } = req.body ?? {};
  const errors = [];

  if (!isNonEmptyString(address)) {
    errors.push('address is required and must be a non-empty string');
  }

  if (!isNonEmptyString(concern_type)) {
    errors.push('concern_type is required');
  } else if (!CONCERN_TYPES.includes(concern_type)) {
    errors.push(`concern_type must be one of: ${CONCERN_TYPES.join(', ')}`);
  }

  if (!isNonEmptyString(description)) {
    errors.push('description is required and must be a non-empty string');
  }

  if (region !== undefined && region !== null && typeof region !== 'string') {
    errors.push('region must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Only the validated fields move on, so latitude/longitude/status sent by a
  // client are dropped here rather than reaching the service.
  req.validatedReport = {
    address: address.trim(),
    concern_type,
    description: description.trim(),
    region: isNonEmptyString(region) ? region.trim() : null
  };

  next();
}

function validateIdParam(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: 'id must be a positive integer' });
  }

  req.reportId = id;
  next();
}

const REPORT_STATUSES = ['pending', 'approved', 'rejected', 'flagged'];
const MODERATION_STATUSES = ['approved', 'rejected', 'flagged'];

function validateStatusQuery(req, res, next) {
  const { status = 'pending' } = req.query;

  if (!REPORT_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${REPORT_STATUSES.join(', ')}` });
  }

  req.moderationStatus = status;
  next();
}

function validateStatusUpdate(req, res, next) {
  const { status } = req.body ?? {};

  if (!MODERATION_STATUSES.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of: ${MODERATION_STATUSES.join(', ')}` });
  }

  req.newStatus = status;
  next();
}

module.exports = {
  validateCreateReport,
  validateIdParam,
  validateStatusQuery,
  validateStatusUpdate,
  CONCERN_TYPES,
  REPORT_STATUSES
};
