import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Phone, MapPin, Briefcase, ChevronLeft, Calendar, Gavel, MessageSquare, Send, FileText, Download, Trash2, Upload } from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docFormData, setDocFormData] = useState({ category: 'General', description: '' });

  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Fetch client basic info first
        const clientRes = await api.get(`/clients/${id}`);
        setClient(clientRes.data);
        
        // Fetch associated data in parallel
        const [casesRes, docsRes] = await Promise.allSettled([
          api.get(`/cases`),
          api.get(`/clients/${id}/documents`)
        ]);

        if (casesRes.status === 'fulfilled') {
          // Use lenient comparison (==) instead of strict (===) to handle potential string/number mismatches
          setCases(casesRes.value.data.filter(c => c.client_id == id));
        } else {
          console.error('Error fetching cases:', casesRes.reason);
        }

        if (docsRes.status === 'fulfilled') {
          setDocuments(docsRes.value.data);
        } else {
          console.error('Error fetching documents:', docsRes.reason);
        }

      } catch (error) {
        console.error('Error fetching client details:', error);
        // If client basic info fails, we can't show much
      } finally {
        setLoading(false);
      }
    };
    fetchClientData();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/clients/${id}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document', selectedFile);
    formData.append('category', docFormData.category);
    formData.append('description', docFormData.description);

    try {
      await api.post(`/clients/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFile(null);
      setDocFormData({ category: 'General', description: '' });
      fetchDocuments();
      alert('Document uploaded successfully');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.delete(`/clients/documents/${docId}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const sendNotification = async (type) => {
    setSending(true);
    try {
      const message = `Hello ${client.name}, this is a reminder from your legal counsel regarding your active cases. Please contact our office for updates.`;
      await api.post('/notifications/send-reminder', {
        clientId: id,
        type,
        message
      });
      alert(`${type.toUpperCase()} notification triggered successfully!`);
    } catch (error) {
      alert(`Failed to send ${type}: ` + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading client profile...</div>;
  if (!client) return <div className="p-8 text-center text-red-500">Client not found.</div>;

  return (
    <div className="space-y-6">
      <button 
        onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
      >
        <ChevronLeft size={20} /> Back to Clients
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-24 bg-blue-600"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                  <div className="w-full h-full rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                    {client.name ? client.name.charAt(0) : '?'}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{client.name || 'Unknown Client'}</h2>
              <p className="text-slate-500 text-sm mb-6 uppercase font-bold tracking-wider">Client Profile</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Mail className="text-slate-400 mt-1" size={18} />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                    <p className="text-sm font-medium text-slate-700">{client.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-slate-400 mt-1" size={18} />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                    <p className="text-sm font-medium text-slate-700">{client.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Notification Quick Actions */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Send Notifications</p>
                <button 
                  disabled={sending || !client.phone}
                  onClick={() => sendNotification('whatsapp')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-100 disabled:bg-slate-200"
                >
                  <MessageSquare size={18} /> WhatsApp Reminder
                </button>
                <button 
                  disabled={sending || !client.phone}
                  onClick={() => sendNotification('sms')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 disabled:bg-slate-200"
                >
                  <Send size={18} /> Send SMS Alert
                </button>
                {!client.phone && <p className="text-[10px] text-red-500 text-center italic">Phone number required</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Linked Cases */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="text-blue-600" size={20} />
                Associated Cases ({cases.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {cases.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">No cases registered for this client.</div>
              ) : (
                cases.map(c => (
                  <div key={c.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Gavel size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{c.case_number}</h4>
                        <p className="text-xs text-slate-500">{c.court_name} • {c.case_status}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => navigate(`/cases/${c.id}`)}
                      className="px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Client Documents */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Client Documents ({documents.length})
              </h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 border border-slate-200">
                    <Upload size={14} />
                    {selectedFile ? selectedFile.name : 'Select File'}
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                  {selectedFile && (
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:bg-slate-300"
                    >
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2">
                    <select 
                      className="text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                      value={docFormData.category}
                      onChange={(e) => setDocFormData({...docFormData, category: e.target.value})}
                    >
                      <option value="General">General</option>
                      <option value="ID Proof">ID Proof</option>
                      <option value="Legal Paper">Legal Paper</option>
                      <option value="Agreement">Agreement</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Others">Others</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Brief description..."
                      className="text-xs border border-slate-300 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500"
                      value={docFormData.description}
                      onChange={(e) => setDocFormData({...docFormData, description: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {documents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">No documents uploaded for this client.</div>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-slate-100 text-slate-500 rounded-lg">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-700 text-sm truncate">{doc.file_name}</h4>
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded uppercase tracking-tighter">
                            {doc.category || 'General'}
                          </span>
                        </div>
                        {doc.description && <p className="text-[10px] text-slate-500 truncate">{doc.description}</p>}
                        <p className="text-[10px] text-slate-400">
                          Uploaded on {new Date(doc.created_at).toLocaleDateString()} • {(doc.file_size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <a 
                        href={`${api.defaults.baseURL.replace('/api', '')}/${doc.file_path.replace(/\\/g, '/')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                      <button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
