import React from 'react';
import { Activity, AlertCircle, RefreshCw, Cpu, ShieldCheck } from 'lucide-react';

export default function Header({ aiStatus, onRefresh, loading }) {
  const isFallback = aiStatus?.is_fallback;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Synthetic Clinical Data Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-1.5 text-center text-amber-400 text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>SYNTHETIC CLINICAL DEMO DATA ONLY — NO REAL PATIENT DATA USED</span>
      </div>

      {/* Header Content */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              RECORD FUSE
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                v1.0 Demo
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Duplicate Patient Record Merge Without Timeline Loss
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-4">
          {/* AI Assistance Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-400">AI ASSISTANCE:</span>
            {isFallback ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                FALLBACK
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE
              </span>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Re-Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}
