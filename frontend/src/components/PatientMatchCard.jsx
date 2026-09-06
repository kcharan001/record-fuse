import React from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, QrCode, Sparkles } from 'lucide-react';
import { getCountryConfig } from '../config/countriesConfig';

export default function PatientMatchCard({ patientA, patientB, aiAnalysis }) {
  const matchInfo = aiAnalysis?.patient_match;
  const confidencePercent = Math.round((matchInfo?.match_confidence || 0.95) * 100);

  const countryAConfig = getCountryConfig(patientA?.national_id_country || 'IN');
  const countryBConfig = getCountryConfig(patientB?.national_id_country || 'IN');

  const last4A = patientA?.national_id_last4 || patientA?.ssn_last4 || '0000';
  const last4B = patientB?.national_id_last4 || patientB?.ssn_last4 || '0000';

  const ssn = last4A;
  const last = (patientA?.last_name || "PATIENT").toUpperCase().replace(/\s+/g, "");
  const year = patientA?.dob ? patientA.dob.split("-")[0] : "2026";
  const permanentId = `UPI-${year}-${ssn}-${last}`;

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm">
      {/* Title & Match Confidence Meter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <span>Patient Identity Match Analysis</span>
        </div>

        <div className="flex items-center gap-3">
          {confidencePercent >= 70 ? (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              HIGH CONFIDENCE MATCH ({confidencePercent}%)
            </span>
          ) : (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              MANUAL REVIEW REQUIRED ({confidencePercent}%)
            </span>
          )}
        </div>
      </div>

      {/* Permanent Master Patient ID Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <QrCode className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-slate-700 font-semibold">Permanent Master Patient Identifier (MPI / UPI):</span>
          <span className="font-mono font-bold text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-300 tracking-wider shadow-sm">
            {permanentId}
          </span>
        </div>
        <span className="text-[11px] text-indigo-700 italic">
          Lifetime master identifier linked to all repeat visits & historical clinical records
        </span>
      </div>


      {/* Side-by-Side Patient Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Record A */}
        <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
              [Record A] Outpatient Specialty
            </span>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">
              {patientA?.id || 'REC-A'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Name:</span>
              <span className="font-bold text-slate-900">{patientA?.first_name} {patientA?.last_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-mono text-slate-800">{patientA?.dob}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Email:</span>
              <span className="font-mono text-slate-800 font-medium">{patientA?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">National ID ({countryAConfig.flag} {countryAConfig.name}):</span>
              <span className="font-mono text-slate-800 font-bold">{patientA?.national_id_type || countryAConfig.idLabel}: ****{last4A}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Address:</span>
              <span className="text-slate-700 text-right">{patientA?.address}</span>
            </div>
          </div>
        </div>

        {/* Record B */}
        <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
              [Record B] Urgent Care Clinic
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
              {patientB?.id || 'REC-B'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Name:</span>
              <span className="font-bold text-slate-900">{patientB?.first_name} {patientB?.last_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date of Birth:</span>
              <span className="font-mono text-slate-800">{patientB?.dob}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Email:</span>
              <span className="font-mono text-slate-800 font-medium">{patientB?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">National ID ({countryBConfig.flag} {countryBConfig.name}):</span>
              <span className="font-mono text-slate-800 font-bold">{patientB?.national_id_type || countryBConfig.idLabel}: ****{last4B}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Address:</span>
              <span className="text-slate-700 text-right">{patientB?.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Field Conflict Resolution Recommendations */}
      {aiAnalysis?.field_conflict_recommendations?.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-purple-950">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Authoritative Master Profile Recommendations</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-200 text-purple-900 font-semibold text-[11px]">
                  <th className="py-1.5 px-2">Attribute</th>
                  <th className="py-1.5 px-2">Record A</th>
                  <th className="py-1.5 px-2">Record B</th>
                  <th className="py-1.5 px-2">AI Recommended Master Value</th>
                  <th className="py-1.5 px-2">AI Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 text-slate-800 text-[11px]">
                {aiAnalysis.field_conflict_recommendations.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-purple-100/40">
                    <td className="py-2 px-2 font-bold text-slate-900">{rec.field_name}</td>
                    <td className="py-2 px-2 text-slate-600">{rec.record_a_value || '—'}</td>
                    <td className="py-2 px-2 text-slate-600">{rec.record_b_value || '—'}</td>
                    <td className="py-2 px-2 font-bold text-emerald-800 bg-emerald-100/70 rounded px-1.5">{rec.recommended_value}</td>
                    <td className="py-2 px-2 text-purple-900 italic">{rec.ai_rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Matching Rationale & Discrepancies */}
      {matchInfo && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-xs text-slate-700 leading-relaxed font-sans">
            <strong className="text-slate-900">AI Match Rationale:</strong> {matchInfo.reasoning}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            {/* Matching Factors */}
            <div>
              <span className="text-slate-600 font-bold block mb-1.5">Confirmed Matching Attributes:</span>
              <ul className="space-y-1 text-slate-800">
                {matchInfo.matching_factors?.map((factor, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Discrepancies */}
            <div>
              <span className="text-slate-600 font-bold block mb-1.5">Discrepancies / Variations:</span>
              {matchInfo.potential_discrepancies?.length > 0 ? (
                <ul className="space-y-1 text-amber-700 font-medium">
                  {matchInfo.potential_discrepancies.map((disc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>{disc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-400 italic">None detected (Demographics match completely)</span>
              )}
            </div>
          </div>

          {/* AI Weighted Factor Model Breakdown Grid */}
          <div className="pt-3 border-t border-slate-200/80">
            <span className="text-slate-700 font-bold block mb-2 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>RecordFuse AI Weighted Match Engine Breakdown:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>👤 Name</span>
                <span className="font-bold text-indigo-700">25%</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>📅 Date of Birth</span>
                <span className="font-bold text-indigo-700">25%</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>📱 Phone</span>
                <span className="font-bold text-indigo-700">15%</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>📧 Email</span>
                <span className="font-bold text-indigo-700">10%</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>🏠 Address</span>
                <span className="font-bold text-indigo-700">10%</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>🪪 National ID</span>
                <span className="font-bold text-indigo-700">10%</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200 flex justify-between shadow-2xs">
                <span>⚧️ Gender</span>
                <span className="font-bold text-indigo-700">5%</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 flex justify-between font-bold text-indigo-900 shadow-2xs">
                <span>📊 Total Weight</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
