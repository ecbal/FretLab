const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  let client;

  try {
    client = await pool.connect();
    console.log('Fretlab veritabanına başarıyla bağlanıldı');
  } catch (err) {
    console.error('Fretlab veritabanı bağlantı hatası:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      stack: err.stack,
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

testConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};
