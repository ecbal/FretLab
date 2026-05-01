const adminPageService = require('../../services/admin/adminPageService');

async function getFeaturePage(req, res, next) {
  try {
    const page = await adminPageService.getFeaturePage(req.params.feature);
    return res.json(page);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getFeaturePage,
};
