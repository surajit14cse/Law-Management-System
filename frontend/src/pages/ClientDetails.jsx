import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Phone, MapPin, Briefcase, ChevronLeft, Calendar, Gavel, MessageSquare, Send } from 'lucide-react';

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const clientRes = await api.get(`/clients/${id}`);
        const casesRes = await api.get(`/cases`);
        setClient(clientRes.data);
        setCases(casesRes.data.filter(c => c.client_id === parseInt(id)));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setLoading(false);
      }
    };
    fetchClientData();
  }, [id]);

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
                    {client.name.charAt(0)}
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{client.name}</h2>
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
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
