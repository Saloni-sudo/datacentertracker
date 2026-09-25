const reportsService = require('../services/reports.service');

async function listReports(req, res, next) {
  try {
    const reports = await reportsService.listReportsByStatus(req.moderationStatus);

    res.status(200).json({
      status: req.moderationStatus,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
}

async function updateReportStatus(req, res, next) {
  try {
    const report = await reportsService.updateReportStatus(req.reportId, req.newStatus);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ data: report });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReports, updateReportStatus };
