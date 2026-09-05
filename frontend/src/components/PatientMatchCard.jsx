import React from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, QrCode } from 'lucide-react';

export default function PatientMatchCard({ patientA, patientB, aiAnalysis }) {
  const matchInfo = aiAnalysis?.patient_match;
  const confidencePercent = Math.round((matchInfo?.match_confidence || 0.95) * 100);

  const ssn = patientA?.ssn_last4 || "0000";
  const last = (patientA?.last_name || "PATIENT").toUpperCase().replace(/\s+/g, "");
  const year = patientA?.dob ? patientA.dob.split("-")[0] : "2026";
  const permanentId = `UPI-${year}-${ssn}-${last}`;

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
      {/* Title & Match Confidence Meter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
          <UserCheck className="w-5 h-5 text-indigo-400" />
          <span>Patient Identity Match Analysis</span>
        </div>

        <div className="flex items-center gap-3">
          {confidencePercent >= 70 ? (
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              HIGH CONFIDENCE MATCH ({confidencePercent}%)
            </span>
          ) : (
            <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              MANUAL REVIEW REQUIRED ({confidencePercent}%)
            </span>
          )}
        </div>
      </div>

      {/* Permanent Master Patient ID Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <QrCode className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-slate-300 font-medium">Permanent Master Patient Identifier (MPI / UPI):</span>
          <span className="font-mono font-bold text-indigo-200 bg-slate-950 px-2.5 py-1 rounded-lg border border-indigo-500/40 tracking-wider">
            {permanentId}
          </span>
        </div>
        <span className="text-[11px] text-indigo-300/80 italic">
          Lifetime master identifier linked to all repeat visits & historical clinical records
        </span>
      </div>


      {/* Side-by-Side Patient Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Record A */}
        <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              [Record A] Outpatient Specialty
            </span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
              {patientA?.id || 'REC-A'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">Name:</span>
              <span className="font-semibold text-slate-100">{patientA?.first_name} {patientA?.last_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">DOB:</span>
              <span className="font-mono">{patientA?.dob}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">SSN Last 4:</span>
              <span className="font-mono">***-**-{patientA?.ssn_last4}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Address:</span>
              <span className="text-slate-400 text-right">{patientA?.address}</span>
            </div>
          </div>
        </div>

        {/* Record B */}
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              [Record B] Urgent Care Clinic
            </span>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
              {patientB?.id || 'REC-B'}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">Name:</span>
              <span className="font-semibold text-slate-100">{patientB?.first_name} {patientB?.last_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">DOB:</span>
              <span className="font-mono">{patientB?.dob}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-500">SSN Last 4:</span>
              <span className="font-mono">***-**-{patientB?.ssn_last4}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Address:</span>
              <span className="text-slate-400 text-right">{patientB?.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Matching Rationale & Discrepancies */}
      {matchInfo && (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            <strong className="text-slate-100">AI Match Rationale:</strong> {matchInfo.reasoning}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            {/* Matching Factors */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5">Confirmed Matching Attributes:</span>
              <ul className="space-y-1 text-slate-300">
                {matchInfo.matching_factors?.map((factor, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Discrepancies */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5">Discrepancies / Variations:</span>
              {matchInfo.potential_discrepancies?.length > 0 ? (
                <ul className="space-y-1 text-amber-300">
                  {matchInfo.potential_discrepancies.map((disc, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{disc}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-slate-500 italic">None detected (Demographics match completely)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
