const db = require('../db/connection');

async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication is required.' });
    }

    const result = await db.query(
      `SELECT role, status
       FROM public.profiles
       WHERE id = $1`,
      [req.user.id],
    );
    const profile = result.rows[0];

    if (!profile) {
      return res.status(403).json({ message: 'Profile not found for authenticated user.' });
    }

    if (profile.status !== 'active') {
      return res.status(403).json({ message: 'User account is not active.' });
    }

    if (!['admin', 'owner'].includes(profile.role)) {
      return res.status(403).json({ message: 'Admin access is required.' });
    }

    req.admin = {
      role: profile.role,
      status: profile.status,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = requireAdmin;
