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
import { fetchRecords, executeReconciliation, apiClient } from './services/api';
import { ShieldCheck, Info, Cpu, FileJson } from 'lucide-react';


export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState('DEMO');
  const [recordData, setRecordData] = useState(null);
  const [reconciliation, setReconciliation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const loadData = async (scenarioId = selectedScenarioId) => {
    setLoading(true);
    setError(null);
    try {
      const records = await fetchRecords(scenarioId);
      setRecordData(records);
      const recon = await executeReconciliation(scenarioId);
      setReconciliation(recon);
    } catch (err) {
      console.error('Failed to load RecordFuse data:', err);
      setError(err.message || 'Unable to connect to backend server on port 8001');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedScenarioId);
  }, [selectedScenarioId]);

  const handleSelectScenario = (newScenarioId) => {
    setSelectedScenarioId(newScenarioId);
  };


  const handleApprove = async () => {
    try {
      await apiClient.post('/api/reconcile/approval', {
        scenario_id: selectedScenarioId,
        patient_a_id: recordData?.record_a?.patient?.id || 'REC-A',
        patient_b_id: recordData?.record_b?.patient?.id || 'REC-B',
        approval_status: 'APPROVED'
      });
      loadData(selectedScenarioId);
    } catch (err) {
      alert('Failed to update approval status');
    }
  };

  const handleReject = async () => {
    try {
      await apiClient.post('/api/reconcile/approval', {
        scenario_id: selectedScenarioId,
        patient_a_id: recordData?.record_a?.patient?.id || 'REC-A',
        patient_b_id: recordData?.record_b?.patient?.id || 'REC-B',
        approval_status: 'REJECTED'
      });
      loadData(selectedScenarioId);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        aiStatus={reconciliation?.ai_analysis}
        onRefresh={loadData}
        loading={loading}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* Top Operational Callout Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              <strong className="text-slate-100">Immutable Original Records Notice:</strong> Original source records (Record A & Record B) remain unchanged. The composite timeline is a derived, zero-loss view.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <IntegrityTestModal />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <p className="font-bold">System Connection Error</p>
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        {/* Expanded Synthetic Dataset Scenario Selector */}
        <ScenarioSelector
          selectedScenarioId={selectedScenarioId}
          onSelectScenario={handleSelectScenario}
        />

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
        />

        {/* Read-Only Audit Trail Card */}
        <AuditTrailCard
          reconciliation={reconciliation}
          onExport={handleExportJSON}
        />
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
