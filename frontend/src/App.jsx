import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PatientMatchCard from './components/PatientMatchCard';
import MergeApprovalWorkflow from './components/MergeApprovalWorkflow';
import ZeroLossSafetyPanel from './components/ZeroLossSafetyPanel';
import DataQualityPanel from './components/DataQualityPanel';
import TimelineVisualizer from './components/TimelineVisualizer';
import AuditTrailCard from './components/AuditTrailCard';
import IntegrityTestModal from './components/IntegrityTestModal';
import MergePreviewModal from './components/MergePreviewModal';
import ScenarioSelector from './components/ScenarioSelector';
import PatientRegistrationForm from './components/PatientRegistrationForm';
import MasterDatabaseDirectory from './components/MasterDatabaseDirectory';
import { fetchRecords, executeReconciliation, fetchPairRecords, executePairReconciliation, apiClient } from './services/api';
import { ShieldCheck, Info, Cpu, FileJson, Layers, Database, UserPlus } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('visualizer'); // 'visualizer' | 'database'
  const [selectedScenarioId, setSelectedScenarioId] = useState('DEMO');
  const [customPair, setCustomPair] = useState(null); // { patientAId, patientBId }
  const [recordData, setRecordData] = useState(null);
  const [reconciliation, setReconciliation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dbRefreshKey, setDbRefreshKey] = useState(0);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (customPair) {
        const records = await fetchPairRecords(customPair.patientAId, customPair.patientBId);
        setRecordData(records);
        const recon = await executePairReconciliation(customPair.patientAId, customPair.patientBId);
        setReconciliation(recon);
      } else {
        const records = await fetchRecords(selectedScenarioId);
        setRecordData(records);
        const recon = await executeReconciliation(selectedScenarioId);
        setReconciliation(recon);
      }
    } catch (err) {
      console.error('Failed to load RecordFuse data:', err);
      setError(err.message || 'Unable to connect to backend server on port 8001');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedScenarioId, customPair]);

  const handleSelectScenario = (newScenarioId) => {
    setCustomPair(null);
    setSelectedScenarioId(newScenarioId);
  };

  const handleSelectPairForReconciliation = (patientAId, patientBId) => {
    setCustomPair({ patientAId, patientBId });
    setActiveTab('visualizer');
  };

  const handleApprove = async () => {
    try {
      await apiClient.post('/api/reconcile/approval', {
        scenario_id: customPair ? undefined : selectedScenarioId,
        patient_a_id: recordData?.record_a?.patient?.id || 'REC-A',
        patient_b_id: recordData?.record_b?.patient?.id || 'REC-B',
        approval_status: 'APPROVED'
      });
      loadData();
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const handleReject = async () => {
    try {
      await apiClient.post('/api/reconcile/approval', {
        scenario_id: customPair ? undefined : selectedScenarioId,
        patient_a_id: recordData?.record_a?.patient?.id || 'REC-A',
        patient_b_id: recordData?.record_b?.patient?.id || 'REC-B',
        approval_status: 'REJECTED'
      });
      loadData();
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const handleExportJSON = () => {
    if (!reconciliation) return;
    const exportPayload = {
      reconciliation_id: reconciliation.reconciliation_id || 'RECON-REC-A-REC-B',
      patient_a: recordData?.record_a?.patient,
      patient_b: recordData?.record_b?.patient,
      approval_status: reconciliation.approval_status,
      event_counts: {
        record_a: reconciliation.record_a_count,
        record_b: reconciliation.record_b_count,
        total_unified: reconciliation.total_events
      },
      concurrency: {
        exact_overlaps: reconciliation.exact_overlaps_count,
        near_overlaps: reconciliation.near_overlaps_count
      },
      verification_proof: reconciliation.verification,
      ai_analysis: reconciliation.ai_analysis,
      unified_timeline: reconciliation.timeline,
      exported_at: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `record_fuse_reconciliation_report_${reconciliation.reconciliation_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        aiStatus={reconciliation?.ai_analysis}
        onRefresh={loadData}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'visualizer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Timeline Reconciler</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'database'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Master Patient Database & Entry</span>
            </button>
          </div>

          <IntegrityTestModal />
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
            <p className="font-bold">System Connection Error</p>
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        {/* TAB 1: RECONCILIATION VISUALIZER */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            {/* Callout Notice */}
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 shadow-sm">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong className="text-slate-900">Immutable Original Records Notice:</strong> Original source records remain unchanged in SQLite. The composite timeline is a derived, zero-loss view.
              </span>
            </div>

            {/* Scenario Selector (If using synthetic scenarios) */}
            {!customPair && (
              <ScenarioSelector
                selectedScenarioId={selectedScenarioId}
                onSelectScenario={handleSelectScenario}
              />
            )}

            {customPair && (
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
                <span className="text-indigo-900 font-medium">
                  Reconciling Custom Database Pair: <strong>{customPair.patientAId}</strong> vs <strong>{customPair.patientBId}</strong>
                </span>
                <button
                  onClick={() => setCustomPair(null)}
                  className="text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-lg font-medium shadow-sm"
                >
                  Switch Back to Demo Scenarios
                </button>
              </div>
            )}

            {/* Patient Demographic Match Card */}
            <PatientMatchCard
              patientA={recordData?.record_a?.patient}
              patientB={recordData?.record_b?.patient}
              aiAnalysis={reconciliation?.ai_analysis}
            />

            {/* Human-in-the-Loop Approval Workflow */}
            <MergeApprovalWorkflow
              approvalStatus={reconciliation?.approval_status || 'PENDING'}
              onApprove={handleApprove}
              onReject={handleReject}
              onPreview={() => setPreviewOpen(true)}
              loading={loading}
            />

            {/* Zero-Loss Safety Verification & Data Quality Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ZeroLossSafetyPanel verification={reconciliation?.verification} />
              <DataQualityPanel verification={reconciliation?.verification} reconciliation={reconciliation} />
            </div>

            {/* Unified Chronological Timeline Visualizer */}
            <TimelineVisualizer
              timeline={reconciliation?.timeline}
              aiAnalysis={reconciliation?.ai_analysis}
              onRefresh={loadData}
            />

            {/* Read-Only Audit Trail Card */}
            <AuditTrailCard
              reconciliation={reconciliation}
              recordData={recordData}
              onExport={handleExportJSON}
            />
          </div>
        )}

        {/* TAB 2: MASTER DATABASE & PATIENT ENTRY */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <PatientRegistrationForm
              onPatientSaved={() => setDbRefreshKey((prev) => prev + 1)}
            />

            <MasterDatabaseDirectory
              key={dbRefreshKey}
              onSelectPairForReconciliation={handleSelectPairForReconciliation}
            />
          </div>
        )}
      </main>

      {/* Pre-Approval Preview Modal */}
      <MergePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        reconciliation={reconciliation}
        patientA={recordData?.record_a?.patient}
        patientB={recordData?.record_b?.patient}
      />

      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        RECORD FUSE — Duplicate Patient Record Merge System (Enterprise Hackathon Demo)
      </footer>
    </div>
  );
}
