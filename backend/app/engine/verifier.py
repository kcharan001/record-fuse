from typing import List, Dict, Any, Union
from collections import Counter
from datetime import datetime, timezone
from app.schemas.event import ClinicalEventSchema
from app.schemas.reconciliation import MergedTimelineEventSchema
from app.schemas.verification import VerificationResultSchema

class ZeroLossVerifier:
    """
    Pure Deterministic Mathematical Verifier for Patient Record Merges.
    
    ASSERTIONS:
    1. expected_total == actual_total
    2. missing_event_ids == []
    3. duplicate_event_ids == []
    4. invalid_provenance_event_ids == []
    5. provenance_intact == True
    
    Produces PASS if all assertions hold; FAIL if any assertion is violated.
    """

    def verify(
        self,
        events_a: List[Union[ClinicalEventSchema, Dict[str, Any]]],
        events_b: List[Union[ClinicalEventSchema, Dict[str, Any]]],
        merged_timeline: List[Union[MergedTimelineEventSchema, Dict[str, Any]]]
    ) -> VerificationResultSchema:
        """
        Executes mathematical verification on a merged clinical timeline against source records.
        """
        count_a = len(events_a)
        count_b = len(events_b)
        expected_total = count_a + count_b
        actual_total = len(merged_timeline)

        # Extract original IDs
        ids_a = {
            (e.event_id if isinstance(e, ClinicalEventSchema) else e["event_id"]) 
            for e in events_a
        }
        ids_b = {
            (e.event_id if isinstance(e, ClinicalEventSchema) else e["event_id"]) 
            for e in events_b
        }
        all_original_ids = ids_a | ids_b

        # Extract merged IDs & source attributes
        merged_id_list = []
        invalid_provenance_ids = []

        for item in merged_timeline:
            orig_id = item.original_event_id if isinstance(item, MergedTimelineEventSchema) else item["original_event_id"]
            source = item.source_record if isinstance(item, MergedTimelineEventSchema) else item.get("source_record")

            merged_id_list.append(orig_id)

            # Check provenance consistency
            if source == "record_A":
                if orig_id not in ids_a or not orig_id.startswith("A-"):
                    invalid_provenance_ids.append(orig_id)
            elif source == "record_B":
                if orig_id not in ids_b or not orig_id.startswith("B-"):
                    invalid_provenance_ids.append(orig_id)
            else:
                invalid_provenance_ids.append(orig_id)

        # Count frequencies for duplicate detection
        counts = Counter(merged_id_list)
        duplicate_event_ids = sorted([event_id for event_id, freq in counts.items() if freq > 1])

        # Detect missing IDs
        missing_event_ids = sorted(list(all_original_ids - set(merged_id_list)))

        # Calculate lost event metrics
        lost_events_count = len(missing_event_ids) + max(0, expected_total - actual_total)
        provenance_intact = (len(invalid_provenance_ids) == 0)

        # Strict Pass/Fail Evaluation
        is_pass = (
            (expected_total == actual_total) and
            (len(missing_event_ids) == 0) and
            (len(duplicate_event_ids) == 0) and
            (len(invalid_provenance_ids) == 0) and
            provenance_intact
        )

        return VerificationResultSchema(
            record_a_count=count_a,
            record_b_count=count_b,
            expected_total=expected_total,
            actual_total=actual_total,
            missing_event_ids=missing_event_ids,
            duplicate_event_ids=duplicate_event_ids,
            invalid_provenance_event_ids=invalid_provenance_ids,
            lost_events_count=lost_events_count,
            provenance_intact=provenance_intact,
            status="PASS" if is_pass else "FAIL",
            verified_at=datetime.now(timezone.utc).isoformat()
        )
