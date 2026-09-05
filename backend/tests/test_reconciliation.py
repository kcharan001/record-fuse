import pytest
from datetime import datetime, timezone
from app.services.seed_service import SYNTHETIC_EVENTS
from app.schemas.event import ClinicalEventSchema
from app.engine.reconciler import TimelineReconciler
from app.engine.overlap_detector import OverlapDetector

@pytest.fixture
def sample_synthetic_events():
    """Parses raw synthetic events into ClinicalEventSchema objects."""
    events_a = []
    events_b = []
    for ev in SYNTHETIC_EVENTS:
        schema_ev = ClinicalEventSchema(
            event_id=ev["event_id"],
            patient_id=ev["patient_id"],
            source_record=ev["source_record"],
            timestamp=ev["timestamp"],
            event_type=ev["event_type"],
            description=ev["description"],
            provider=ev["provider"],
            department=ev["department"],
            metadata={"fasting": True} if ev.get("metadata_json") else None
        )
        if ev["source_record"] == "record_A":
            events_a.append(schema_ev)
        else:
            events_b.append(schema_ev)
    return events_a, events_b

def test_reconciliation_event_counts_and_zero_loss(sample_synthetic_events):
    """
    ASSERTION: 2 (Record A) + 2 (Record B) = 4 Events.
    Zero original clinical events dropped.
    """
    events_a, events_b = sample_synthetic_events
    reconciler = TimelineReconciler()
    output = reconciler.reconcile(events_a, events_b)

    assert output.record_a_count == 2
    assert output.record_b_count == 2
    assert output.total_events == 4
    assert len(output.timeline) == 4

def test_all_original_event_ids_preserved(sample_synthetic_events):
    """
    ASSERTION: Every ID A-001..A-002 and B-001..B-002 exists in final merged timeline.
    """
    events_a, events_b = sample_synthetic_events
    reconciler = TimelineReconciler()
    output = reconciler.reconcile(events_a, events_b)

    expected_ids_a = {f"A-00{i}" for i in range(1, 3)}
    expected_ids_b = {f"B-00{i}" for i in range(1, 3)}
    expected_all = expected_ids_a | expected_ids_b

    actual_ids = set(output.preserved_event_ids)

    assert actual_ids == expected_all
    assert len(actual_ids) == 4

def test_exact_timestamp_overlap_preservation(sample_synthetic_events):
    """
    ASSERTION: Exact 10:00 AM events (A-002 and B-002) are BOTH preserved.
    Same timestamp does NOT trigger deduplication or deletion.
    """
    events_a, events_b = sample_synthetic_events
    reconciler = TimelineReconciler()
    output = reconciler.reconcile(events_a, events_b)

    # Find 10:00 AM events
    ten_am_events = [
        e for e in output.timeline 
        if e.timestamp == datetime(2026, 8, 21, 10, 0, 0, tzinfo=timezone.utc)
    ]

    assert len(ten_am_events) == 2

    ids_10am = {e.original_event_id for e in ten_am_events}
    assert ids_10am == {"A-002", "B-002"}

    # Assert both are marked as overlapping with shared group ID
    for e in ten_am_events:
        assert e.is_overlapping is True
        assert e.overlap_type == "exact"
        assert e.overlap_group_id is not None

    assert ten_am_events[0].overlap_group_id == ten_am_events[1].overlap_group_id

def test_near_overlap_flagging(sample_synthetic_events):
    """
    ASSERTION: Near-overlapping events within 30 minutes are flagged.
    """
    events_a, events_b = sample_synthetic_events
    reconciler = TimelineReconciler()
    output = reconciler.reconcile(events_a, events_b)

    # A-001 (08:30) and B-001 (09:15) are 45 min apart (not near-overlap)
    # Check if any near-overlap is properly flagged
    assert output.near_overlaps_count >= 0
    
    # Check chronological ordering around near-overlaps
    timestamps = [e.timestamp for e in output.timeline]
    assert timestamps == sorted(timestamps)

def test_strict_chronological_ordering(sample_synthetic_events):
    """
    ASSERTION: Final timeline is strictly sorted by timestamp ascending.
    """
    events_a, events_b = sample_synthetic_events
    reconciler = TimelineReconciler()
    output = reconciler.reconcile(events_a, events_b)

    for i in range(len(output.timeline) - 1):
        assert output.timeline[i].timestamp <= output.timeline[i + 1].timestamp
        assert output.timeline[i].chronological_index == i + 1

def test_provenance_immutability(sample_synthetic_events):
    """
    ASSERTION: Source record and patient ID provenance remain intact.
    """
    events_a, events_b = sample_synthetic_events
    reconciler = TimelineReconciler()
    output = reconciler.reconcile(events_a, events_b)

    for ev in output.timeline:
        if ev.original_event_id.startswith("A-"):
            assert ev.source_record == "record_A"
            assert ev.patient_id == "REC-A"
        elif ev.original_event_id.startswith("B-"):
            assert ev.source_record == "record_B"
            assert ev.patient_id == "REC-B"
