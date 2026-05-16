import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, CheckCircle, Circle, AlertCircle, Clock, Trash2, X } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', due_date: '', case_id: '' });
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchTasks();
    fetchCases();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases');
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      setShowModal(false);
      setFormData({ title: '', description: '', priority: 'Medium', due_date: '', case_id: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
      await api.put(`/tasks/${task.id}`, { ...task, status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
      case 'Low': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Task Management</h1>
          <p className="text-sm text-slate-500">Drafting, research, and legal deadlines</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-sm italic">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white p-10 lg:p-16 rounded-xl border-2 border-dashed border-slate-200 text-center">
            <CheckCircle size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">All caught up!</h3>
            <p className="text-slate-500 text-sm">You have no pending tasks or deadlines.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`group bg-white p-4 lg:p-5 rounded-xl border transition-all flex items-start gap-3 lg:gap-4 ${task.status === 'Completed' ? 'opacity-60 border-slate-200 bg-slate-50/50' : 'border-slate-200 hover:border-blue-300 shadow-sm'}`}>
              <button 
                onClick={() => toggleTaskStatus(task)}
                className="mt-1 transition-transform hover:scale-110 shrink-0"
              >
                {task.status === 'Completed' ? (
                  <CheckCircle size={22} className="text-green-500 fill-green-50" />
                ) : (
                  <Circle size={22} className="text-slate-300 hover:text-blue-500" />
                )}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-1.5">
                  <h3 className={`font-bold text-slate-800 text-sm lg:text-base truncate ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border tracking-wider shrink-0 ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  {task.due_date && (
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded">
                      <Clock size={12} className="text-slate-400" />
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {task.case_number && (
                    <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded text-blue-600">
                      <AlertCircle size={12} />
                      <span>Case: {task.case_number}</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="lg:opacity-0 lg:group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Task Title</label>
                <input 
                  type="text" required
                  placeholder="e.g. Draft Bail Petition"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Link to Case (Optional)</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all appearance-none bg-white"
                  value={formData.case_id}
                  onChange={(e) => setFormData({...formData, case_id: e.target.value})}
                >
                  <option value="">No Case Linked</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.case_number} - {c.client_name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Priority</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-white"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Due Date</label>
                  <input 
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Task Description</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
