from typing import List, Dict, Any, Union
from app.schemas.event import ClinicalEventSchema
from app.schemas.reconciliation import MergedTimelineEventSchema, ReconciliationOutputSchema
from app.engine.overlap_detector import OverlapDetector

class TimelineReconciler:
    """
    Pure Python Deterministic Clinical Timeline Reconciliation Engine.
    
    NON-NEGOTIABLE GUARANTEES:
    1. Zero Clinical Event Loss: len(Unified) == len(Record_A) + len(Record_B).
    2. Immutable Provenance: Every event retains original event_id ('A-001', 'B-001') and source_record.
    3. Strict Chronological Ordering: Primary sort by timestamp, secondary by source record.
    4. Non-Destructive Overlap Handling: Concurrent events (e.g. 10:00 AM) are preserved side-by-side.
    """

    def __init__(self, near_window_minutes: int = 30):
        self.overlap_detector = OverlapDetector(near_window_minutes=near_window_minutes)

    def reconcile(
        self, 
        events_a: List[Union[ClinicalEventSchema, Dict[str, Any]]], 
        events_b: List[Union[ClinicalEventSchema, Dict[str, Any]]]
    ) -> ReconciliationOutputSchema:
        """
        Reconciles events from Record A and Record B into a unified chronological timeline.
        """
        count_a = len(events_a)
        count_b = len(events_b)
        expected_total = count_a + count_b

        # Convert schemas to standard dicts if necessary
        combined: List[Dict[str, Any]] = []

        for item in events_a:
            data = item.model_dump() if isinstance(item, ClinicalEventSchema) else dict(item)
            combined.append({
                "original_event_id": data["event_id"],
                "patient_id": data["patient_id"],
                "source_record": data.get("source_record", "record_A"),
                "timestamp": data["timestamp"],
                "event_type": data["event_type"],
                "description": data["description"],
                "provider": data.get("provider"),
                "department": data.get("department"),
                "metadata": data.get("metadata")
            })

        for item in events_b:
            data = item.model_dump() if isinstance(item, ClinicalEventSchema) else dict(item)
            combined.append({
                "original_event_id": data["event_id"],
                "patient_id": data["patient_id"],
                "source_record": data.get("source_record", "record_B"),
                "timestamp": data["timestamp"],
                "event_type": data["event_type"],
                "description": data["description"],
                "provider": data.get("provider"),
                "department": data.get("department"),
                "metadata": data.get("metadata")
            })

        # Step 1: Strict Chronological Sorting
        # Primary: Timestamp ascending
        # Secondary: Source record ('record_A' before 'record_B' for deterministic stability)
        # Tertiary: Original event ID
        sorted_events = sorted(
            combined,
            key=lambda x: (x["timestamp"], x["source_record"], x["original_event_id"])
        )

        # Step 2: Overlap & Concurrency Detection
        annotated_events = self.overlap_detector.detect_overlaps(sorted_events)

        # Step 3: Assign Chronological Index
        timeline_schemas: List[MergedTimelineEventSchema] = []
        exact_overlaps_count = 0
        near_overlaps_count = 0

        for index, ev in enumerate(annotated_events, start=1):
            ev["chronological_index"] = index
            schema_item = MergedTimelineEventSchema(**ev)
            timeline_schemas.append(schema_item)

            if schema_item.is_overlapping:
                exact_overlaps_count += 1
            elif schema_item.is_near_overlap:
                near_overlaps_count += 1

        # Step 4: Mathematical Invariant Assertions
        actual_total = len(timeline_schemas)
        if actual_total != expected_total:
            raise ValueError(
                f"Reconciliation invariant failed: Expected {expected_total} events, but produced {actual_total}."
            )

        preserved_ids = [e.original_event_id for e in timeline_schemas]
        if len(set(preserved_ids)) != expected_total:
            raise ValueError(
                f"Reconciliation ID invariant failed: Duplicate or missing IDs detected in output."
            )

        return ReconciliationOutputSchema(
            record_a_count=count_a,
            record_b_count=count_b,
            total_events=actual_total,
            preserved_event_ids=preserved_ids,
            exact_overlaps_count=exact_overlaps_count,
            near_overlaps_count=near_overlaps_count,
            timeline=timeline_schemas
        )
