const mysql = require('mysql2');
require('dotenv').config();

// Crea pool di connessioni
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Usa promesse invece di callback
const promisePool = pool.promise();

// Test connessione
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Connesso al database MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Errore connessione database:', error.message);
    process.exit(1);
  }
};

module.exports = { pool: promisePool, testConnection };