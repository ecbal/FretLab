const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');

const router = express.Router();
const SALT_ROUNDS = 10;

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

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}

router.post('/register', async (req, res, next) => {
  let client;

  try {
    const email = req.body.email && req.body.email.trim().toLowerCase();
    const username = req.body.username && req.body.username.trim();
    const { password } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, username and password are required.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    client = await db.pool.connect();
    await client.query('BEGIN');

    const userResult = await client.query(
      `INSERT INTO auth.users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email`,
      [email, passwordHash],
    );
    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO public.profiles (id, username)
       VALUES ($1, $2)`,
      [user.id, username],
    );

    await client.query('COMMIT');

    return res.status(201).json({
      user: toPublicUser({
        ...user,
        username,
      }),
    });
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (err.code === '23505') {
      const constraint = err.constraint || '';

      if (constraint.includes('email')) {
        return res.status(409).json({ message: 'Email is already in use.' });
      }

      if (constraint.includes('username')) {
        return res.status(409).json({ message: 'Username is already in use.' });
      }

      return res.status(409).json({ message: 'Email or username is already in use.' });
    }

    return next(err);
  } finally {
    if (client) {
      client.release();
    }
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email && req.body.email.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await db.query(
      `SELECT u.id, u.email, p.username, u.password_hash
       FROM auth.users u
       LEFT JOIN public.profiles p ON p.id = u.id
       WHERE u.email = $1`,
      [email],
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createToken(user);

    return res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
