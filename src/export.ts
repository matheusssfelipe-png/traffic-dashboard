import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Captures the specified HTML element and downloads it as a PDF.
 * @param elementId The ID of the container to capture
 * @param clients The client list (to generate the filename)
 */
export async function downloadReportAsPdf(elementId: string = 'dashboard-main') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found for PDF export:', elementId);
    return;
  }

  try {
    // Add a temporary class to optimize for printing
    element.classList.add('pdf-exporting');

    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      backgroundColor: '#0e0e0e', // Match LeadFlix dark theme bg
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    element.classList.remove('pdf-exporting');

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // If the content is longer than one page, it will just scale down to fit width, 
    // but might get cut off if it exceeds height. For a dashboard, scaling to fit width
    // is usually acceptable, but let's add multi-page support if needed:
    
    let position = 0;
    let heightLeft = pdfHeight;
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    const weekDate = new Date().toISOString().split('T')[0];
    pdf.save(`Matty_LeadFlix_Report_${weekDate}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    element.classList.remove('pdf-exporting');
  }
}
