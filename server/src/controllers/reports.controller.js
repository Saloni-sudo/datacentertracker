const reportsService = require('../services/reports.service');
const { DISCLAIMER } = require('../constants');

async function createReport(req, res, next) {
  try {
    const created = await reportsService.createReport(req.validatedReport);

    res.status(201).json({
      id: created.id,
      status: created.status,
      message: 'Report submitted for review',
      disclaimer: DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
}

async function listReports(req, res, next) {
  try {
    const reports = await reportsService.listApprovedReports();

    res.status(200).json({
      count: reports.length,
      disclaimer: DISCLAIMER,
      data: reports
    });
  } catch (err) {
    next(err);
  }
}

async function getReportById(req, res, next) {
  try {
    const report = await reportsService.getApprovedReportById(req.reportId);

    // Unapproved reports are indistinguishable from missing ones, so IDs can't be
    // probed to read pending submissions.
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ disclaimer: DISCLAIMER, data: report });
  } catch (err) {
    next(err);
  }
}

module.exports = { createReport, listReports, getReportById };
