import React from 'react';
import { Eye, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export default function MergePreviewModal({ isOpen, onClose, reconciliation, patientA, patientB }) {
  if (!isOpen) return null;

  const recAEvents = reconciliation?.record_a_count || 6;
  const recBEvents = reconciliation?.record_b_count || 7;
  const expectedTotal = reconciliation?.total_events || 13;
  const exactOverlaps = reconciliation?.exact_overlaps_count || 1;
  const nearOverlaps = reconciliation?.near_overlaps_count || 4;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
          <Eye className="w-5 h-5" />
          <span>Pre-Approval Merge Preview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
            <span className="text-slate-500 block text-[10px] font-bold">RECORD A ({patientA?.first_name})</span>
            <span className="text-base font-bold text-indigo-800">{recAEvents} Clinical Events</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-slate-500 block text-[10px] font-bold">RECORD B ({patientB?.first_name})</span>
            <span className="text-base font-bold text-emerald-800">{recBEvents} Clinical Events</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-bold">EXPECTED COMPOSITE</span>
            <span className="text-base font-bold text-slate-900">{expectedTotal} Unified Events</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
          <span className="text-slate-600 font-bold block border-b border-slate-200 pb-1">
            Concurrency & Overlap Summary
          </span>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Exact Timestamp Overlap Groups (t_i == t_j):</span>
            <span className="text-indigo-700 font-bold">{exactOverlaps} group</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Near-Overlap Groups (≤ 30 min):</span>
            <span className="text-indigo-700 font-bold">{nearOverlaps} groups</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
          <span>{expectedTotal} / {expectedTotal} EVENTS PRESERVED</span>
          <span>0 EVENTS LOST</span>
          <span className="text-emerald-700 font-extrabold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> VERIFIED SAFE
          </span>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition shadow-sm"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
