# RECORD FUSE — Architecture & Workflow Diagrams

> **CORE GUARANTEE**: NO ORIGINAL CLINICAL EVENT IS SILENTLY LOST.

This document details the architectural workflows, decision engines, and mathematical invariant checks that power **RECORD FUSE**.

---

## 1. End-to-End System Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Input["1. Disparate Healthcare Data Sources"]
        RA["Record A: Outpatient Clinic<br/>(e.g., Jonathan Doe, 6 Events)"]
        RB["Record B: Urgent Care Center<br/>(e.g., John Doe, 7 Events)"]
    end

    subgraph Phase1["2. Demographic Identity Matching"]
        AI["Demographic Match Engine<br/>(DOB 40% + SSN 30% + Name 25%)"]
        Score{"Match Confidence<br/>>= 70%?"}
        Manual["Flag for Manual Review"]
        UPI["Issue Permanent Master Patient ID<br/>(e.g., UPI-1982-4892-DOE)"]
    end

    subgraph Phase2["3. Deterministic Timeline Reconciliation"]
        Rec["TimelineReconciler<br/>Timestamp Sorting (t_1 <= t_2 <= ... <= t_n)"]
        Overlap["OverlapDetector<br/>Tag Exact Collisions (Δt = 0)<br/>Tag Near Overlaps (0 < Δt <= 30m)"]
        Timeline["Unified Reconciled Timeline<br/>(100% of Events Retained Side-by-Side)"]
    end

    subgraph Phase3["4. Zero-Loss Machine Verification"]
        Ver["ZeroLossVerifier<br/>Invariant: N_A + N_B == N_reconciled<br/>Lost Count == 0<br/>Provenance Intact == True"]
        Proof{"Verification<br/>Status?"}
        Pass["🟢 Status: PASS<br/>Machine Proof Certificate Issued"]
        Fail["🔴 Status: FAIL<br/>Reconciliation Rejected"]
    end

    subgraph Output["5. Output & Delivery"]
        UI["React Frontend Dashboard<br/>(:5173)"]
        Audit["Immutable Audit Log & API Docs<br/>(:8001/docs)"]
    end

    RA & RB --> AI
    AI --> Score
    Score -- "< 70%" --> Manual
    Score -- ">= 70%" --> UPI
    UPI --> Rec
    RA & RB --> Rec
    Rec --> Overlap --> Timeline
    Timeline --> Ver
    Ver --> Proof
    Proof -- "Valid" --> Pass
    Proof -- "Invalid" --> Fail
    Pass --> UI & Audit
```

---

## 2. Demographic Similarity & Duplicate Matching Engine

```text
🤖 RecordFuse AI Match Analysis

I compared the two patient records using the following weighted factors:

👤 Name              → 25%
📅 Date of Birth     → 25%
📱 Phone Number      → 15%
📧 Email             → 10%
🏠 Address           → 10%
🪪 National ID       → 10%
⚧️ Gender            →  5%
────────────────────────
📊 Total             → 100%

Confidence Score: 90.5%
Decision: 🟢 HIGH CONFIDENCE
Action: APPROVED
```

### Decision Flowchart:

```mermaid
flowchart TD
    Start["Start Demographic Evaluation<br/>(Patient A vs Patient B)"] --> DOB{"Date of Birth Match?<br/>(YYYY-MM-DD)"}
    
    DOB -- Yes --> D1["+40% (+0.40)"]
    DOB -- No --> D0["+0% (Flag Discrepancy)"]
    
    D1 & D0 --> SSN{"SSN Last-4 Match?<br/>(e.g., 4892)"}
    
    SSN -- Yes --> S1["+30% (+0.30)"]
    SSN -- No --> S0["+0% (Flag Discrepancy)"]
    
    S1 & S0 --> Last{"Surname / Last Name Match?<br/>(case-insensitive)"}
    
    Last -- Yes --> L1["+15% (+0.15)"]
    Last -- No --> L0["+0%"]
    
    L1 & L0 --> First{"First Name Comparison"}
    
    First -- "Exact Match" --> F1["+15% (+0.15)"]
    First -- "Nickname / Alias<br/>(Jonathan vs John)" --> F2["+10% (+0.10)"]
    First -- "No Match" --> F0["+0%"]
    
    F1 & F2 & F0 --> Sum["Total Score = Sum of Weights"]
    Sum --> Clamp["Confidence = min(98%, max(10%, Score))"]
    
    Clamp --> Dec{"Confidence >= 70%?"}
    Dec -- "Yes (e.g. 95%)" --> High["🟢 HIGH CONFIDENCE MATCH<br/>Unify under Master UPI"]
    Dec -- "No" --> Low["🟡 MANUAL CLINICAL REVIEW REQUIRED"]
```

---

## 3. Deterministic Timeline Reconciliation & Concurrency Detection

The reconciliation engine ensures that **no clinical event is ever deleted, overwritten, or summarized away**.

```mermaid
flowchart TD
    InA["Record A Events: [A-001 ... A-006]"] & InB["Record B Events: [B-001 ... B-007]"] --> Merge["Combined Event Pool (Total: 13 Events)"]
    
    Merge --> Sort["Sort Chronologically by Timestamp<br/>t_1 <= t_2 <= ... <= t_n"]
    
    Sort --> CheckExact{"Exact Collision?<br/>t_A == t_B from different records"}
    
    CheckExact -- "Yes (e.g., 10:00 AM Cardiology vs Urgent Care)" --> ExactTag["Annotate 'is_overlapping = True'<br/>Assign Group ID: 'OVERLAP-1000'<br/>Preserve BOTH side-by-side"]
    CheckExact -- "No" --> CheckNear{"Near Overlap?<br/>0 < |t_A - t_B| <= 30 minutes"}
    
    CheckNear -- "Yes (e.g., 11:30 AM vs 12:00 PM)" --> NearTag["Annotate 'is_near_overlap = True'<br/>Assign Group ID: 'NEAR-2000'"]
    CheckNear -- "No" --> SeqTag["Sequential Event (Independent)"]
    
    ExactTag & NearTag & SeqTag --> OutputTL["Unified Chronological Timeline<br/>(Chronological Indices #1 to #13)"]
```

---

## 4. Machine-Checkable Zero-Loss Invariant Verification

Before output is accepted, the `ZeroLossVerifier` enforces mathematical guarantees:

```mermaid
flowchart LR
    subgraph Inputs
        NA["N_A: Events in Record A (6)"]
        NB["N_B: Events in Record B (7)"]
        NR["N_reconciled: Events in Timeline (13)"]
    end

    subgraph Invariants["Mathematical Invariant Checks"]
        I1{"1. Count Invariant:<br/>N_A + N_B == N_reconciled?"}
        I2{"2. Event ID Invariant:<br/>Every Event ID in Manifest?"}
        I3{"3. Provenance Invariant:<br/>All source records intact?"}
        I4{"4. No Loss Invariant:<br/>lost_events_count == 0?"}
    end

    NA & NB & NR --> I1
    I1 -- Pass --> I2
    I2 -- Pass --> I3
    I3 -- Pass --> I4
    
    I4 -- All Passed --> PASS["🟢 VERIFICATION: PASS<br/>• Mathematical Proof Valid<br/>• 0 Events Dropped<br/>• Ready for EMR Integration"]
    
    I1 -- Fail --> FAIL["🔴 VERIFICATION: FAIL<br/>Reconciliation Blocked"]
    I2 -- Fail --> FAIL
    I3 -- Fail --> FAIL
    I4 -- Fail --> FAIL
```

---

## 5. Universal Master Patient Identifier (UPI) Generation

When duplicate records match with high confidence, a deterministic lifetime master identifier is generated:

$$\text{UPI} = \text{"UPI-" } + \text{DOB}_{\text{year}} + \text{"-"} + \text{SSN}_{\text{last4}} + \text{"-"} + \text{Surname}_{\text{uppercase}}$$

* **Example**:
  * Date of Birth: `1982-04-14`
  * SSN Last 4: `4892`
  * Last Name: `Doe`
  * **Result**: `UPI-1982-4892-DOE`
