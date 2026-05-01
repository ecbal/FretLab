const adminRepository = require('../../repositories/adminRepository');
const userRepository = require('../../repositories/userRepository');

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

module.exports = {
  listUsers,
};
