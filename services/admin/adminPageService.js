const fs = require('fs/promises');
const path = require('path');
const HttpError = require('../../utils/httpError');

const allowedFeatures = new Set([
  'login',
  'dashboard',
  'users',
  'chords',
  'chord-create',
]);

const dashboardRoot = process.env.DASHBOARD_DIR
  ? path.resolve(process.env.DASHBOARD_DIR)
  : path.resolve(__dirname, '../../../fretlab-dashboard');

async function getFeaturePage(featureName) {
  if (!allowedFeatures.has(featureName)) {
    throw new HttpError(404, 'Dashboard page not found.');
  }

  const htmlPath = path.join(
    dashboardRoot,
    'src',
    'features',
    featureName,
    `${featureName}.html`,
  );

  const normalizedPath = path.resolve(htmlPath);
  const expectedRoot = path.resolve(dashboardRoot, 'src', 'features');

  if (!normalizedPath.startsWith(expectedRoot)) {
    throw new HttpError(403, 'Dashboard page path is not allowed.');
  }

  try {
    const html = await fs.readFile(normalizedPath, 'utf8');

    return {
      feature: featureName,
      html,
      source: 'dashboard-src',
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new HttpError(404, 'Dashboard page file not found.');
    }

    throw err;
  }
}

module.exports = {
  getFeaturePage,
};
