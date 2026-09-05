from typing import List, Dict, Any
from datetime import datetime, timedelta

class OverlapDetector:
    """
    Deterministic clinical timeline overlap & concurrency detector.
    
    GUARANTEE:
    - Never drops, alters, or removes any clinical event.
    - Annotates exact timestamp collisions (t_i == t_j from different records).
    - Annotates near-overlaps (within configurable 30-minute window).
    """

    def __init__(self, near_window_minutes: int = 30):
        self.near_window = timedelta(minutes=near_window_minutes)

    def detect_overlaps(self, sorted_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes a chronologically sorted list of events from Record A and Record B.
        Annotates overlap flags and group IDs.
        """
        n = len(sorted_events)
        if n == 0:
            return sorted_events

        # Initialize overlap metadata fields on each event
        for ev in sorted_events:
            ev["is_overlapping"] = False
            ev["is_near_overlap"] = False
            ev["overlap_group_id"] = None
            ev["overlap_type"] = None
            ev["conflict_flag"] = False

        exact_group_counter = 1000
        near_group_counter = 2000

        # Pass 1: Exact Timestamp Collision Detection
        for i in range(n):
            for j in range(i + 1, n):
                ev_i = sorted_events[i]
                ev_j = sorted_events[j]

                # If timestamps match exactly and originate from different records
                if ev_i["timestamp"] == ev_j["timestamp"] and ev_i["source_record"] != ev_j["source_record"]:
                    ev_i["is_overlapping"] = True
                    ev_j["is_overlapping"] = True
                    ev_i["overlap_type"] = "exact"
                    ev_j["overlap_type"] = "exact"

                    # Assign or share an exact overlap group ID
                    if not ev_i["overlap_group_id"] and not ev_j["overlap_group_id"]:
                        group_id = f"OVERLAP-{exact_group_counter}"
                        exact_group_counter += 1
                        ev_i["overlap_group_id"] = group_id
                        ev_j["overlap_group_id"] = group_id
                    elif ev_i["overlap_group_id"] and not ev_j["overlap_group_id"]:
                        ev_j["overlap_group_id"] = ev_i["overlap_group_id"]
                    elif not ev_i["overlap_group_id"] and ev_j["overlap_group_id"]:
                        ev_i["overlap_group_id"] = ev_j["overlap_group_id"]

        # Pass 2: Near-Overlap Window Detection (0 < delta <= 30 minutes)
        for i in range(n):
            for j in range(i + 1, n):
                ev_i = sorted_events[i]
                ev_j = sorted_events[j]

                # Skip if already tagged as exact overlap
                if ev_i["is_overlapping"] and ev_j["is_overlapping"]:
                    continue

                if ev_i["source_record"] != ev_j["source_record"]:
                    time_diff = abs(ev_i["timestamp"] - ev_j["timestamp"])
                    if timedelta(seconds=0) < time_diff <= self.near_window:
                        if not ev_i["is_overlapping"]:
                            ev_i["is_near_overlap"] = True
                            if not ev_i["overlap_type"]:
                                ev_i["overlap_type"] = "near"
                        if not ev_j["is_overlapping"]:
                            ev_j["is_near_overlap"] = True
                            if not ev_j["overlap_type"]:
                                ev_j["overlap_type"] = "near"

                        if not ev_i["overlap_group_id"] and not ev_j["overlap_group_id"]:
                            group_id = f"NEAR-{near_group_counter}"
                            near_group_counter += 1
                            ev_i["overlap_group_id"] = group_id
                            ev_j["overlap_group_id"] = group_id
                        elif ev_i["overlap_group_id"] and not ev_j["overlap_group_id"]:
                            ev_j["overlap_group_id"] = ev_i["overlap_group_id"]
                        elif not ev_i["overlap_group_id"] and ev_j["overlap_group_id"]:
                            ev_i["overlap_group_id"] = ev_j["overlap_group_id"]

        return sorted_events
