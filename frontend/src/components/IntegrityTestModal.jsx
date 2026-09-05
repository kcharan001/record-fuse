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
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition shadow-sm"
      >
        <Terminal className="w-4 h-4 text-indigo-600" />
        <span>Run System Integrity Suite</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Terminal className="w-5 h-5 text-indigo-600" />
                <span>Developer System Integrity & Chaos Matrix</span>
              </div>
              <button
                onClick={runIntegritySuite}
                disabled={running}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                <span>Re-run Suite</span>
              </button>
            </div>

            {testMatrix ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-slate-500">Total Scenarios: </span>
                    <span className="text-slate-900 font-bold">{testMatrix.total_scenarios}</span>
                    <span className="text-slate-300 mx-2">|</span>
                    <span className="text-slate-500">Passed: </span>
                    <span className="text-emerald-700 font-bold">{testMatrix.passed_scenarios}</span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                    SYSTEM INTEGRITY: {testMatrix.system_integrity_status}
                  </span>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 text-xs">
                  {testMatrix.scenarios?.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-mono font-bold">
                        <span className="text-slate-900">{s.scenario_name}</span>
                        {s.passed ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PASS
                          </span>
                        ) : (
                          <span className="text-rose-600 flex items-center gap-1">
                            <AlertOctagon className="w-3.5 h-3.5" /> FAIL
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-[11px]">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                Executing automated zero-loss assertion matrix...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
