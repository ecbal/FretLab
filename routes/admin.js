const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const adminPageController = require('../controllers/admin/adminPageController');
const adminDashboardController = require('../controllers/admin/adminDashboardController');
const adminUserController = require('../controllers/admin/adminUserController');
const adminChordController = require('../controllers/admin/adminChordController');

const router = express.Router();

router.get('/pages/:feature', adminPageController.getFeaturePage);

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard', adminDashboardController.getDashboard);
router.get('/users', adminUserController.listUsers);
router.get('/chords', adminChordController.listChords);
router.get('/chords/:id', adminChordController.getChord);
router.post('/chords', adminChordController.createChord);
router.patch('/chords/:id', adminChordController.updateChord);
router.delete('/chords/:id', adminChordController.deleteChord);

module.exports = router;
