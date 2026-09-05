import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function ZeroLossSafetyPanel({ verification }) {
  const isPass = verification?.status === 'PASS';
  const expectedTotal = verification?.expected_total || 13;
  const actualTotal = verification?.actual_total || 13;
  const lostCount = verification?.lost_events_count || 0;
  const missingIds = verification?.missing_event_ids || [];
  const duplicateIds = verification?.duplicate_event_ids || [];
  const invalidProv = verification?.invalid_provenance_event_ids || [];

  return (
    <div className={`p-6 rounded-2xl border space-y-4 shadow-sm transition ${
      isPass ? 'bg-white border-emerald-200' : 'bg-white border-rose-200'
    }`}>
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          {isPass ? (
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          )}
          <span>ZERO-LOSS SAFETY VERIFICATION</span>
        </div>

        {isPass ? (
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-extrabold tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            VERIFICATION PASS ✓
          </span>
        ) : (
          <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-extrabold tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            VERIFICATION FAILED ✗
          </span>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Expected</span>
          <span className="text-base font-bold text-slate-900">{expectedTotal}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Actual</span>
          <span className="text-base font-bold text-slate-900">{actualTotal}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Missing</span>
          <span className={`text-base font-bold ${missingIds.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {missingIds.length}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Duplicates</span>
          <span className={`text-base font-bold ${duplicateIds.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {duplicateIds.length}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center col-span-2 sm:col-span-1">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Provenance</span>
          <span className={`text-base font-bold ${invalidProv.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {invalidProv.length === 0 ? 'INTACT' : 'ERRORS'}
          </span>
        </div>
      </div>

      {/* Prominent Banner */}
      {isPass ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
          <span>{actualTotal} / {expectedTotal} EVENTS PRESERVED</span>
          <span>0 EVENTS LOST</span>
          <span className="text-emerald-700 font-extrabold">VERIFICATION PASS ✓</span>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-xs font-mono text-rose-900">
          <div className="flex items-center justify-between font-bold">
            <span>VERIFICATION FAILED</span>
            <span>LOST EVENTS: {lostCount}</span>
          </div>
          {missingIds.length > 0 && (
            <p>Missing Original Event IDs: {missingIds.join(', ')}</p>
          )}
          {duplicateIds.length > 0 && (
            <p>Duplicate Event IDs: {duplicateIds.join(', ')}</p>
          )}
          {invalidProv.length > 0 && (
            <p>Invalid Provenance IDs: {invalidProv.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
}
