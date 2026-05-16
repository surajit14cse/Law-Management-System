const pool = require('../config/db');

class Task {
  static async create(data) {
    const { case_id, title, description, priority, due_date } = data;
    const [result] = await pool.query(
      'INSERT INTO tasks (case_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?)',
      [case_id || null, title, description, priority || 'Medium', due_date]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT tasks.*, cases.case_number 
      FROM tasks 
      LEFT JOIN cases ON tasks.case_id = cases.id
      ORDER BY due_date ASC
    `);
    return rows;
  }

  static async findByCaseId(caseId) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE case_id = ?', [caseId]);
    return rows;
  }

  static async update(id, data) {
    const { title, description, priority, due_date, status } = data;
    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ?',
      [title, description, priority, due_date, status, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
  }
}

module.exports = Task;
