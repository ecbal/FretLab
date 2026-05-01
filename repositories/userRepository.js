const db = require('../db/connection');

async function createUser(client, { email, passwordHash }) {
  const result = await client.query(
    `INSERT INTO auth.users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email`,
    [email, passwordHash],
  );

  return result.rows[0];
}

async function findByEmailWithProfile(email) {
  const result = await db.query(
    `SELECT u.id, u.email, p.username, p.role, p.status, u.password_hash
     FROM auth.users u
     LEFT JOIN public.profiles p ON p.id = u.id
     WHERE u.email = $1`,
    [email],
  );

  return result.rows[0];
}

async function listRecentUsers(limit = 5) {
  const result = await db.query(
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
     LIMIT $1`,
    [limit],
  );

  return result.rows;
}

async function listUsers({ search, limit, offset, includeFavoriteCount }) {
  const favoriteSelect = includeFavoriteCount
    ? 'COUNT(uf.chord_id)::int AS favorite_count'
    : '0::int AS favorite_count';
  const favoriteJoin = includeFavoriteCount
    ? 'LEFT JOIN public.user_favorites uf ON uf.user_id = u.id'
    : '';

  const whereClause = search
    ? 'WHERE u.email ILIKE $1 OR p.username ILIKE $1'
    : '';
  const params = search
    ? [`%${search}%`, limit, offset]
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

  return result.rows;
}

module.exports = {
  createUser,
  findByEmailWithProfile,
  listRecentUsers,
  listUsers,
};
