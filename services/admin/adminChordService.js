const db = require('../../db/connection');
const HttpError = require('../../utils/httpError');
const chordRepository = require('../../repositories/chordRepository');

function normalizePosition(position) {
  return {
    baseFret: position.baseFret ?? 0,
    frets: position.frets,
    fingers: position.fingers ?? null,
    isBarre: Boolean(position.isBarre),
  };
}

function validatePosition(position, index) {
  if (!Array.isArray(position.frets) || position.frets.length !== 6) {
    throw new HttpError(400, `positions[${index}].frets must be an array with 6 values.`);
  }

  if (position.fingers && (!Array.isArray(position.fingers) || position.fingers.length !== 6)) {
    throw new HttpError(400, `positions[${index}].fingers must be an array with 6 values.`);
  }
}

function normalizeChordInput(input, { partial = false } = {}) {
  const normalized = {
    root: input.root && String(input.root).trim(),
    suffix: input.suffix && String(input.suffix).trim(),
    fullName: input.fullName && String(input.fullName).trim(),
    difficultyLevel: input.difficultyLevel === undefined ? undefined : Number(input.difficultyLevel),
    positions: Array.isArray(input.positions) ? input.positions.map(normalizePosition) : undefined,
  };

  if (!partial && (!normalized.root || !normalized.suffix || !normalized.fullName)) {
    throw new HttpError(400, 'root, suffix and fullName are required.');
  }

  if (!partial && normalized.positions === undefined) {
    throw new HttpError(400, 'positions array is required.');
  }

  if (normalized.difficultyLevel !== undefined && (!Number.isInteger(normalized.difficultyLevel) || normalized.difficultyLevel < 1)) {
    throw new HttpError(400, 'difficultyLevel must be a positive integer.');
  }

  if (normalized.positions) {
    normalized.positions.forEach(validatePosition);
  }

  return normalized;
}

async function listChords(query) {
  const limit = Math.min(Number(query.limit) || 50, 100);
  const offset = Math.max(Number(query.offset) || 0, 0);

  const chords = await chordRepository.listChords({
    search: query.search ? String(query.search).trim() : null,
    root: query.root ? String(query.root).trim() : null,
    suffix: query.suffix ? String(query.suffix).trim() : null,
    difficultyLevel: query.difficultyLevel ? Number(query.difficultyLevel) : null,
    limit,
    offset,
  });

  return {
    chords,
    pagination: {
      limit,
      offset,
    },
  };
}

async function getChord(id) {
  const chord = await chordRepository.findChordById(id);

  if (!chord) {
    throw new HttpError(404, 'Chord not found.');
  }

  return { chord };
}

async function createChord(input) {
  const normalized = normalizeChordInput(input);
  let client;

  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    const chord = await chordRepository.createChord(client, {
      root: normalized.root,
      suffix: normalized.suffix,
      fullName: normalized.fullName,
      difficultyLevel: normalized.difficultyLevel ?? 1,
    });

    await chordRepository.createChordPositions(client, chord.id, normalized.positions);
    await client.query('COMMIT');

    return getChord(chord.id);
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function updateChord(id, input) {
  const normalized = normalizeChordInput(input, { partial: true });
  let client;

  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    const chord = await chordRepository.updateChord(client, id, normalized);

    if (!chord) {
      throw new HttpError(404, 'Chord not found.');
    }

    if (normalized.positions) {
      await chordRepository.deleteChordPositions(client, id);
      await chordRepository.createChordPositions(client, id, normalized.positions);
    }

    await client.query('COMMIT');

    return getChord(id);
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function deleteChord(id) {
  let client;

  try {
    client = await db.pool.connect();
    await client.query('BEGIN');

    const chord = await chordRepository.deleteChord(client, id);

    if (!chord) {
      throw new HttpError(404, 'Chord not found.');
    }

    await client.query('COMMIT');

    return { chord };
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  listChords,
  getChord,
  createChord,
  updateChord,
  deleteChord,
};
