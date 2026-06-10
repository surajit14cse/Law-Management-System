const pool = require('../config/db');

class User {
  static async create(data) {
    const { name, email, phone, password, role } = data;
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;
    
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [val(name), val(email), val(phone), val(password), val(role) || 'Junior']
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = User;
