const pool = require('../config/db');

class Client {
  static async create(data) {
    const { user_id, name, phone, email, address } = data;
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;
    
    const [result] = await pool.query(
      'INSERT INTO clients (user_id, name, phone, email, address) VALUES (?, ?, ?, ?, ?)',
      [val(user_id), val(name), val(phone), val(email), val(address)]
    );
    return result.insertId;
  }

  static async findAll(userId) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE user_id = ?', [userId]);
    return rows;
  }

  static async findById(id, userId) {
    const [rows] = await pool.query('SELECT * FROM clients WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0];
  }

  static async update(id, userId, data) {
    const { name, phone, email, address } = data;
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;

    await pool.query(
      'UPDATE clients SET name = ?, phone = ?, email = ?, address = ? WHERE id = ? AND user_id = ?',
      [val(name), val(phone), val(email), val(address), id, userId]
    );
  }

  static async delete(id, userId) {
    await pool.query('DELETE FROM clients WHERE id = ? AND user_id = ?', [id, userId]);
  }

  static async addDocument(data) {
    const { client_id, file_name, file_path, file_type, file_size, category, description } = data;
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;

    const [result] = await pool.query(
      'INSERT INTO client_documents (client_id, file_name, file_path, file_type, file_size, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        val(client_id), 
        val(file_name), 
        val(file_path), 
        val(file_type), 
        val(file_size), 
        val(category), 
        val(description)
      ]
    );
    return result.insertId;
  }

  static async getDocuments(clientId) {
    const [rows] = await pool.query('SELECT * FROM client_documents WHERE client_id = ?', [clientId]);
    return rows;
  }

  static async getDocumentById(docId) {
    const [rows] = await pool.query('SELECT * FROM client_documents WHERE id = ?', [docId]);
    return rows[0];
  }

  static async deleteDocument(docId) {
    await pool.query('DELETE FROM client_documents WHERE id = ?', [docId]);
  }
}

module.exports = Client;
