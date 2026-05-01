const adminChordService = require('../../services/admin/adminChordService');

async function listChords(req, res, next) {
  try {
    const result = await adminChordService.listChords(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function getChord(req, res, next) {
  try {
    const result = await adminChordService.getChord(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function createChord(req, res, next) {
  try {
    const result = await adminChordService.createChord(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function updateChord(req, res, next) {
  try {
    const result = await adminChordService.updateChord(req.params.id, req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function deleteChord(req, res, next) {
  try {
    const result = await adminChordService.deleteChord(req.params.id);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listChords,
  getChord,
  createChord,
  updateChord,
  deleteChord,
};
