const express = require('express');
const db = require('../db/connection');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         c.id,
         c.root,
         c.suffix,
         c.difficulty_level,
         COALESCE(
           jsonb_agg(to_jsonb(cp) - 'chord_id') FILTER (WHERE cp.chord_id IS NOT NULL),
           '[]'::jsonb
         ) AS positions
       FROM chords c
       LEFT JOIN chord_positions cp ON cp.chord_id = c.id
       GROUP BY c.id, c.root, c.suffix, c.difficulty_level
       ORDER BY c.root ASC, c.suffix ASC`,
    );

    return res.json({ chords: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         c.id,
         c.root,
         c.suffix,
         c.difficulty_level,
         COALESCE(
           jsonb_agg(to_jsonb(cp) - 'chord_id') FILTER (WHERE cp.chord_id IS NOT NULL),
           '[]'::jsonb
         ) AS positions
       FROM chords c
       LEFT JOIN chord_positions cp ON cp.chord_id = c.id
       WHERE c.id = $1
       GROUP BY c.id, c.root, c.suffix, c.difficulty_level`,
      [req.params.id],
    );
    const chord = result.rows[0];

    if (!chord) {
      return res.status(404).json({ message: 'Chord not found.' });
    }

    return res.json({ chord });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, rootNote, quality, tuning = 'standard', positions } = req.body;

    if (!name || !rootNote || !quality || !positions) {
      return res.status(400).json({
        message: 'Name, rootNote, quality and positions are required.',
      });
    }

    const result = await db.query(
      `INSERT INTO chords (name, root_note, quality, tuning, positions, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, root_note, quality, tuning, positions, created_at`,
      [name, rootNote, quality, tuning, JSON.stringify(positions), null],
    );

    return res.status(201).json({ chord: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
