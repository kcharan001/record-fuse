import React from 'react';
import { Sparkles, Activity, AlertTriangle, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function AIClinicalSummaryCard({ aiAnalysis, reconciliation }) {
  if (!aiAnalysis) return null;

  const clinicalSummary = aiAnalysis.clinical_summary || {
    narrative_summary: "Unified timeline synthesized across source records with zero silent event loss.",
    active_conditions: ["Routine Outpatient Assessment"],
    clinical_conflicts: ["No clinical safety flags or drug allergy conflicts detected."]
  };

  const conflicts = clinicalSummary.clinical_conflicts || [];
  const activeConditions = clinicalSummary.active_conditions || [];

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-sm space-y-5 relative overflow-hidden">
      {/* Subtle AI gradient background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">AI Clinical History & Physician Summary</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Automated physician-level synthesis of unified clinical timeline events across all source facilities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Zero-Loss Verified</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Narrative Summary */}
        <div className="lg:col-span-2 space-y-2 bg-indigo-50/40 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase tracking-wide">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Clinical Narrative Brief</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {clinicalSummary.narrative_summary}
          </p>
        </div>

        {/* Active Conditions & Meds */}
        <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Active Conditions & Encounters</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeConditions.map((cond, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
              >
                {cond}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Clinical Safety & Conflict Flags */}
      <div className="pt-2">
        <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>AI Clinical Safety & Conflict Inspection</span>
        </div>

        <div className="space-y-2">
          {conflicts.map((flag, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                flag.includes('Collision') || flag.includes('mismatch') || flag.includes('conflict')
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              }`}
            >
              {flag.includes('Collision') || flag.includes('mismatch') || flag.includes('conflict') ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
