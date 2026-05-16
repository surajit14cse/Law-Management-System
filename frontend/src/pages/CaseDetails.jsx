import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Gavel, User, Calendar, MapPin, Scale, ChevronLeft, Info, Clock, AlertCircle, Edit, FileText, X } from 'lucide-react';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Modal State
  const [showEditModal, setShowModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    case_number: '', case_year: '', court_type: '', 
    court_name: '', presiding_judge: '', police_station: '', 
    opposite_party: '', opposing_counsel: '', description: '',
    case_status: ''
  });

  const fetchCaseData = async () => {
    try {
      const caseRes = await api.get(`/cases/${id}`);
      const hearingsRes = await api.get(`/hearings/case/${id}`);
      setCaseData(caseRes.data);
      setHearings(hearingsRes.data);
      setEditFormData(caseRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching case details:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/cases/${id}`, editFormData);
      setShowModal(false);
      fetchCaseData();
    } catch (error) {
      console.error('Error updating case:', error);
    }
  };

  const generateReport = () => {
    const printWindow = window.open('', '_blank');
    const hearingRows = hearings.map(h => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${new Date(h.hearing_date).toLocaleDateString()}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${h.stage || 'N/A'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${h.outcome || 'Pending'}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${h.next_hearing_date ? new Date(h.next_hearing_date).toLocaleDateString() : 'N/A'}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Case Report - ${caseData.case_number}</title>
          <style>
            body { font-family: sans-serif; line-height: 1.6; color: #333; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; font-size: 18px; color: #2563eb; margin-bottom: 10px; border-bottom: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .label { font-weight: bold; color: #666; width: 150px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CASE SUMMARY REPORT</h1>
            <p>Law Management System - Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="section">
            <div class="section-title">Case Information</div>
            <table>
              <tr><td class="label">Case Number:</td><td>${caseData.case_number}</td></tr>
              <tr><td class="label">Year:</td><td>${caseData.case_year}</td></tr>
              <tr><td class="label">Status:</td><td>${caseData.case_status}</td></tr>
              <tr><td class="label">Court:</td><td>${caseData.court_name} (${caseData.court_type})</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Parties Details</div>
            <table>
              <tr><td class="label">Client:</td><td>${caseData.client_name}</td></tr>
              <tr><td class="label">Opposite Party:</td><td>${caseData.opposite_party || 'N/A'}</td></tr>
              <tr><td class="label">Opposing Counsel:</td><td>${caseData.opposing_counsel || 'N/A'}</td></tr>
            </table>
          </div>
          <div class="section">
            <div class="section-title">Hearing History</div>
            <table>
              <thead>
                <tr style="background: #f8fafc;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Date</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Stage</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Outcome</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Next Date</th>
                </tr>
              </thead>
              <tbody>${hearingRows}</tbody>
            </table>
          </div>
          <div style="margin-top: 50px; text-align: right; border-top: 1px solid #eee; padding-top: 10px; font-size: 12px; color: #999;">
            Authorized Signature
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="p-8 text-center text-slate-500 italic">Loading case file...</div>;
  if (!caseData) return <div className="p-8 text-center text-red-500">Case not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/cases')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
      >
        <ChevronLeft size={20} /> Back to Cases
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Case Info */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                  <Gavel size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{caseData.case_number}</h2>
                  <p className="text-sm text-slate-500 font-medium">Year: {caseData.case_year} • {caseData.court_type}</p>
                </div>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                caseData.case_status === 'Active' ? 'bg-green-100 text-green-700' : 
                caseData.case_status === 'Closed' ? 'bg-slate-100 text-slate-700' : 
                'bg-yellow-100 text-yellow-700'
              }`}>
                {caseData.case_status}
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} /> Court Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Court Name</p>
                    <p className="font-semibold text-slate-700">{caseData.court_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Presiding Judge</p>
                    <p className="font-semibold text-slate-700">{caseData.presiding_judge || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Scale size={14} /> Parties & Counsel
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Client</p>
                    <button 
                      onClick={() => navigate(`/clients/${caseData.client_id}`)}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {caseData.client_name}
                    </button>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Opposite Party</p>
                    <p className="font-semibold text-slate-700">{caseData.opposite_party || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hearing Timeline */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="text-blue-600" size={20} />
              Hearing Timeline
            </h3>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100">
              {hearings.length === 0 ? (
                <div className="pl-12 py-4 text-slate-500 italic">No hearing records found.</div>
              ) : (
                hearings.map((h, idx) => (
                  <div key={h.id} className="relative flex items-start pl-12 group">
                    <div className={`absolute left-0 mt-1.5 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <Calendar size={16} />
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-4 border border-slate-100 group-hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-800">{new Date(h.hearing_date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{h.stage}</span>
                      </div>
                      <p className="text-sm text-slate-600 italic">"{h.outcome || 'No outcome recorded'}"</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats/Sidebar */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowModal(true)}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Edit size={16} />
                Edit Case Details
              </button>
              <button 
                onClick={generateReport}
                className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all text-sm flex items-center justify-center gap-2 border border-slate-200"
              >
                <FileText size={16} />
                Generate Case Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Case Information</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Case Number</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={editFormData.case_number}
                    onChange={(e) => setEditFormData({...editFormData, case_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Status</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-white"
                    value={editFormData.case_status}
                    onChange={(e) => setEditFormData({...editFormData, case_status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Court Name</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={editFormData.court_name}
                    onChange={(e) => setEditFormData({...editFormData, court_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Presiding Judge</label>
                  <input 
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={editFormData.presiding_judge}
                    onChange={(e) => setEditFormData({...editFormData, presiding_judge: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Case Description</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm transition-all resize-none"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
