const express = require('express');
const db = require('../db/connection');
const { authenticateToken } = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

async function tableExists(qualifiedTableName) {
  const result = await db.query('SELECT to_regclass($1) AS table_name', [qualifiedTableName]);
  return Boolean(result.rows[0].table_name);
}

async function countRows(qualifiedTableName) {
  const exists = await tableExists(qualifiedTableName);

  if (!exists) {
    return 0;
  }

  const result = await db.query(`SELECT COUNT(*)::int AS count FROM ${qualifiedTableName}`);
  return result.rows[0].count;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalChords,
      totalTunings,
      totalFavorites,
      chordsExist,
    ] = await Promise.all([
      countRows('auth.users'),
      countRows('public.chords'),
      countRows('public.tunings'),
      countRows('public.user_favorites'),
      tableExists('public.chords'),
    ]);

    const recentUsersResult = await db.query(
      `SELECT
         u.id,
         u.email,
         p.username,
         p.full_name,
         p.role,
         p.status,
         p.updated_at
       FROM auth.users u
       LEFT JOIN public.profiles p ON p.id = u.id
       ORDER BY p.updated_at DESC NULLS LAST, u.email ASC
       LIMIT 5`,
    );

    const recentChordsResult = chordsExist
      ? await db.query(
        `SELECT id, root, suffix, full_name, difficulty_level
         FROM public.chords
         ORDER BY root ASC, suffix ASC
         LIMIT 5`,
      )
      : { rows: [] };

    return res.json({
      metrics: {
        totalUsers,
        totalChords,
        totalTunings,
        totalFavorites,
      },
      recentUsers: recentUsersResult.rows,
      recentChords: recentChordsResult.rows,
    });
  } catch (err) {
    return next(err);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const search = req.query.search ? `%${String(req.query.search).trim()}%` : null;
    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const favoritesExist = await tableExists('public.user_favorites');

    const favoriteSelect = favoritesExist
      ? 'COUNT(uf.chord_id)::int AS favorite_count'
      : '0::int AS favorite_count';
    const favoriteJoin = favoritesExist
      ? 'LEFT JOIN public.user_favorites uf ON uf.user_id = u.id'
      : '';

    const whereClause = search
      ? 'WHERE u.email ILIKE $1 OR p.username ILIKE $1'
      : '';
    const params = search
      ? [search, limit, offset]
      : [limit, offset];
    const limitIndex = search ? 2 : 1;
    const offsetIndex = search ? 3 : 2;

    const result = await db.query(
      `SELECT
         u.id,
         u.email,
         p.username,
         p.full_name,
         p.avatar_url,
         p.role,
         p.status,
         p.updated_at,
         ${favoriteSelect}
       FROM auth.users u
       LEFT JOIN public.profiles p ON p.id = u.id
       ${favoriteJoin}
       ${whereClause}
       GROUP BY u.id, u.email, p.username, p.full_name, p.avatar_url, p.role, p.status, p.updated_at
       ORDER BY p.updated_at DESC NULLS LAST, u.email ASC
       LIMIT $${limitIndex}
       OFFSET $${offsetIndex}`,
      params,
    );

    return res.json({
      users: result.rows,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
