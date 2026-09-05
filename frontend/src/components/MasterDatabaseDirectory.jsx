import React, { useState, useEffect } from 'react';
import { Database, Search, Trash2, ChevronDown, ChevronUp, User, Calendar, Phone, MapPin, ShieldCheck, Activity, GitCompare } from 'lucide-react';
import { fetchMasterDatabase, clearMasterDatabase } from '../services/api';

export default function MasterDatabaseDirectory({ onSelectPairForReconciliation }) {
  const [data, setData] = useState({ total_patients: 0, patients: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState(null);
  const [selectedPair, setSelectedPair] = useState({ patientA: null, patientB: null });

  const loadMasterData = async () => {
    setLoading(true);
    try {
      const dbData = await fetchMasterDatabase();
      setData(dbData);
    } catch (err) {
      console.error('Failed to load master database directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const handleClearDatabase = async () => {
    if (window.confirm('Are you sure you want to clear all patients and clinical events from the database?')) {
      try {
        await clearMasterDatabase();
        loadMasterData();
        setSelectedPair({ patientA: null, patientB: null });
      } catch (err) {
        alert('Failed to clear database');
      }
    }
  };

  const toggleExpand = (patientId) => {
    setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
  };

  const handleSetPair = (patientId, role) => {
    const newPair = { ...selectedPair, [role]: patientId };
    setSelectedPair(newPair);
    if (newPair.patientA && newPair.patientB && onSelectPairForReconciliation) {
      onSelectPairForReconciliation(newPair.patientA, newPair.patientB);
    }
  };

  const filteredPatients = data.patients.filter((item) => {
    const q = searchQuery.toLowerCase();
    const p = item.patient;
    return (
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.ssn_last4.includes(q) ||
      (p.permanent_patient_id && p.permanent_patient_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Master Patient Database Directory</h2>
            <p className="text-xs text-slate-400">
              Live SQLite Store ({data.total_patients} Patients Registered). Click any record to inspect complete clinical history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadMasterData}
            className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
          >
            Refresh Database
          </button>
          <button
            onClick={handleClearDatabase}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-2 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Database</span>
          </button>
        </div>
      </div>

      {/* Pair Selection Status Banner */}
      {selectedPair.patientA || selectedPair.patientB ? (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-300">
              Selected Pair for Reconciler: Record A = <strong className="text-indigo-300">{selectedPair.patientA || 'None'}</strong> | Record B = <strong className="text-indigo-300">{selectedPair.patientB || 'None'}</strong>
            </span>
          </div>

          {selectedPair.patientA && selectedPair.patientB && (
            <button
              onClick={() => onSelectPairForReconciliation && onSelectPairForReconciliation(selectedPair.patientA, selectedPair.patientB)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-md transition-all"
            >
              Run Timeline Reconciler Now
            </button>
          )}
        </div>
      ) : null}

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stored database by Patient Name, SSN Last 4, or Permanent UPI..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Patient Database List */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm">Loading database contents...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
          No patients found in database matching search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.map(({ patient, event_count, events }) => {
            const isExpanded = expandedPatientId === patient.id;
            const isSelectedA = selectedPair.patientA === patient.id;
            const isSelectedB = selectedPair.patientB === patient.id;

            return (
              <div
                key={patient.id}
                className={`border rounded-xl transition-all ${
                  isSelectedA || isSelectedB
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleExpand(patient.id)}>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 mt-1 md:mt-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-100">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          ID: {patient.id}
                        </span>
                        {patient.permanent_patient_id && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {patient.permanent_patient_id}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> DOB: {patient.dob} ({patient.gender})
                        </span>
                        <span>SSN: ***-**-{patient.ssn_last4}</span>
                        {patient.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {patient.phone}
                          </span>
                        )}
                        {patient.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {patient.address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {event_count} {event_count === 1 ? 'Encounter' : 'Encounters'}
                    </span>

                    <button
                      onClick={() => handleSetPair(patient.id, 'patientA')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                        isSelectedA
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isSelectedA ? 'Selected as Record A' : 'Set as Record A'}
                    </button>

                    <button
                      onClick={() => handleSetPair(patient.id, 'patientB')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                        isSelectedB
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isSelectedB ? 'Selected as Record B' : 'Set as Record B'}
                    </button>

                    <button
                      onClick={() => toggleExpand(patient.id)}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Medical Visit History Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-4 bg-slate-900/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" /> Complete Stored Visit Timeline
                    </h4>

                    {events.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No clinical encounters stored for this patient.</p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((ev) => (
                          <div
                            key={ev.event_id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-indigo-400">{ev.event_id}</span>
                                <span className="font-semibold text-slate-200">{ev.description}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-400">
                                  {ev.event_type}
                                </span>
                              </div>
                              <p className="text-slate-400">
                                Provider: {ev.provider || 'N/A'} | Department: {ev.department || 'N/A'}
                              </p>
                            </div>

                            <span className="font-mono text-slate-500 text-[11px] shrink-0">
                              {new Date(ev.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
