import React from 'react';
import { FileCheck2, Download, ShieldCheck } from 'lucide-react';

export default function AuditTrailCard({ reconciliation, auditData, onExport }) {
  const isPass = reconciliation?.verification?.status === 'PASS';

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <FileCheck2 className="w-5 h-5 text-indigo-600" />
          <span>Auditable Reconciliation Record</span>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
        >
          <Download className="w-4 h-4" />
          <span>Export JSON Audit Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] font-bold">RECONCILIATION ID</span>
          <span className="text-slate-900 font-bold">{reconciliation?.reconciliation_id || 'RECON-REC-A-REC-B'}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] font-bold">APPROVAL STATUS</span>
          <span className={
            reconciliation?.approval_status === 'APPROVED' ? 'text-emerald-700 font-bold' :
            reconciliation?.approval_status === 'REJECTED' ? 'text-rose-600 font-bold' :
            'text-amber-600 font-bold'
          }>
            {reconciliation?.approval_status || 'PENDING'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] font-bold">VERIFICATION RESULT</span>
          <span className={isPass ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
            {reconciliation?.verification?.status || 'PASS'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 block text-[10px] font-bold">AI ENGINE STATUS</span>
          <span className="text-amber-700 font-bold">
            {reconciliation?.ai_analysis?.is_fallback ? 'FALLBACK' : 'ACTIVE'}
          </span>
        </div>
      </div>
    </div>
  );
}
