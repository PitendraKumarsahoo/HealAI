import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PredictionResponse, DiseaseInfo } from '../types';

export const generatePDF = (
  disease: DiseaseInfo,
  patientName: string,
  formData: Record<string, any>,
  result: PredictionResponse,
  date: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ======================
  // HEADER
  // ======================
  
  // Logo Background
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HealAI Diagnostic Report', 14, 20);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Advanced AI-Powered Medical Screening', 14, 28);

  // Report Info (Right aligned in header)
  doc.setFontSize(10);
  doc.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(`Date: ${new Date(date).toLocaleDateString()}`, pageWidth - 14, 24, { align: 'right' });
  doc.text(`Time: ${new Date(date).toLocaleTimeString()}`, pageWidth - 14, 30, { align: 'right' });

  let y = 55;

  // ======================
  // PATIENT & EXAM INFO
  // ======================
  
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', 14, y);
  
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Patient Name', 'Age', 'Assessment Type', 'Analysis Date']],
    body: [[patientName, formData.age || 'N/A', `${disease.title} Screening`, new Date(date).toLocaleString()]],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [240, 240, 240], textColor: 80, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 20 },
      2: { cellWidth: 60 },
      3: { cellWidth: 'auto' }
    }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ======================
  // CLINICAL METRICS
  // ======================
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Metrics', 14, y);
  
  y += 5;

  // Format form data for table
  const metricsData = disease.fields
    .filter(f => !f.hidden && formData[f.name] !== undefined)
    .map(f => [
      f.label, 
      `${formData[f.name]}`, 
      f.description || '-' // Using description as unit/ref if available, or just empty
    ]);

  autoTable(doc, {
    startY: y,
    head: [['Parameter', 'Value', 'Reference/Note']],
    body: metricsData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald header
    styles: { fontSize: 9, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 250, 248] }
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  // ======================
  // ANALYSIS RESULT
  // ======================

  // Risk Level Box
  const riskColor = result.riskLevel === 'High' ? [220, 38, 38] : // Red
                   result.riskLevel === 'Moderate' ? [217, 119, 6] : // Orange
                   [16, 185, 129]; // Green

  doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setLineWidth(1);
  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  
  // Background for title
  doc.rect(14, y, pageWidth - 28, 10, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`AI ANALYSIS RESULT: ${result.riskLevel.toUpperCase()} RISK (${result.confidence}%)`, 20, y + 7);

  y += 10;
  
  // Content box
  doc.setDrawColor(200, 200, 200);
  doc.rect(14, y, pageWidth - 28, 25);
  
  doc.setTextColor(33, 33, 33);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const splitAnalysis = doc.splitTextToSize(result.analysis, pageWidth - 40);
  doc.text(splitAnalysis, 18, y + 7);
  
  y += 35;

  // ======================
  // SUGGESTIONS
  // ======================

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Suggestions', 14, y);
  y += 6;

  // Format suggestions for table
  // Suggestions are in format "Title: Description"
  const suggestionsData = result.suggestions.map(s => {
    const parts = s.split(': ');
    if (parts.length > 1) {
      return [parts[0], parts[1]];
    }
    return ['General', s];
  });

  autoTable(doc, {
    startY: y,
    head: [['Category', 'Recommendation']],
    body: suggestionsData,
    theme: 'grid',
    headStyles: { fillColor: [55, 65, 81], textColor: 255 }, // Dark gray
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
    didDrawPage: (data) => {
        // Footer
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('HealAI Professional Report - Generated via AI Models', 14, pageHeight - 10);
        doc.text(`Page ${data.pageNumber}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    }
  });

  // Disclaimer (if space permits on last page, or new page)
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  if (finalY > doc.internal.pageSize.getHeight() - 30) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'italic');
  doc.text('DISCLAIMER: This report is generated by an artificial intelligence system for informational and educational purposes only. It does not constitute a medical diagnosis. Please consult a qualified healthcare professional for interpretation and further medical advice.', 14, finalY, { maxWidth: pageWidth - 28 });

  // Save
  const safeName = patientName.replace(/\s+/g, '_');
  const safeDisease = disease.title.replace(/\s+/g, '_');
  doc.save(`HealAI_Report_${safeName}_${safeDisease}_${Date.now()}.pdf`);
};
