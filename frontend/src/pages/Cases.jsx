import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Search, Gavel, Calendar, User, Filter, X } from 'lucide-react';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({ 
    client_id: '', case_number: '', case_year: '', court_type: '', 
    court_name: '', presiding_judge: '', police_station: '', 
    opposite_party: '', opposing_counsel: '', description: '',
    hearing_date: '' 
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
    fetchClients();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await api.get('/cases');
      setCases(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cases', formData);
      setShowModal(false);
      setFormData({ 
        client_id: '', case_number: '', case_year: '', court_type: '', 
        court_name: '', presiding_judge: '', police_station: '', 
        opposite_party: '', opposing_counsel: '', description: '',
        hearing_date: ''
      });
      fetchCases();
      alert('Case registered successfully!');
    } catch (error) {
      console.error('Error creating case:', error);
      const errorMsg = error.response?.data?.message || 'Failed to create case. Please try again.';
      alert(errorMsg);
    }
  };

  const filteredCases = filterDate 
    ? cases.filter(c => c.next_hearing_date && c.next_hearing_date.startsWith(filterDate))
    : cases;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Case Management</h1>
          <p className="text-sm text-slate-500">Track and manage active legal cases</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Case
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search cases..." 
                className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wide">
                <Filter size={16} /> Filter by Date:
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input 
                  type="date" 
                  className="flex-1 sm:flex-none border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                {filterDate && (
                  <button 
                    onClick={() => setFilterDate('')}
                    className="text-xs text-red-500 font-bold hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Next Hearing</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-sm text-slate-500">Loading cases...</td></tr>
              ) : filteredCases.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-4 text-center py-10 text-slate-500 text-sm">No cases found</td></tr>
              ) : filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Gavel size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 text-sm truncate">{c.case_number}</div>
                        <div className="text-[10px] text-slate-500 truncate">{c.court_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-700 font-medium truncate max-w-[120px]">
                      <User size={12} className="text-slate-400 shrink-0" /> {c.client_name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {c.next_hearing_date ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                        <Calendar size={12} />
                        {new Date(c.next_hearing_date).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">Not Scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.case_status === 'Active' ? 'bg-green-100 text-green-700' : 
                      c.case_status === 'Closed' ? 'bg-slate-100 text-slate-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {c.case_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                    >
                      View Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Register New Case</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Select Client</label>
                  <select 
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={formData.client_id}
                    onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  >
                    <option value="">Choose a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Case Number <span className="text-slate-400 font-normal lowercase">(Auto-generated if empty)</span>
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 123/2026"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={formData.case_number}
                    onChange={(e) => setFormData({...formData, case_number: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Court Name</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={formData.court_name}
                    onChange={(e) => setFormData({...formData, court_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Initial Hearing Date</label>
                  <input 
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all font-bold text-blue-600"
                    value={formData.hearing_date}
                    onChange={(e) => setFormData({...formData, hearing_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Presiding Judge</label>
                  <input 
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={formData.presiding_judge}
                    onChange={(e) => setFormData({...formData, presiding_judge: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Opposite Party</label>
                  <input 
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={formData.opposite_party}
                    onChange={(e) => setFormData({...formData, opposite_party: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Case Description / Notes</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-20 text-sm transition-all resize-none"
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
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cases;
