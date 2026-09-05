import React, { useState } from 'react';
import { Search, X, QrCode, UserCheck, Calendar, Activity, CheckCircle2, FileText, Building2 } from 'lucide-react';
import { apiClient } from '../services/api';

export default function PermanentIdLookupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('UPI-1982-4892-DOE');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/api/records/lookup/${encodeURIComponent(searchQuery.trim())}`);
      setResult(response.data);
    } catch (err) {
      console.error('Lookup failed:', err);
      setError(err.response?.data?.detail || 'No patient record found matching Permanent Identifier.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    handleSearch();
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition"
      >
        <QrCode className="w-3.5 h-3.5 text-indigo-400" />
        <span>Lookup Permanent ID (MPI)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
              <QrCode className="w-5 h-5" />
              <span>Enterprise Permanent Patient ID Lookup (MPI / UPI)</span>
            </div>
            <p className="text-xs text-slate-400">
              Enter a Permanent Master Patient Identifier, SSN last 4 digits, or Patient ID to retrieve the complete unified medical history across all visits.
            </p>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. UPI-1982-4892-DOE, 4892, REC-A..."
                className="flex-1 bg-slate-950 text-slate-100 text-sm font-mono border border-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg transition disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Lookup History'}</span>
              </button>
            </form>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Search Result View */}
            {result && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                {/* Permanent Master ID Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">
                        MASTER PATIENT PROFILE
                      </span>
                      <h4 className="text-base font-bold text-slate-100">
                        {result.patient.first_name} {result.patient.last_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/40 px-3 py-1 rounded-lg">
                      <QrCode className="w-4 h-4 text-indigo-400" />
                      <span className="font-mono font-bold text-xs text-indigo-200">
                        {result.permanent_patient_id}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">DOB</span>
                      <span className="text-slate-200">{result.patient.dob}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">SSN LAST 4</span>
                      <span className="text-slate-200">***-**-{result.patient.ssn_last4}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">LINKED RECORDS</span>
                      <span className="text-indigo-300 font-bold">{result.linked_record_ids.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TOTAL CLINICAL VISITS</span>
                      <span className="text-emerald-400 font-bold">{result.total_visits_count} Encounters</span>
                    </div>
                  </div>
                </div>

                {/* Timeline of All Medical Events */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Complete Lifetime Medical History Timeline ({result.medical_history_timeline.length} Events)
                  </h5>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {result.medical_history_timeline.map((ev, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-400 text-[11px]">{ev.event_id}</span>
                            <span className="font-semibold text-slate-100">{ev.description}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span>Dept: <strong className="text-slate-300">{ev.department}</strong></span>
                            <span>Provider: <strong className="text-slate-300">{ev.provider}</strong></span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono text-[11px] text-slate-400 block">
                            {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                            {ev.source_record}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
