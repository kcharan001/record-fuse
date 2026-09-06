import React, { useState, useEffect } from 'react';
import { Database, Search, Trash2, ChevronDown, ChevronUp, User, Calendar, Phone, MapPin, ShieldCheck, Activity, GitCompare, Download, X } from 'lucide-react';
import { fetchMasterDatabase, clearMasterDatabase } from '../services/api';
import { downloadPatientReport } from '../utils/reportGenerator';
import { getCountryConfig } from '../config/countriesConfig';

export default function MasterDatabaseDirectory({ onSelectPairForReconciliation, searchQuery: externalSearchQuery = '' }) {
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

  const activeSearch = (externalSearchQuery || searchQuery || '').toString().toLowerCase().trim();

  const filteredPatients = (data?.patients || []).filter((item) => {
    if (!activeSearch) return true;
    if (!item || !item.patient) return false;

    const p = item.patient;
    const firstName = p.first_name ? String(p.first_name).toLowerCase() : '';
    const lastName = p.last_name ? String(p.last_name).toLowerCase() : '';
    const fullName = `${firstName} ${lastName}`.trim();
    const reverseFullName = `${lastName} ${firstName}`.trim();

    const permId = p.permanent_patient_id ? String(p.permanent_patient_id).toLowerCase() : '';
    const ssnLast4 = p.ssn_last4 !== null && p.ssn_last4 !== undefined ? String(p.ssn_last4).toLowerCase() : '';
    const natIdLast4 = p.national_id_last4 !== null && p.national_id_last4 !== undefined ? String(p.national_id_last4).toLowerCase() : '';
    const phone = p.phone ? String(p.phone).toLowerCase() : '';
    const dob = p.dob ? String(p.dob).toLowerCase() : '';
    const age = p.age !== null && p.age !== undefined ? String(p.age).toLowerCase() : '';
    const gender = p.gender ? String(p.gender).toLowerCase() : '';
    const city = p.city ? String(p.city).toLowerCase() : '';
    const state = p.state ? String(p.state).toLowerCase() : '';
    const zipCode = p.zip_code ? String(p.zip_code).toLowerCase() : '';
    const natCountry = p.national_id_country ? String(p.national_id_country).toLowerCase() : '';
    const natType = p.national_id_type ? String(p.national_id_type).toLowerCase() : '';

    const countryConfig = getCountryConfig(p.national_id_country);
    const countryName = countryConfig?.name ? String(countryConfig.name).toLowerCase() : '';
    const countryIdName = countryConfig?.idName ? String(countryConfig.idName).toLowerCase() : '';

    const matchesDemographics =
      fullName.includes(activeSearch) ||
      reverseFullName.includes(activeSearch) ||
      firstName.includes(activeSearch) ||
      lastName.includes(activeSearch) ||
      permId.includes(activeSearch) ||
      ssnLast4.includes(activeSearch) ||
      natIdLast4.includes(activeSearch) ||
      phone.includes(activeSearch) ||
      dob.includes(activeSearch) ||
      age.includes(activeSearch) ||
      gender.includes(activeSearch) ||
      city.includes(activeSearch) ||
      state.includes(activeSearch) ||
      zipCode.includes(activeSearch) ||
      natCountry.includes(activeSearch) ||
      natType.includes(activeSearch) ||
      countryName.includes(activeSearch) ||
      countryIdName.includes(activeSearch);

    if (matchesDemographics) return true;

    if (item.events && Array.isArray(item.events)) {
      return item.events.some((ev) => {
        if (!ev) return false;
        const name = ev.event_name ? String(ev.event_name).toLowerCase() : '';
        const type = ev.event_type ? String(ev.event_type).toLowerCase() : '';
        const facility = ev.facility ? String(ev.facility).toLowerCase() : '';
        const notes = ev.notes ? String(ev.notes).toLowerCase() : '';
        const clinicalNote = ev.clinical_note ? String(ev.clinical_note).toLowerCase() : '';
        const value = ev.value !== null && ev.value !== undefined ? String(ev.value).toLowerCase() : '';

        return (
          name.includes(activeSearch) ||
          type.includes(activeSearch) ||
          facility.includes(activeSearch) ||
          notes.includes(activeSearch) ||
          clinicalNote.includes(activeSearch) ||
          value.includes(activeSearch)
        );
      });
    }

    return false;
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

      {/* Active Search Filter Badge */}
      {activeSearch && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-800 font-medium shadow-sm">
          <span>Active Search Filter: <strong className="text-cyan-950">"{activeSearch}"</strong></span>
          <span className="font-bold bg-white px-2.5 py-1 rounded-lg border border-cyan-200">
            {filteredPatients.length} of {data?.total_patients || 0} Patients Found
          </span>
        </div>
      )}

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
                          <Calendar className="w-3.5 h-3.5" /> DOB: {patient.dob} {patient.age ? `(Age ${patient.age})` : ''} ({patient.gender})
                        </span>
                        <span>
                          National ID: {getCountryConfig(patient.national_id_country || 'IN').flag} {patient.national_id_type || getCountryConfig(patient.national_id_country || 'IN').idLabel} (****{patient.national_id_last4 || patient.ssn_last4 || '0000'})
                        </span>
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
