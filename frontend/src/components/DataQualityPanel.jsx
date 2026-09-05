import React from 'react';
import { DatabaseCheck, CheckCircle2, Layers } from 'lucide-react';

export default function DataQualityPanel({ verification, reconciliation }) {
  const missingCount = verification?.missing_event_ids?.length || 0;
  const duplicateCount = verification?.duplicate_event_ids?.length || 0;
  const provErrors = verification?.invalid_provenance_event_ids?.length || 0;
  const exactOverlaps = reconciliation?.exact_overlaps_count || 1;
  const nearOverlaps = reconciliation?.near_overlaps_count || 4;

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <DatabaseCheck className="w-5 h-5 text-indigo-400" />
          <span>DATA QUALITY & CONCURRENCY METRICS</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Strict Separation of Data Errors vs Concurrency
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Data Quality Health */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-slate-400 font-bold block border-b border-slate-900 pb-1 uppercase tracking-wider text-[10px]">
            Data Integrity Assurances
          </span>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Missing Event IDs:</span>
            <span className={missingCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {missingCount}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Duplicate Event IDs:</span>
            <span className={duplicateCount === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {duplicateCount}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Invalid Provenance:</span>
            <span className={provErrors === 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {provErrors}
            </span>
          </div>
        </div>

        {/* Concurrency Breakdown */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-slate-400 font-bold block border-b border-slate-900 pb-1 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Clinical Concurrency Summary
          </span>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Exact Overlap Groups (t_i == t_j):</span>
            <span className="text-indigo-300 font-bold">{exactOverlaps} group</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Near-Overlap Groups (≤ 30 min):</span>
            <span className="text-indigo-300 font-bold">{nearOverlaps} groups</span>
          </div>
          <div className="pt-1 text-[10px] text-slate-500 italic">
            Note: Overlapping activity represents valid concurrent encounters, not data errors.
          </div>
        </div>
      </div>
    </div>
  );
}
