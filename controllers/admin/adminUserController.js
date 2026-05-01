const adminUserService = require('../../services/admin/adminUserService');

async function listUsers(req, res, next) {
  try {
    const result = await adminUserService.listUsers({
      search: req.query.search,
      limit: req.query.limit,
      offset: req.query.offset,
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
};
