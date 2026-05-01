const adminRepository = require('../../repositories/adminRepository');
const userRepository = require('../../repositories/userRepository');
const HttpError = require('../../utils/httpError');

async function listUsers({ search, limit, offset }) {
  const normalizedSearch = search ? String(search).trim() : null;
  const normalizedLimit = Math.min(Number(limit) || 25, 100);
  const normalizedOffset = Math.max(Number(offset) || 0, 0);
  const favoritesExist = await adminRepository.tableExists('public.user_favorites');

  const users = await userRepository.listUsers({
    search: normalizedSearch,
    limit: normalizedLimit,
    offset: normalizedOffset,
    includeFavoriteCount: favoritesExist,
  });

  return {
    users,
    pagination: {
      limit: normalizedLimit,
      offset: normalizedOffset,
    },
  };
}

async function getUser(id) {
  const favoritesExist = await adminRepository.tableExists('public.user_favorites');
  const user = await userRepository.findUserById(id, {
    includeFavoriteCount: favoritesExist,
    includeFavorites: favoritesExist,
  });

  if (!user) {
    throw new HttpError(404, 'User not found.');
  }

  return { user };
}

module.exports = {
  listUsers,
  getUser,
};
