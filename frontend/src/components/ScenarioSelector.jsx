import React, { useState, useEffect } from 'react';
import { Layers, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import { apiClient } from '../services/api';

export default function ScenarioSelector({ selectedScenarioId, onSelectScenario }) {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScenariosList = async () => {
      try {
        const response = await apiClient.get('/api/records/scenarios');
        setScenarios(response.data);
      } catch (err) {
        console.error('Failed to load scenarios list:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScenariosList();
  }, []);

  const getCategoryBadge = (category) => {
    switch (category) {
      case 'demo_dataset':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Original Demo</span>;
      case 'high_confidence_match':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">High Match</span>;
      case 'medium_confidence_review':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Review Required</span>;
      case 'complex_clinical_overlap':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">Complex Overlap</span>;
      case 'non_match':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Non-Match</span>;
      default:
        return null;
    }
  };

  const selectedSc = scenarios.find(s => s.scenario_id === selectedScenarioId) || scenarios[0];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Synthetic Patient Dataset Scenarios</h3>
            <p className="text-xs text-slate-500">Select from curated duplicate-pair scenarios (2 per case category, min 6 events each)</p>
          </div>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            disabled={loading}
            className="bg-white text-slate-800 text-sm font-semibold border border-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-600 transition-colors cursor-pointer shadow-sm"
          >
            <option value="DEMO">Demo: Jonathan Doe vs John Doe (13 Events)</option>
            <optgroup label="Case 1: High-Confidence Matches (S01 - S02)">
              {scenarios.filter(s => s.category === 'high_confidence_match').map(s => (
                <option key={s.scenario_id} value={s.scenario_id}>
                  {s.scenario_id}: {s.title} ({s.total_events} events)
                </option>
              ))}
            </optgroup>
            <optgroup label="Case 2: Medium-Confidence Review Required (S03 - S04)">
              {scenarios.filter(s => s.category === 'medium_confidence_review').map(s => (
                <option key={s.scenario_id} value={s.scenario_id}>
                  {s.scenario_id}: {s.title} ({s.total_events} events)
                </option>
              ))}
            </optgroup>
            <optgroup label="Case 3: Complex Clinical Overlaps (S05 - S06)">
              {scenarios.filter(s => s.category === 'complex_clinical_overlap').map(s => (
                <option key={s.scenario_id} value={s.scenario_id}>
                  {s.scenario_id}: {s.title} ({s.total_events} events)
                </option>
              ))}
            </optgroup>
            <optgroup label="Case 4: Non-Match Cases (S07 - S08)">
              {scenarios.filter(s => s.category === 'non_match').map(s => (
                <option key={s.scenario_id} value={s.scenario_id}>
                  {s.scenario_id}: {s.title} ({s.total_events} events)
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Selected Scenario Details Summary Ribbon */}
      {selectedSc && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center gap-3">
            {getCategoryBadge(selectedSc.category)}
            <span className="font-bold text-slate-800">{selectedSc.title}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Record A: <strong className="text-indigo-700 font-bold">{selectedSc.events_a_count}</strong> events</span>
            <span>Record B: <strong className="text-emerald-700 font-bold">{selectedSc.events_b_count}</strong> events</span>
            <span>Total Unified: <strong className="text-slate-900 font-bold">{selectedSc.total_events}</strong> events</span>
          </div>
        </div>
      )}
    </div>
  );
}
