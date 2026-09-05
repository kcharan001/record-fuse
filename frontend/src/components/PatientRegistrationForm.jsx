import React, { useState } from 'react';
import { UserPlus, Calendar, Phone, MapPin, Shield, PlusCircle, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { createOrUpdatePatient, addClinicalEvent } from '../services/api';

export default function PatientRegistrationForm({ onPatientSaved }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: 'Male',
    ssn_last4: '',
    phone: '',
    address: ''
  });

  const [includeEvent, setIncludeEvent] = useState(true);
  const [eventData, setEventData] = useState({
    source_record: 'record_A',
    event_type: 'consultation',
    description: '',
    provider: '',
    department: ''
  });

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.dob || !formData.ssn_last4) {
      setNotification({ type: 'error', message: 'First Name, Last Name, DOB, and SSN Last 4 are required.' });
      return;
    }

    setSaving(true);
    setNotification(null);

    try {
      // 1. Create or Update Patient (Auto-Upsert by Name)
      const patResult = await createOrUpdatePatient(formData);

      let eventAdded = false;
      // 2. Add Encounter if specified
      if (includeEvent && eventData.description.trim()) {
        await addClinicalEvent({
          patient_id: patResult.patient.id,
          source_record: eventData.source_record || 'record_A',
          event_type: eventData.event_type,
          description: eventData.description,
          provider: eventData.provider || 'Staff Physician',
          department: eventData.department || 'Outpatient Clinic'
        });
        eventAdded = true;
      }

      setNotification({
        type: 'success',
        updated: patResult.updated,
        message: patResult.message + (eventAdded ? ' Encounter record added.' : '')
      });

      // Clear event description
      setEventData((prev) => ({ ...prev, description: '' }));

      if (onPatientSaved) {
        onPatientSaved();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || err.message || 'Failed to save patient entry.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Dynamic Patient Registration & Auto-Update</h2>
            <p className="text-xs text-slate-400">
              Entering an existing patient name automatically updates their profile and appends new encounters in the database.
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-start gap-3 ${
            notification.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : notification.updated
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          ) : notification.updated ? (
            <RefreshCw className="w-5 h-5 shrink-0 text-amber-400 animate-spin-slow" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          )}
          <div className="flex-1">
            <p className="font-semibold">
              {notification.updated ? 'Existing Patient Auto-Updated' : notification.type === 'error' ? 'Error' : 'Registration Complete'}
            </p>
            <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              placeholder="e.g. Jonathan"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              placeholder="e.g. Doe"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SSN Last 4 *</label>
            <input
              type="text"
              name="ssn_last4"
              maxLength={4}
              value={formData.ssn_last4}
              onChange={handleInputChange}
              placeholder="e.g. 4892"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. 555-234-5678"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="e.g. 742 Evergreen Terrace, Springfield"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Optional Clinical Encounter Form */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="includeEvent"
              checked={includeEvent}
              onChange={(e) => setIncludeEvent(e.target.checked)}
              className="w-4 h-4 accent-indigo-500 rounded"
            />
            <label htmlFor="includeEvent" className="text-xs font-semibold text-slate-200 cursor-pointer">
              Attach Initial Clinical Encounter / Visit Record
            </label>
          </div>

          {includeEvent && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <div>
                <label className="block text-xs font-semibold text-indigo-400 mb-1">Record Provenance *</label>
                <select
                  name="source_record"
                  value={eventData.source_record}
                  onChange={handleEventChange}
                  className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl px-3 py-2 text-sm text-indigo-200 focus:outline-none focus:border-indigo-400 font-semibold"
                >
                  <option value="record_A">Record A (Primary)</option>
                  <option value="record_B">Record B (Secondary)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Encounter Type</label>
                <select
                  name="event_type"
                  value={eventData.event_type}
                  onChange={handleEventChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="consultation">Consultation</option>
                  <option value="lab_test">Lab Test</option>
                  <option value="radiology">Radiology Scan</option>
                  <option value="vitals">Vitals Check</option>
                  <option value="prescription">Prescription</option>
                  <option value="procedure">Surgical Procedure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Provider / Physician</label>
                <input
                  type="text"
                  name="provider"
                  value={eventData.provider}
                  onChange={handleEventChange}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={eventData.department}
                  onChange={handleEventChange}
                  placeholder="e.g. Cardiology"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-4">
                <label className="block text-xs font-semibold text-slate-400 mb-1">Clinical Notes / Description</label>
                <input
                  type="text"
                  name="description"
                  value={eventData.description}
                  onChange={handleEventChange}
                  placeholder="e.g. Outpatient cardiology consultation for palpitations & fatigue"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>Save to Database</span>
          </button>
        </div>
      </form>
    </div>
  );
}
