const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const adminDashboardController = require('../controllers/admin/adminDashboardController');
const adminUserController = require('../controllers/admin/adminUserController');

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard', adminDashboardController.getDashboard);
router.get('/users', adminUserController.listUsers);

module.exports = router;
