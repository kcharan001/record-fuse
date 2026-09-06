import React, { useState, useEffect } from 'react';
import { Database, Search, Trash2, ChevronDown, ChevronUp, User, Calendar, Phone, MapPin, ShieldCheck, Activity, GitCompare, Download } from 'lucide-react';
import { fetchMasterDatabase, clearMasterDatabase } from '../services/api';
import { downloadPatientReport } from '../utils/reportGenerator';

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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Master Patient Database Directory</h2>
            <p className="text-xs text-slate-500">
              Live SQLite Store ({data.total_patients} Patients Registered). Click any record to inspect complete clinical history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadMasterData}
            className="text-xs text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition-colors shadow-sm font-medium"
          >
            Refresh Database
          </button>
          <button
            onClick={handleClearDatabase}
            className="flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe Database</span>
          </button>
        </div>
      </div>

      {/* Pair Selection Status Banner */}
      {selectedPair.patientA || selectedPair.patientB ? (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-700">
              Selected Pair for Reconciler: Record A = <strong className="text-indigo-900">{selectedPair.patientA || 'None'}</strong> | Record B = <strong className="text-indigo-900">{selectedPair.patientB || 'None'}</strong>
            </span>
          </div>

          {selectedPair.patientA && selectedPair.patientB && (
            <button
              onClick={() => onSelectPairForReconciliation && onSelectPairForReconciliation(selectedPair.patientA, selectedPair.patientB)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-lg text-xs shadow-sm transition-all"
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
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-cyan-600"
        />
      </div>

      {/* Patient Database List */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading database contents...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
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
                    ? 'border-indigo-400 bg-indigo-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 cursor-pointer" onClick={() => toggleExpand(patient.id)}>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-indigo-600 mt-1 md:mt-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {patient.first_name} {patient.last_name}
                        </h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          ID: {patient.id}
                        </span>
                        {patient.permanent_patient_id && (
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {patient.permanent_patient_id}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
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
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                      {event_count} {event_count === 1 ? 'Encounter' : 'Encounters'}
                    </span>

                    <button
                      onClick={() => handleSetPair(patient.id, 'patientA')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                        isSelectedA
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isSelectedA ? 'Selected as Record A' : 'Set as Record A'}
                    </button>

                    <button
                      onClick={() => handleSetPair(patient.id, 'patientB')}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                        isSelectedB
                          ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isSelectedB ? 'Selected as Record B' : 'Set as Record B'}
                    </button>

                    <button
                      onClick={() => downloadPatientReport(patient, events)}
                      title="Download Official Person Clinical History Report (Printable HTML / PDF)"
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-semibold bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(patient.id)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Medical Visit History Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-4 bg-slate-50/70 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-600" /> Complete Stored Visit Timeline
                    </h4>

                    {events.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No clinical encounters stored for this patient.</p>
                    ) : (
                      <div className="space-y-2">
                        {events.map((ev) => (
                          <div
                            key={ev.event_id}
                            className="p-3 rounded-xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs shadow-sm"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-700">{ev.event_id}</span>
                                <span className="font-semibold text-slate-900">{ev.description}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  {ev.event_type}
                                </span>
                              </div>
                              <p className="text-slate-500">
                                Provider: {ev.provider || 'N/A'} | Department: {ev.department || 'N/A'}
                              </p>
                            </div>

                            <span className="font-mono text-slate-400 text-[11px] shrink-0">
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
