const db = require('../db/connection');

const chordSelectWithPositions = `
  SELECT
    c.id,
    c.root,
    c.suffix,
    c.full_name,
    c.difficulty_level,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', cp.id,
          'base_fret', cp.base_fret,
          'frets', cp.frets,
          'fingers', cp.fingers,
          'is_barre', cp.is_barre
        )
        ORDER BY cp.base_fret ASC, cp.id ASC
      ) FILTER (WHERE cp.id IS NOT NULL),
      '[]'::jsonb
    ) AS positions
  FROM public.chords c
  LEFT JOIN public.chord_positions cp ON cp.chord_id = c.id
`;

async function listChords({ search, root, suffix, difficultyLevel, limit, offset }) {
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(c.full_name ILIKE $${params.length} OR c.root ILIKE $${params.length} OR c.suffix ILIKE $${params.length})`);
  }

  if (root) {
    params.push(root);
    where.push(`c.root = $${params.length}`);
  }

  if (suffix) {
    params.push(suffix);
    where.push(`c.suffix = $${params.length}`);
  }

  if (difficultyLevel) {
    params.push(difficultyLevel);
    where.push(`c.difficulty_level = $${params.length}`);
  }

  params.push(limit);
  const limitIndex = params.length;
  params.push(offset);
  const offsetIndex = params.length;

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const result = await db.query(
    `${chordSelectWithPositions}
     ${whereClause}
     GROUP BY c.id, c.root, c.suffix, c.full_name, c.difficulty_level
     ORDER BY c.root ASC, c.suffix ASC, c.full_name ASC
     LIMIT $${limitIndex}
     OFFSET $${offsetIndex}`,
    params,
  );

  return result.rows;
}

async function findChordById(id) {
  const result = await db.query(
    `${chordSelectWithPositions}
     WHERE c.id = $1
     GROUP BY c.id, c.root, c.suffix, c.full_name, c.difficulty_level`,
    [id],
  );

  return result.rows[0];
}

async function createChord(client, { root, suffix, fullName, difficultyLevel }) {
  const result = await client.query(
    `INSERT INTO public.chords (root, suffix, full_name, difficulty_level)
     VALUES ($1, $2, $3, $4)
     RETURNING id, root, suffix, full_name, difficulty_level`,
    [root, suffix, fullName, difficultyLevel],
  );

  return result.rows[0];
}

async function updateChord(client, id, { root, suffix, fullName, difficultyLevel }) {
  const result = await client.query(
    `UPDATE public.chords
     SET
       root = COALESCE($2, root),
       suffix = COALESCE($3, suffix),
       full_name = COALESCE($4, full_name),
       difficulty_level = COALESCE($5, difficulty_level)
     WHERE id = $1
     RETURNING id, root, suffix, full_name, difficulty_level`,
    [id, root, suffix, fullName, difficultyLevel],
  );

  return result.rows[0];
}

async function deleteChordPositions(client, chordId) {
  await client.query(
    'DELETE FROM public.chord_positions WHERE chord_id = $1',
    [chordId],
  );
}

async function createChordPositions(client, chordId, positions) {
  if (!positions.length) {
    return [];
  }

  const created = [];

  for (const position of positions) {
    const result = await client.query(
      `INSERT INTO public.chord_positions (chord_id, base_fret, frets, fingers, is_barre)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, chord_id, base_fret, frets, fingers, is_barre`,
      [
        chordId,
        position.baseFret,
        position.frets,
        position.fingers,
        position.isBarre,
      ],
    );

    created.push(result.rows[0]);
  }

  return created;
}

async function deleteChord(client, id) {
  await deleteChordPositions(client, id);

  const result = await client.query(
    `DELETE FROM public.chords
     WHERE id = $1
     RETURNING id, root, suffix, full_name, difficulty_level`,
    [id],
  );

  return result.rows[0];
}

module.exports = {
  listChords,
  findChordById,
  createChord,
  updateChord,
  deleteChordPositions,
  createChordPositions,
  deleteChord,
};
