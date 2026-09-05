import React, { useState } from 'react';
import { GitCommit, Layers, Clock, Building2, User, HelpCircle, X } from 'lucide-react';

export default function TimelineVisualizer({ timeline, aiAnalysis }) {
  const [filterSource, setFilterSource] = useState('ALL'); // 'ALL', 'record_A', 'record_B'
  const [selectedOverlap, setSelectedOverlap] = useState(null);

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
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl relative">
      {/* Visualizer Header & Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-100 text-base">
            <GitCommit className="w-5 h-5 text-indigo-400" />
            <span>Unified Chronological Timeline</span>
          </div>
          <p className="text-xs text-slate-400">
            Every merged event retains its original source provenance. Click on overlapping events for clinical rationale.
          </p>
        </div>

        {/* Provenance Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setFilterSource('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === 'ALL'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ALL (13)
          </button>
          <button
            onClick={() => setFilterSource('record_A')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === 'record_A'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RECORD A (6)
          </button>
          <button
            onClick={() => setFilterSource('record_B')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === 'record_B'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RECORD B (7)
          </button>
        </div>
      </div>

      {/* Timeline List */}
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
                  ? 'bg-indigo-950/40 border-amber-500/50 hover:border-amber-400'
                  : isNearOverlap
                  ? 'bg-slate-950/80 border-indigo-500/30 hover:border-indigo-400'
                  : 'bg-slate-950 border-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Index Badge */}
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                    #{ev.chronological_index}
                  </span>

                  <div className="space-y-1">
                    {/* Timestamp & Event ID */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-slate-300 font-semibold">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-slate-500">|</span>
                      <span className="font-bold text-slate-100">{ev.original_event_id}</span>

                      {/* Source Record Badge */}
                      {isRecordA ? (
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          Record A
                        </span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          Record B
                        </span>
                      )}

                      {/* Overlap Badges */}
                      {isExactOverlap && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                          EXACT OVERLAP ({ev.overlap_group_id})
                        </span>
                      )}
                      {isNearOverlap && (
                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px]">
                          NEAR OVERLAP
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <h4 className="text-sm font-bold text-slate-100">{ev.description}</h4>

                    {/* Metadata Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      {ev.provider && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" /> {ev.provider}
                        </span>
                      )}
                      {ev.department && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" /> {ev.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                  {ev.event_type}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlap Detail Modal */}
      {selectedOverlap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedOverlap(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
              <Layers className="w-5 h-5" />
              <span>Concurrent Activity Analysis ({selectedOverlap.group_id})</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              Overlap Category: {selectedOverlap.overlap_type?.toUpperCase()} COLLISION
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block">Preserved Overlapping Events:</span>
              {selectedOverlap.events?.map((ev) => (
                <div key={ev.original_event_id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="font-bold text-slate-100">{ev.original_event_id} [{ev.source_record}]</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-200 font-semibold">{ev.description}</p>
                  <p className="text-slate-400 text-[11px]">Provider: {ev.provider} | Dept: {ev.department}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
              <p><strong className="text-slate-100">Clinical Explanation:</strong> {selectedOverlap.ai_explanation}</p>
              <p><strong className="text-slate-100">Preservation Rationale:</strong> {selectedOverlap.preservation_rationale}</p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOverlap(null)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition"
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
