const { pool } = require('../config/database');

class User {
  // Trova utente per email
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  // Trova utente per username
  static async findByUsername(username) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  // Trova utente per ID
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Crea nuovo utente
  static async create(username, email, hashedPassword) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    return result.insertId;
  }

  // Ottieni tutti gli utenti (per test)
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users'
    );
    return rows;
  }
}

module.exports = User;