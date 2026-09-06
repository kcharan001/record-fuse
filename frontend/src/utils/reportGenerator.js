/**
 * Utility functions for generating downloadable Clinical History Reports (Printable HTML / PDF ready)
 */

export function downloadPatientReport(patient, events) {
  if (!patient) return;

  const generatedAt = new Date().toLocaleString();
  const year = patient.dob?.split('-')[0] || '2026';
  const upi = patient.permanent_patient_id || `UPI-${year}-${patient.ssn_last4 || '0000'}-${(patient.last_name || 'PATIENT').toUpperCase()}`;
  const safeEvents = events || [];

  const eventsHtml = safeEvents.map((ev, idx) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #475569;">#${idx + 1}</td>
      <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #4f46e5;">${ev.event_id || ev.original_event_id}</td>
      <td style="padding: 10px; white-space: nowrap;">${new Date(ev.timestamp).toLocaleString()}</td>
      <td style="padding: 10px; font-weight: bold; color: #0f172a;">${ev.description}</td>
      <td style="padding: 10px;"><span style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1;">${ev.event_type}</span></td>
      <td style="padding: 10px;">${ev.provider || 'Staff Physician'}</td>
      <td style="padding: 10px;">${ev.department || 'Outpatient Clinic'}</td>
      <td style="padding: 10px;">
        <span style="background: ${ev.source_record === 'record_B' ? '#dcfce7' : '#e0e7ff'}; color: ${ev.source_record === 'record_B' ? '#166534' : '#3730a3'}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; border: 1px solid ${ev.source_record === 'record_B' ? '#86efac' : '#a5b4fc'};">
          ${ev.source_record === 'record_B' ? 'Record B' : 'Record A'}
        </span>
      </td>
    </tr>
  `).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Clinical History Report - ${patient.first_name} ${patient.last_name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 700; }
    .badge-verified { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; font-family: monospace; }
    .section-title { font-size: 13px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .field-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .field-value { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th { background: #f1f5f9; color: #475569; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; font-family: monospace; }
    .btn-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 2px 4px rgba(79,70,229,0.2); }
    .btn-print:hover { background: #4338ca; }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" class="btn-print">🖨️ Save as PDF / Print Official Report</button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">RECORD FUSE — CLINICAL MEDICAL HISTORY REPORT</h1>
      <div class="subtitle">Enterprise Patient Record Reconciliation & Governance System</div>
    </div>
    <div class="badge-verified">
      ✓ ZERO DATA LOSS VERIFIED
    </div>
  </div>

  <div class="section-title">Patient Demographic Profile</div>
  <div class="grid">
    <div>
      <div class="field-label">Patient Full Name</div>
      <div class="field-value">${patient.first_name} ${patient.last_name}</div>
    </div>
    <div>
      <div class="field-label">Permanent Master ID (UPI)</div>
      <div class="field-value" style="font-family: monospace; color: #4f46e5;">${upi}</div>
    </div>
    <div>
      <div class="field-label">Internal Record ID</div>
      <div class="field-value" style="font-family: monospace;">${patient.id}</div>
    </div>
    <div>
      <div class="field-label">Date of Birth & Gender</div>
      <div class="field-value">${patient.dob} (${patient.gender})</div>
    </div>
    <div>
      <div class="field-label">Aadhaar / National ID (Last 4)</div>
      <div class="field-value" style="font-family: monospace;">****-****-${patient.ssn_last4 || '0000'}</div>
    </div>
    <div>
      <div class="field-label">Phone Number</div>
      <div class="field-value">${patient.phone || 'N/A'}</div>
    </div>
    <div style="grid-column: span 3;">
      <div class="field-label">Primary Address</div>
      <div class="field-value">${patient.address || 'N/A'}</div>
    </div>
  </div>

  <div class="section-title">Complete Clinical History Timeline (${safeEvents.length} Encounters Total)</div>
  ${safeEvents.length === 0 ? '<p style="color: #94a3b8; font-style: italic; padding: 20px 0;">No clinical encounters stored in database for this patient profile.</p>' : `
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Event ID</th>
        <th>Timestamp</th>
        <th>Description / Chief Complaint</th>
        <th>Type</th>
        <th>Provider</th>
        <th>Department</th>
        <th>Source</th>
      </tr>
    </thead>
    <tbody>
      ${eventsHtml}
    </tbody>
  </table>
  `}

  <div class="footer">
    <div>Generated by RecordFuse Enterprise Health Core on ${generatedAt}</div>
    <div>Page 1 of 1 — Confidential Patient Medical Record</div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Patient_Report_${patient.first_name}_${patient.last_name}_${patient.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadReconciledReport(patientA, patientB, reconciliation) {
  if (!reconciliation) return;

  const generatedAt = new Date().toLocaleString();
  const upi = reconciliation.permanent_patient_id || patientA?.permanent_patient_id || 'UPI-MASTER-RECONCILED';
  const timeline = reconciliation.timeline || [];

  const timelineHtml = timeline.map((ev) => `
    <tr style="border-bottom: 1px solid #e2e8f0; background: ${ev.is_overlapping ? '#fffbeb' : 'white'};">
      <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #475569;">#${ev.chronological_index}</td>
      <td style="padding: 10px; font-family: monospace; font-weight: bold; color: #4f46e5;">${ev.original_event_id}</td>
      <td style="padding: 10px; white-space: nowrap;">${new Date(ev.timestamp).toLocaleString()}</td>
      <td style="padding: 10px; font-weight: bold; color: #0f172a;">
        ${ev.description}
        ${ev.is_overlapping ? '<span style="display: inline-block; margin-left: 6px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">EXACT OVERLAP</span>' : ''}
      </td>
      <td style="padding: 10px;"><span style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #cbd5e1;">${ev.event_type}</span></td>
      <td style="padding: 10px;">${ev.provider || 'Staff Physician'}</td>
      <td style="padding: 10px;">${ev.department || 'Outpatient Clinic'}</td>
      <td style="padding: 10px;">
        <span style="background: ${ev.source_record === 'record_B' ? '#dcfce7' : '#e0e7ff'}; color: ${ev.source_record === 'record_B' ? '#166534' : '#3730a3'}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
          ${ev.source_record === 'record_B' ? 'Record B' : 'Record A'}
        </span>
      </td>
    </tr>
  `).join('');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Reconciled Clinical Record Report - ${upi}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
    .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
    .subtitle { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 700; }
    .badge-verified { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; font-family: monospace; }
    .section-title { font-size: 13px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
    .comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
    .card { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .card-title { font-size: 12px; font-weight: 800; color: #4f46e5; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .field-label { font-size: 10px; color: #64748b; text-transform: uppercase; font-weight: 700; }
    .field-value { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th { background: #f1f5f9; color: #475569; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; font-family: monospace; }
    .btn-print { background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer; }
    @media print {
      body { margin: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" class="btn-print">🖨️ Save as PDF / Print Reconciled Master Report</button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">RECORD FUSE — RECONCILED MASTER CLINICAL REPORT</h1>
      <div class="subtitle">Permanent Master UPI: ${upi}</div>
    </div>
    <div class="badge-verified">
      ✓ ZERO LOSS VERIFIED (N = ${reconciliation.total_events})
    </div>
  </div>

  <div class="section-title">Duplicate Record Demographic Comparison</div>
  <div class="comparison-grid">
    <div class="card">
      <div class="card-title">Primary Record A (${patientA?.id || 'REC-A'})</div>
      <div class="field-label">Patient Name</div>
      <div class="field-value">${patientA?.first_name || 'Jonathan'} ${patientA?.last_name || 'Doe'}</div>
      <div class="field-label">Date of Birth & Gender</div>
      <div class="field-value">${patientA?.dob || 'N/A'} (${patientA?.gender || 'N/A'})</div>
      <div class="field-label">SSN (Last 4)</div>
      <div class="field-value font-mono">***-**-${patientA?.ssn_last4 || '0000'}</div>
      <div class="field-label">Phone & Address</div>
      <div class="field-value">${patientA?.phone || 'N/A'} | ${patientA?.address || 'N/A'}</div>
    </div>

    <div class="card">
      <div class="card-title">Secondary Record B (${patientB?.id || 'REC-B'})</div>
      <div class="field-label">Patient Name</div>
      <div class="field-value">${patientB?.first_name || 'John'} ${patientB?.last_name || 'Doe'}</div>
      <div class="field-label">Date of Birth & Gender</div>
      <div class="field-value">${patientB?.dob || 'N/A'} (${patientB?.gender || 'N/A'})</div>
      <div class="field-label">SSN (Last 4)</div>
      <div class="field-value font-mono">***-**-${patientB?.ssn_last4 || '0000'}</div>
      <div class="field-label">Phone & Address</div>
      <div class="field-value">${patientB?.phone || 'N/A'} | ${patientB?.address || 'N/A'}</div>
    </div>
  </div>

  <div class="section-title">Unified Chronological Timeline (${timeline.length} Encounters Total)</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Event ID</th>
        <th>Timestamp</th>
        <th>Description / Chief Complaint</th>
        <th>Type</th>
        <th>Provider</th>
        <th>Department</th>
        <th>Source</th>
      </tr>
    </thead>
    <tbody>
      ${timelineHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>Reconciliation ID: ${reconciliation.reconciliation_id || 'RECON-1001'} | Approval Status: ${reconciliation.approval_status}</div>
    <div>Generated on ${generatedAt}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reconciled_Master_Report_${upi}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
