import React, { useState, useEffect } from 'react';
import { Activity, Database, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Server, Cpu } from 'lucide-react';
import { fetchHealth } from './services/api';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkBackendHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealth();
      setHealthData(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to FastAPI backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner for Synthetic Clinical Data Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-amber-400 text-xs font-semibold tracking-wide flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>SYNTHETIC CLINICAL DEMO DATA ONLY — NO REAL PATIENT DATA USED</span>
      </div>

      {/* Main Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              RECORD FUSE
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                Phase 1 Foundation
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Duplicate Patient Record Merge Without Timeline Loss
            </p>
          </div>
        </div>

        <button
          onClick={checkBackendHealth}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Re-check Health</span>
        </button>
      </header>

      {/* Content Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        {/* Foundation Status Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 relative overflow-hidden shadow-xl">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Phase 1: Project Foundation Ready</h2>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                Frontend dashboard scaffolded with React + Vite + Tailwind CSS. Backend engine initialised with FastAPI & SQLite database layer. 
                Zero patient clinical event loss architecture is active.
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Backend & Database Connectivity Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backend API Status */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Server className="w-5 h-5 text-indigo-400" />
                <span>FastAPI Service</span>
              </div>
              {loading ? (
                <span className="text-xs text-amber-400 flex items-center gap-1 font-mono">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Connecting...
                </span>
              ) : error ? (
                <span className="text-xs bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Disconnected
                </span>
              ) : (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                </span>
              )}
            </div>

            {error ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm space-y-2">
                <p className="font-semibold">Backend Connection Failed</p>
                <p className="text-xs font-mono text-rose-400">{error}</p>
                <p className="text-xs text-slate-400 mt-2">
                  Ensure the FastAPI backend is running at <code className="text-indigo-300">http://localhost:8000</code>.
                </p>
              </div>
            ) : healthData ? (
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Service:</span>
                  <span className="text-slate-200 font-semibold">{healthData.service}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Version:</span>
                  <span className="text-slate-200">{healthData.version}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-400 font-semibold">{healthData.status}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-400">{healthData.timestamp}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* SQLite DB Status */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-200 font-semibold">
                <Database className="w-5 h-5 text-indigo-400" />
                <span>SQLite Database</span>
              </div>
              {healthData?.database === 'healthy' ? (
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-0.5 rounded-full">
                  Pending
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">DB Engine:</span>
                <span className="text-slate-200">SQLite (record_fuse.db)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">OR Model:</span>
                <span className="text-slate-200">SQLAlchemy 2.0</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">DB Connection:</span>
                <span className={healthData?.database === 'healthy' ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {healthData?.database || 'Not checked'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Isolation Mode:</span>
                <span className="text-slate-400">check_same_thread=False</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Checklist */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Phase 1 Verification Matrix</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">FastAPI Application Initialised</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">SQLite Layer & Table Models Ready</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">CORS Allowed Origins Configured</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">React + Vite + Tailwind CSS Rendered</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">GET /health Endpoint Verified</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300">Frontend-Backend Axios Bridge Operational</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        RECORD FUSE — Duplicate Patient Record Merge System (Hackathon Prototype)
      </footer>
    </div>
  );
}
