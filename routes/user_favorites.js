const express = require('express');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         uf.id,
         uf.user_id,
         uf.chord_id,
         uf.created_at,
         c.root,
         c.suffix,
         c.difficulty_level
       FROM user_favorites uf
       JOIN chords c ON c.id = uf.chord_id
       WHERE uf.user_id = $1
       ORDER BY uf.created_at DESC`,
      [req.user.id],
    );

    return res.json({ favorites: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { chordId } = req.body;

    if (!chordId) {
      return res.status(400).json({ message: 'chordId is required.' });
    }

    const result = await db.query(
      `INSERT INTO user_favorites (user_id, chord_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, chord_id) DO NOTHING
       RETURNING id, user_id, chord_id, created_at`,
      [req.user.id, chordId],
    );

    if (!result.rows[0]) {
      return res.status(409).json({ message: 'Chord is already in favorites.' });
    }

    return res.status(201).json({ favorite: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.delete('/:chordId', async (req, res, next) => {
  try {
    const result = await db.query(
      `DELETE FROM user_favorites
       WHERE user_id = $1 AND chord_id = $2
       RETURNING id, user_id, chord_id`,
      [req.user.id, req.params.chordId],
    );

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Favorite not found.' });
    }

    return res.json({ favorite: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
