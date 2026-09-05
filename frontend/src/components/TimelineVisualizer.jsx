import React, { useState } from 'react';
import { GitCommit, Layers, Clock, Building2, User, HelpCircle, X, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';

export default function TimelineVisualizer({ timeline, aiAnalysis, onRefresh }) {
  const [filterSource, setFilterSource] = useState('ALL'); // 'ALL', 'record_A', 'record_B'
  const [selectedOverlap, setSelectedOverlap] = useState(null);
  const [togglingEventId, setTogglingEventId] = useState(null);

  const handleToggleProvenance = async (e, ev) => {
    e.stopPropagation();
    const newRecord = ev.source_record === 'record_A' ? 'record_B' : 'record_A';
    setTogglingEventId(ev.original_event_id);
    try {
      await apiClient.patch(`/api/records/event/${ev.original_event_id}?source_record=${newRecord}`);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      console.error('Failed to toggle event provenance:', err);
      alert('Failed to update event record provenance.');
    } finally {
      setTogglingEventId(null);
    }
  };

  const totalCount = (timeline || []).length;
  const countA = (timeline || []).filter(e => e.source_record === 'record_A').length;
  const countB = (timeline || []).filter(e => e.source_record === 'record_B').length;

  const filteredTimeline = (timeline || []).filter((item) => {
    if (filterSource === 'ALL') return true;
    return item.source_record === filterSource;
  });

  const overlapAnalyses = aiAnalysis?.overlap_analyses || [];

  const handleOverlapClick = (eventItem) => {
    if (!eventItem.is_overlapping && !eventItem.is_near_overlap) return;

    // Find all events sharing this overlap_group_id
    const groupEvents = timeline.filter(
      (e) => e.overlap_group_id && e.overlap_group_id === eventItem.overlap_group_id
    );

    const aiInfo = overlapAnalyses.find(
      (a) => a.overlap_group_id === eventItem.overlap_group_id
    );

    setSelectedOverlap({
      group_id: eventItem.overlap_group_id,
      overlap_type: eventItem.overlap_type,
      events: groupEvents,
      ai_explanation: aiInfo?.clinical_explanation || "Concurrent clinical activity detected across duplicate records prior to discovery.",
      preservation_rationale: aiInfo?.preservation_rationale || "Both original events preserved side-by-side to guarantee zero data loss."
    });
  };

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-6 shadow-sm relative">
      {/* Visualizer Header & Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <GitCommit className="w-5 h-5 text-indigo-600" />
            <span>Unified Chronological Timeline</span>
          </div>
          <p className="text-xs text-slate-500">
            Every merged event retains its original source provenance. Click on overlapping events for clinical rationale.
          </p>
        </div>

        {/* Provenance Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setFilterSource('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ALL ({totalCount})
          </button>
          <button
            onClick={() => setFilterSource('record_A')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === 'record_A'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RECORD A ({countA})
          </button>
          <button
            onClick={() => setFilterSource('record_B')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === 'record_B'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RECORD B ({countB})
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {filteredTimeline.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
          No clinical encounters found for this patient selection in database.
        </div>
      ) : (
        <div className="space-y-3 relative">
          {filteredTimeline.map((ev) => {
            const isRecordA = ev.source_record === 'record_A';
            const isExactOverlap = ev.is_overlapping;
            const isNearOverlap = ev.is_near_overlap;

          return (
            <div
              key={`${ev.source_record}-${ev.original_event_id}`}
              onClick={() => (isExactOverlap || isNearOverlap) && handleOverlapClick(ev)}
              className={`p-4 rounded-xl border transition cursor-pointer relative ${
                isExactOverlap
                  ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400'
                  : isNearOverlap
                  ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Index Badge */}
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                    #{ev.chronological_index}
                  </span>

                  <div className="space-y-1">
                    {/* Timestamp & Event ID */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700 font-semibold">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-slate-900">{ev.original_event_id}</span>

                      {/* Source Record Badge (Interactive Toggle) */}
                      <button
                        onClick={(e) => handleToggleProvenance(e, ev)}
                        disabled={togglingEventId === ev.original_event_id}
                        title={`Click to switch this encounter provenance to ${isRecordA ? 'Record B' : 'Record A'}`}
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer hover:scale-105 ${
                          isRecordA
                            ? 'bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                        }`}
                      >
                        {togglingEventId === ev.original_event_id ? (
                          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                        ) : null}
                        <span>{isRecordA ? 'Record A' : 'Record B'}</span>
                      </button>

                      {/* Overlap Badges */}
                      {isExactOverlap && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                          EXACT OVERLAP ({ev.overlap_group_id})
                        </span>
                      )}
                      {isNearOverlap && (
                        <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[10px]">
                          NEAR OVERLAP
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <h4 className="text-sm font-bold text-slate-900">{ev.description}</h4>

                    {/* Metadata Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      {ev.provider && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {ev.provider}
                        </span>
                      )}
                      {ev.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" /> {ev.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                  {ev.event_type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Overlap Detail Modal */}
      {selectedOverlap && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedOverlap(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-600 font-bold text-base">
              <Layers className="w-5 h-5" />
              <span>Concurrent Activity Analysis ({selectedOverlap.group_id})</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
              Overlap Category: {selectedOverlap.overlap_type?.toUpperCase()} COLLISION
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-600 font-bold block">Preserved Overlapping Events:</span>
              {selectedOverlap.events?.map((ev) => (
                <div key={ev.original_event_id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-slate-900">{ev.original_event_id} [{ev.source_record}]</span>
                    <span className="text-slate-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-800 font-semibold">{ev.description}</p>
                  <p className="text-slate-500 text-[11px]">Provider: {ev.provider} | Dept: {ev.department}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200">
              <p><strong className="text-slate-900">Clinical Explanation:</strong> {selectedOverlap.ai_explanation}</p>
              <p><strong className="text-slate-900">Preservation Rationale:</strong> {selectedOverlap.preservation_rationale}</p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOverlap(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition shadow-sm"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
