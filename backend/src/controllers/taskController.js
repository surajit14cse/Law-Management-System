const Task = require('../models/taskModel');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll(req.user.id);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const taskId = await Task.create({ ...req.body, user_id: req.user.id });
    res.status(201).json({ id: taskId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    await Task.update(req.params.id, req.user.id, req.body);
    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.delete(req.params.id, req.user.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
