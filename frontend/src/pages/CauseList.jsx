import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar as CalendarIcon, Filter, MapPin, User, Scale, Clock, Edit3, X } from 'lucide-react';

const CauseList = () => {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [outcomeData, setOutcomeData] = useState({ outcome: '', next_hearing_date: '', stage: '' });

  useEffect(() => {
    fetchHearings();
  }, [selectedDate]);

  const fetchHearings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/hearings/date?date=${selectedDate}`);
      setHearings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hearings:', error);
      setLoading(false);
    }
  };

  const handleUpdateOutcome = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/hearings/${selectedHearing.id}/outcome`, {
        ...outcomeData,
        case_id: selectedHearing.case_id
      });
      setShowOutcomeModal(false);
      setOutcomeData({ outcome: '', next_hearing_date: '', stage: '' });
      fetchHearings();
    } catch (error) {
      console.error('Error updating outcome:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Daily Cause List</h1>
          <p className="text-sm text-slate-500">Your court schedule for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
          <CalendarIcon size={18} className="text-slate-400 ml-2" />
          <input 
            type="date" 
            className="border-none focus:ring-0 text-slate-700 font-bold outline-none text-sm flex-1 sm:flex-none"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-sm">
            Loading your schedule...
          </div>
        ) : hearings.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Hearings Scheduled</h3>
            <p className="text-slate-500 text-sm">You have a clear schedule for this date.</p>
          </div>
        ) : (
          hearings.map((hearing) => (
            <div key={hearing.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:border-blue-300 transition-colors">
              <div className="w-full sm:w-2 h-2 sm:h-auto bg-blue-600"></div>
              <div className="flex-1 p-4 lg:p-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded shrink-0">
                      {hearing.hearing_time ? hearing.hearing_time.substring(0, 5) : 'TBD'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base lg:text-lg truncate">Case: {hearing.case_number}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <User size={16} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Client</p>
                        <p className="font-semibold text-slate-700 text-sm truncate max-w-[120px]">{hearing.client_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Court</p>
                        <p className="font-semibold text-slate-700 text-sm truncate max-w-[120px]">{hearing.court_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Scale size={16} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Stage</p>
                        <p className="font-semibold text-slate-700 text-sm truncate max-w-[120px]">{hearing.stage || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => {
                      setSelectedHearing(hearing);
                      setShowOutcomeModal(true);
                    }}
                    className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200"
                  >
                    <Edit3 size={16} />
                    Update Outcome
                  </button>
                  {hearing.outcome && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-[10px] font-bold text-green-700 uppercase mb-1">Outcome Recorded</p>
                      <p className="text-xs text-green-800 italic leading-relaxed">"{hearing.outcome}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showOutcomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full my-auto overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Hearing Outcome</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">Case: {selectedHearing?.case_number}</p>
              </div>
              <button onClick={() => setShowOutcomeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateOutcome} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Today's Hearing Summary</label>
                <textarea 
                  required
                  placeholder="What happened in court today?"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24 resize-none transition-all"
                  value={outcomeData.outcome}
                  onChange={(e) => setOutcomeData({...outcomeData, outcome: e.target.value})}
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Next Date</label>
                  <input 
                    type="date"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={outcomeData.next_hearing_date}
                    onChange={(e) => setOutcomeData({...outcomeData, next_hearing_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">Next Stage</label>
                  <input 
                    type="text"
                    placeholder="e.g. Argument"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    value={outcomeData.stage}
                    onChange={(e) => setOutcomeData({...outcomeData, stage: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="flex-1 px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200"
                >
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CauseList;
