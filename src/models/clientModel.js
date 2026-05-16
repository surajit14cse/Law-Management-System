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

  static async addDocument(data) {
    const { client_id, file_name, file_path, file_type, file_size, category, description } = data;
    const [result] = await pool.query(
      'INSERT INTO client_documents (client_id, file_name, file_path, file_type, file_size, category, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client_id, file_name, file_path, file_type, file_size, category, description]
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
