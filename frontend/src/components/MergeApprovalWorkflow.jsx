import React from 'react';
import { ShieldCheck, Eye, Check, X, Lock } from 'lucide-react';

export default function MergeApprovalWorkflow({ approvalStatus, onApprove, onReject, onPreview, loading }) {
  const isApproved = approvalStatus === 'APPROVED';
  const isRejected = approvalStatus === 'REJECTED';

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Human-in-the-Loop Merge Approval Workflow</h3>
          </div>
          <p className="text-xs text-slate-500">
            AI recommendations assist clinical operations. Merging requires explicit user authorization.
          </p>
        </div>

        {/* Approval Status Badge */}
        <div>
          {isApproved ? (
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> MERGE APPROVED
            </span>
          ) : isRejected ? (
            <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <X className="w-4 h-4 text-rose-600" /> MERGE REJECTED
            </span>
          ) : (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> REVIEW REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition"
        >
          <Eye className="w-4 h-4 text-indigo-600" />
          <span>Preview Merge</span>
        </button>

        <button
          onClick={onApprove}
          disabled={loading || isApproved}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>Approve Merge</span>
        </button>

        <button
          onClick={onReject}
          disabled={loading || isRejected}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition disabled:opacity-50"
        >
          <X className="w-4 h-4 text-rose-600" />
          <span>Reject Merge</span>
        </button>

        <span className="text-[11px] text-slate-400 italic ml-auto">
          System rule: AI never automatically approves duplicate record merges.
        </span>
      </div>
    </div>
  );
}
