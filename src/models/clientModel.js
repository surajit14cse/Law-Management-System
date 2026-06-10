const pool = require('../config/db');

class Client {
  static async create(data) {
    const { name, phone, email, address } = data;
    const [result] = await pool.query(
      'INSERT INTO clients (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone, email, address]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM clients');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, data) {
    const { name, phone, email, address } = data;
    await pool.query(
      'UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, phone, email, address, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM clients WHERE id = ?', [id]);
  }
}

module.exports = Client;
