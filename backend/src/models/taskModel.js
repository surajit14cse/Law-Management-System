const pool = require('../config/db');

class Task {
  static async create(data) {
    const { user_id, case_id, title, description, priority, due_date } = data;
    
    // Helper to convert undefined or empty string to null
    const val = (v) => (v === undefined || v === '' || v === null) ? null : v;

    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, case_id, title, description, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        val(user_id), 
        val(case_id), 
        val(title), 
        val(description), 
        val(priority) || 'Medium', 
        val(due_date)
      ]
    );
    return result.insertId;
  }

  static async findAll(userId) {
    const query = userId 
      ? `SELECT tasks.*, cases.case_number FROM tasks LEFT JOIN cases ON tasks.case_id = cases.id WHERE tasks.user_id = ? ORDER BY due_date ASC`
      : `SELECT tasks.*, cases.case_number FROM tasks LEFT JOIN cases ON tasks.case_id = cases.id ORDER BY due_date ASC`;
    
    const [rows] = await pool.query(query, userId ? [userId] : []);
    return rows;
  }

  static async findByCaseId(caseId) {
    const [rows] = await pool.query('SELECT * FROM tasks WHERE case_id = ?', [caseId]);
    return rows;
  }

  static async update(id, userId, data) {
    const { title, description, priority, due_date, status } = data;
    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, due_date = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, description, priority, due_date, status, id, userId]
    );
  }

  static async delete(id, userId) {
    await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  }
}

module.exports = Task;
