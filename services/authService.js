const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const HttpError = require('../utils/httpError');
const userRepository = require('../repositories/userRepository');
const profileRepository = require('../repositories/profileRepository');

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    status: user.status,
  };
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  );
}

function handleUniqueViolation(err) {
  const constraint = err.constraint || '';

  if (constraint.includes('email')) {
    throw new HttpError(409, 'Email is already in use.');
  }

  if (constraint.includes('username')) {
    throw new HttpError(409, 'Username is already in use.');
  }

  throw new HttpError(409, 'Email or username is already in use.');
}

async function register({ email, username, password }) {
  let client;

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    client = await db.pool.connect();
    await client.query('BEGIN');

    const user = await userRepository.createUser(client, { email, passwordHash });
    const profile = await profileRepository.createProfile(client, {
      id: user.id,
      username,
    });

    await client.query('COMMIT');

    return {
      user: toPublicUser({
        ...user,
        ...profile,
      }),
    };
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (err.code === '23505') {
      handleUniqueViolation(err);
    }

    throw err;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function login({ email, password }) {
  const user = await userRepository.findByEmailWithProfile(email);

  if (!user) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  return {
    token: createToken(user),
    user: toPublicUser(user),
  };
}

module.exports = {
  register,
  login,
};
