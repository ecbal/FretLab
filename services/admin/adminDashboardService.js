const adminRepository = require('../../repositories/adminRepository');
const userRepository = require('../../repositories/userRepository');

async function getDashboard() {
  const [
    totalUsers,
    totalChords,
    totalTunings,
    totalFavorites,
    recentUsers,
    recentChords,
  ] = await Promise.all([
    adminRepository.countRows('auth.users'),
    adminRepository.countRows('public.chords'),
    adminRepository.countRows('public.tunings'),
    adminRepository.countRows('public.user_favorites'),
    userRepository.listRecentUsers(5),
    adminRepository.listRecentChords(5),
  ]);

  return {
    metrics: {
      totalUsers,
      totalChords,
      totalTunings,
      totalFavorites,
    },
    recentUsers,
    recentChords,
  };
}

module.exports = {
  getDashboard,
};
