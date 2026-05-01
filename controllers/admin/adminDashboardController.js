const adminDashboardService = require('../../services/admin/adminDashboardService');

async function getDashboard(req, res, next) {
  try {
    const dashboard = await adminDashboardService.getDashboard();
    return res.json(dashboard);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDashboard,
};
