import React from 'react';
import { Activity, RefreshCw, Cpu } from 'lucide-react';
import PermanentIdLookupModal from './PermanentIdLookupModal';

export default function Header({ aiStatus, onRefresh, loading }) {
  const isFallback = aiStatus?.is_fallback;

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-40 shadow-sm">
      {/* Header Content */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              RECORD FUSE
              <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-mono font-medium">
                v1.0 Demo
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Duplicate Patient Record Merge Without Timeline Loss
            </p>
          </div>
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center gap-3">
          {/* Permanent ID Master Lookup Modal Button */}
          <PermanentIdLookupModal />

          {/* AI Assistance Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span className="text-slate-500">AI ASSISTANCE:</span>
            {isFallback ? (
              <span className="text-amber-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                FALLBACK
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE
              </span>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Re-Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
}

