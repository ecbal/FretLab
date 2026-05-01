const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chordRoutes = require('./routes/chords');
const userFavoriteRoutes = require('./routes/user_favorites');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'fretlab-backend' });
});

app.use('/api/auth', authRoutes);
app.use('/', authRoutes);
app.use('/api/chords', chordRoutes);
app.use('/api/user-favorites', userFavoriteRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error.' : err.message;

  res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`Fretlab backend is running on port ${PORT}`);
});
