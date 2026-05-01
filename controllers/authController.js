const authService = require('../services/authService');

function normalizeRegisterBody(body) {
  return {
    email: body.email && body.email.trim().toLowerCase(),
    username: body.username && body.username.trim(),
    password: body.password,
  };
}

function normalizeLoginBody(body) {
  return {
    email: body.email && body.email.trim().toLowerCase(),
    password: body.password,
  };
}

async function register(req, res, next) {
  try {
    const input = normalizeRegisterBody(req.body);

    if (!input.email || !input.password || !input.username) {
      return res.status(400).json({ message: 'Email, username and password are required.' });
    }

    const result = await authService.register(input);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const input = normalizeLoginBody(req.body);

    if (!input.email || !input.password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const result = await authService.login(input);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
};
