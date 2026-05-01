const db = require('../db/connection');

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

async function listRecentChords(limit = 5) {
  const exists = await tableExists('public.chords');

  if (!exists) {
    return [];
  }

  const result = await db.query(
    `SELECT id, root, suffix, full_name, difficulty_level
     FROM public.chords
     ORDER BY root ASC, suffix ASC
     LIMIT $1`,
    [limit],
  );

  return result.rows;
}

module.exports = {
  tableExists,
  countRows,
  listRecentChords,
};
