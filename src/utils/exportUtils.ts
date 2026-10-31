/**
 * CareBridge AI - Export & Print Engine
 * Provides verified direct downloads for JSON, high-resolution A4 PDFs, and isolated clean printing.
 * Team: AVENGERS | Healthcare Track H2 | TalentAP Mega Hackathon 2026
 */

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientCarePlan, ClinicalFacts, FaithfulnessReport } from '../types/careplan';

/**
 * 1. DIRECT JSON DOWNLOAD
 * Downloads a genuine, formatted CareBridge_Care_Plan.json file via Blob API.
 * Never opens Notepad, new browser tabs, or window.open().
 */
export function downloadCarePlanJSON(
  plan: PatientCarePlan,
  facts: ClinicalFacts,
  report: FaithfulnessReport,
  filename = 'CareBridge_Care_Plan.json'
): void {
  const exportData = {
    product: 'CareBridge AI',
    version: '2.0.0',
    generatedDate: new Date().toISOString(),
    patientId: facts.patientId || 'Not recorded',
    admissionReason: facts.admissionReason || 'General Post-Procedure Recovery',
    language: plan.language,
    verificationStatus: report.overallStatus,
    verificationToken: `CB-${(facts.patientId || 'SYNTH').slice(0, 8)}-${report.passedCount}P${report.failedCount}F`,
    validationSummary: {
      passed: report.passedCount,
      failed: report.failedCount,
      unresolved: report.unresolvedCount,
    },
    facts: {
      patientId: facts.patientId,
      admissionReason: facts.admissionReason,
      medications: facts.medications,
      stoppedMedications: facts.stoppedMedications || [],
      followUp: facts.followUp,
      warningSigns: facts.warningSigns,
      dietInstructions: facts.dietInstructions,
      activityInstructions: facts.activityInstructions,
      homeCareAndWound: facts.homeCareAndWound,
      contradictionsDetected: facts.contradictionsDetected,
    },
    carePlan: {
      language: plan.language,
      careSummary: plan.careSummary,
      medications: plan.medications.map((m) => ({
        id: m.id,
        medicineName: m.medicineName,
        strength: m.strength,
        howMuch: m.howMuch,
        route: m.route,
        whenToTake: m.whenToTake,
        forHowLong: m.forHowLong,
        durationDays: m.durationDays,
        purposeOrNote: m.purposeOrNote,
        validationStatus: m.validationStatus,
        discrepancyReason: m.discrepancyReason,
        sourceEvidence: m.sourceEvidence,
      })),
      stoppedMedications: facts.stoppedMedications || [],
      dailyCare: plan.dailyCare,
      foodAndDrink: plan.foodAndDrink,
      activity: plan.activity,
      warningSigns: plan.warningSigns,
      followUp: plan.followUp,
      questionsForCareTeam: plan.questionsForCareTeam,
      readabilityScore: plan.readabilityScore,
      sevenDaySchedule: plan.sevenDaySchedule,
    },
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 2. DIRECT A4 PDF DOWNLOAD
 * Generates an authentic binary PDF file using html2canvas + jsPDF.
 * Maintains A4 dimensions (210mm x 297mm), clean pagination, and authentic Telugu rendering.
 */
export async function downloadPrescriptionPDF(
  element: HTMLElement,
  filename = 'CareBridge_Prescription.pdf'
): Promise<void> {
  // Capture high-DPI canvas of the printable care sheet
  const canvas = await html2canvas(element, {
    scale: 2, // 2x scale for sharp vector-like print quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const margin = 10; // 10mm margins
  const contentWidth = pageWidth - 2 * margin; // 190mm
  const contentHeight = pageHeight - 2 * margin; // 277mm

  // Total height of the rendered image in PDF millimeters
  const totalImgHeightMm = (canvas.height * contentWidth) / canvas.width;

  if (totalImgHeightMm <= contentHeight) {
    // Fits on a single A4 page
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, totalImgHeightMm);
  } else {
    // Multi-page slicing across standard A4 pages
    const pageHeightPx = Math.floor((contentHeight * canvas.width) / contentWidth);
    let renderedHeightPx = 0;
    let pageIndex = 0;

    while (renderedHeightPx < canvas.height) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedHeightPx);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );

        const sliceImgData = sliceCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = (sliceHeightPx * contentWidth) / canvas.width;
        pdf.addImage(sliceImgData, 'JPEG', margin, margin, contentWidth, sliceHeightMm);
      }

      renderedHeightPx += pageHeightPx;
      pageIndex++;
    }
  }

  // Trigger direct file download
  pdf.save(filename);
}

/**
 * 3. ISOLATED CLEAN PRINT
 * Prints ONLY the patient care plan via an isolated, hidden iframe.
 * Completely eliminates "This app doesn't support print preview" by isolating
 * the document from the main app's fixed/backdrop-filtered DOM tree.
 */
export function printCarePlanElement(element: HTMLElement): Promise<boolean> {
  return new Promise((resolve) => {
    // Remove any pre-existing print iframe
    const existingIframe = document.getElementById('carebridge-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'carebridge-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '1000px';
    iframe.style.height = '1400px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      resolve(false);
      return;
    }

    const clone = element.cloneNode(true) as HTMLElement;
    // Strip action buttons and headers marked with no-print
    clone.querySelectorAll('.no-print').forEach((el) => el.remove());

    doc.open();
    doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>CareBridge_Care_Plan</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 12mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.4;
    }
    .printable-care-sheet {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      margin-bottom: 4px;
    }
    th, td {
      border: 1px solid #cbd5e1 !important;
      padding: 6px 8px;
      text-align: left;
      font-size: 9.5pt;
    }
    th {
      background-color: #f1f5f9 !important;
      font-weight: 700;
      color: #1e293b !important;
    }
    .page-break-inside-avoid {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Semantic styling rules */
    .bg-slate-50 { background-color: #f8fafc !important; }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    .bg-teal-50\\/30 { background-color: #f0fdfa !important; }
    .bg-amber-50, .bg-amber-50\\/80 { background-color: #fffbeb !important; }
    .bg-rose-50, .bg-rose-50\\/60 { background-color: #fff1f2 !important; }
    .bg-emerald-50 { background-color: #ecfdf5 !important; }
    .text-slate-900 { color: #0f172a !important; }
    .text-slate-800 { color: #1e293b !important; }
    .text-slate-700 { color: #334155 !important; }
    .text-slate-600 { color: #475569 !important; }
    .text-slate-500 { color: #64748b !important; }
    .text-teal-700, .text-teal-800 { color: #0f766e !important; }
    .text-rose-900, .text-rose-950 { color: #881337 !important; }
    .text-amber-900, .text-amber-950 { color: #78350f !important; }
    .text-emerald-800 { color: #065f46 !important; }
    .border-slate-200 { border-color: #e2e8f0 !important; }
    .border-slate-300 { border-color: #cbd5e1 !important; }
    .border-teal-100 { border-color: #ccfbf1 !important; }
    .border-rose-300, .border-rose-500 { border-color: #f43f5e !important; }
    .border-amber-300, .border-amber-500 { border-color: #f59e0b !important; }
    .border-emerald-300 { border-color: #6ee7b7 !important; }
    .border { border-width: 1px; border-style: solid; }
    .border-2 { border-width: 2px; border-style: solid; }
    .border-b-2 { border-bottom-width: 2px; border-bottom-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .rounded-md { border-radius: 4px; }
    .rounded-lg { border-radius: 8px; }
    .rounded-xl { border-radius: 12px; }
    .rounded-2xl { border-radius: 16px; }
    .p-2 { padding: 8px; }
    .p-3 { padding: 12px; }
    .p-3\\.5 { padding: 14px; }
    .p-4 { padding: 16px; }
    .p-6 { padding: 24px; }
    .pb-4 { padding-bottom: 16px; }
    .pt-3 { padding-top: 12px; }
    .mb-1\\.5 { margin-bottom: 6px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-4 { margin-bottom: 16px; }
    .mb-5 { margin-bottom: 20px; }
    .mt-0\\.5 { margin-top: 2px; }
    .mt-1 { margin-top: 4px; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .text-xs { font-size: 9pt; }
    .text-sm { font-size: 10pt; }
    .text-base { font-size: 11pt; }
    .text-xl { font-size: 14pt; }
    .text-2xl { font-size: 16pt; }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .gap-3 { gap: 12px; }
    .gap-4 { gap: 16px; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .space-x-2 > * + * { margin-left: 8px; }
    .space-x-6 > * + * { margin-left: 24px; }
    .list-disc { list-style-type: disc; }
    .pl-4 { padding-left: 16px; }
    .pl-3\\.5 { padding-left: 14px; }
    .w-full { width: 100%; }
    .w-2 { width: 8px; }
    .h-2 { height: 8px; }
    .rounded-full { border-radius: 9999px; }
    .bg-teal-600 { background-color: #0d9488 !important; }
  </style>
</head>
<body>
  ${clone.outerHTML}
</body>
</html>
`);
    doc.close();

    const doPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve(true);
      } catch (err) {
        console.error('Dedicated iframe print failed, falling back to window.print():', err);
        window.print();
        resolve(false);
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 1500);
      }
    };

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(() => setTimeout(doPrint, 200));
    } else {
      setTimeout(doPrint, 300);
    }
  });
}
