import React, { useState } from 'react';
import { Terminal, ShieldCheck, RefreshCw, X, CheckCircle2, AlertOctagon } from 'lucide-react';
import { apiClient } from '../services/api';

export default function IntegrityTestModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [testMatrix, setTestMatrix] = useState(null);
  const [running, setRunning] = useState(false);

  const runIntegritySuite = async () => {
    setRunning(true);
    try {
      const resp = await apiClient.post('/api/reconcile/integrity-test');
      setTestMatrix(resp.data);
    } catch (err) {
      console.error('Integrity test failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!testMatrix) {
      runIntegritySuite();
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono font-semibold transition"
      >
        <Terminal className="w-4 h-4 text-indigo-400" />
        <span>Run System Integrity Suite</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span>Developer System Integrity & Chaos Matrix</span>
              </div>
              <button
                onClick={runIntegritySuite}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                <span>Re-run Suite</span>
              </button>
            </div>

            {testMatrix ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-400">Total Scenarios: </span>
                    <span className="text-slate-100 font-bold">{testMatrix.total_scenarios}</span>
                    <span className="text-slate-500 mx-2">|</span>
                    <span className="text-slate-400">Passed: </span>
                    <span className="text-emerald-400 font-bold">{testMatrix.passed_scenarios}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-bold">
                    SYSTEM INTEGRITY: {testMatrix.system_integrity_status}
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                  {testMatrix.scenarios?.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-slate-100">{s.scenario_name}</span>
                        {s.passed ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px]">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                Executing 7 controlled in-memory chaos scenarios...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
