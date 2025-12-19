import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  orientation?: 'portrait' | 'landscape';
}

interface DashboardData {
  stats?: any;
  borrowersOverTime?: any[];
  loanDisbursementOverTime?: any[];
  topCollectorsData?: any[];
  topCollectors?: any[];
  applicationsByType?: any[];
  topBorrowersData?: any[];
  topBorrowers?: any[];
  topAgentsData?: any[];
  topAgents?: any[];
}

/**
 * Generates a professional PDF export from dashboard data
 */
export async function exportDashboardToPDF(
  data: DashboardData,
  options: PDFExportOptions
): Promise<void> {
  const pdf = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header Section with Professional Styling
  const addHeader = () => {
    // Company branding background
    pdf.setFillColor(220, 38, 38); // Red color (Tailwind red-600)
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Company Name/Logo
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VLSystem', margin, 15);

    // Report Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(options.title, margin, 25);

    // Report Subtitle/Date
    pdf.setFontSize(10);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    pdf.text(options.subtitle || `Generated on ${dateStr}`, margin, 32);

    yPosition = 50;
  };

  addHeader();

  // Section Header Styling
  const addSectionHeader = (title: string) => {
    checkPageBreak(15);
    pdf.setFillColor(249, 250, 251); // Light gray background
    pdf.rect(margin, yPosition, contentWidth, 10, 'F');
    pdf.setTextColor(55, 65, 81); // Gray-700
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 3, yPosition + 7);
    yPosition += 15;
  };

  // Stat Card Styling
  const addStatCard = (label: string, value: string, x: number, y: number, width: number) => {
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(229, 231, 235); // Gray-200 border
    pdf.roundedRect(x, y, width, 20, 2, 2, 'FD');

    // Value
    pdf.setTextColor(17, 24, 39); // Gray-900
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    const valueWidth = pdf.getTextWidth(value);
    pdf.text(value, x + width / 2 - valueWidth / 2, y + 10);

    // Label
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const labelWidth = pdf.getTextWidth(label);
    pdf.text(label, x + width / 2 - labelWidth / 2, y + 16);
  };

  // Format currency helper
  const formatCurrency = (value: number) =>
    `PHP ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Quick Stats Section
  if (data.stats) {
    addSectionHeader('QUICK STATS');
    checkPageBreak(30);

    const cardWidth = (contentWidth - 10) / 3;
    addStatCard(
      'Total Borrowers',
      data.stats.totalBorrowers?.toString() || '0',
      margin,
      yPosition,
      cardWidth
    );
    addStatCard(
      'Total Disbursed',
      formatCurrency(data.stats.totalDisbursed || 0),
      margin + cardWidth + 5,
      yPosition,
      cardWidth
    );
    addStatCard(
      'Total Collected',
      formatCurrency(data.stats.totalCollected || 0),
      margin + 2 * (cardWidth + 5),
      yPosition,
      cardWidth
    );
    yPosition += 30;
  }

  // Borrowers Overview Section
  addSectionHeader('BORROWERS OVERVIEW');
  checkPageBreak(30);

  if (data.stats) {
    const cardWidth = (contentWidth - 5) / 2;
    addStatCard(
      'Total Borrowers',
      data.stats.totalBorrowers?.toString() || '0',
      margin,
      yPosition,
      cardWidth
    );
    addStatCard(
      'Active Borrowers',
      data.stats.activeBorrowers?.toString() || '0',
      margin + cardWidth + 5,
      yPosition,
      cardWidth
    );
    yPosition += 30;
  }

  // Top Borrowers Table
  const topBorrowersArray = data.topBorrowers || data.topBorrowersData || [];
  if (topBorrowersArray && topBorrowersArray.length > 0) {
    checkPageBreak(50);
    pdf.setTextColor(55, 65, 81);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Borrowers', margin, yPosition);
    yPosition += 7;

    // Table Header
    pdf.setFillColor(243, 244, 246); // Gray-100
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(9);
    pdf.text('Borrower Name', margin + 2, yPosition + 5);
    pdf.text('% Paid', margin + contentWidth - 30, yPosition + 5);
    yPosition += 8;

    // Table Rows
    pdf.setFont('helvetica', 'normal');
    topBorrowersArray.slice(0, 5).forEach((borrower: any, index: number) => {
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition, contentWidth, 7, 'F');
      }
      pdf.setTextColor(55, 65, 81);
      pdf.text(borrower.borrowerName || 'N/A', margin + 2, yPosition + 5);
      pdf.text(
        `${borrower.percentagePaid?.toFixed(2) || '0.00'}%`,
        margin + contentWidth - 30,
        yPosition + 5
      );
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Loan Overview Section
  addSectionHeader('LOAN OVERVIEW');
  checkPageBreak(30);

  if (data.stats) {
    const cardWidth = (contentWidth - 5) / 2;
    addStatCard(
      'Total Loans',
      data.stats.totalLoans?.toString() || '0',
      margin,
      yPosition,
      cardWidth
    );
    addStatCard(
      'Closed Loans',
      data.stats.closedLoans?.toString() || '0',
      margin + cardWidth + 5,
      yPosition,
      cardWidth
    );
    yPosition += 30;
  }

  // Top Agents Table
  const topAgentsArray = data.topAgents || data.topAgentsData || [];
  if (topAgentsArray && topAgentsArray.length > 0) {
    checkPageBreak(50);
    pdf.setTextColor(55, 65, 81);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Agents', margin, yPosition);
    yPosition += 7;

    // Table Header
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, yPosition, contentWidth, 8, 'F');
    pdf.setFontSize(9);
    pdf.text('Agent Name', margin + 2, yPosition + 5);
    pdf.text('Total Processed', margin + contentWidth - 45, yPosition + 5);
    yPosition += 8;

    // Table Rows
    pdf.setFont('helvetica', 'normal');
    topAgentsArray.slice(0, 5).forEach((agent: any, index: number) => {
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPosition, contentWidth, 7, 'F');
      }
      pdf.setTextColor(55, 65, 81);
      pdf.text(agent.name || 'N/A', margin + 2, yPosition + 5);
      pdf.text(
        formatCurrency(agent.totalProcessedLoans || 0),
        margin + contentWidth - 45,
        yPosition + 5
      );
      yPosition += 7;
    });
    yPosition += 10;
  }

  // Collection Overview Section
  addSectionHeader('COLLECTION OVERVIEW');
  checkPageBreak(30);

  if (data.stats) {
    const cardWidth = (contentWidth - 5) / 2;
    addStatCard(
      'Total Collected',
      formatCurrency(data.stats.totalCollected || 0),
      margin,
      yPosition,
      cardWidth
    );
    addStatCard(
      'Collectables',
      formatCurrency(data.stats.collectables || 0),
      margin + cardWidth + 5,
      yPosition,
      cardWidth
    );
    yPosition += 30;
  }

  // Top Collectors Progress Bars
  const topCollectorsArray = data.topCollectors || data.topCollectorsData || [];
  if (topCollectorsArray && topCollectorsArray.length > 0) {
    checkPageBreak(60);
    pdf.setTextColor(55, 65, 81);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Top Collectors', margin, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    topCollectorsArray.slice(0, 5).forEach((collector: any) => {
      checkPageBreak(15);
      const paid = Number(collector.paidCollections) || 0;
      const total = Number(collector.totalAssigned) || 1;
      const progressPercent = Math.min((paid / total) * 100, 100);

      // Collector name and count
      pdf.setTextColor(55, 65, 81);
      pdf.text(collector.name || 'N/A', margin, yPosition);
      pdf.text(
        `${paid} / ${total} (${progressPercent.toFixed(2)}%)`,
        margin + contentWidth - 50,
        yPosition
      );
      yPosition += 4;

      // Progress bar background
      pdf.setFillColor(229, 231, 235); // Gray-200
      pdf.roundedRect(margin, yPosition, contentWidth, 4, 1, 1, 'F');

      // Progress bar fill
      pdf.setFillColor(34, 197, 94); // Green-500
      const fillWidth = (contentWidth * progressPercent) / 100;
      pdf.roundedRect(margin, yPosition, fillWidth, 4, 1, 1, 'F');

      yPosition += 10;
    });
    yPosition += 5;
  }

  // Loan Applications Overview Section
  if (data.stats) {
    addSectionHeader('LOAN APPLICATIONS OVERVIEW');
    checkPageBreak(30);

    const cardWidth = (contentWidth - 10) / 4;
    addStatCard(
      'Total Applications',
      data.stats.totalApplications?.toString() || '0',
      margin,
      yPosition,
      cardWidth - 2
    );
    addStatCard(
      'Pending',
      data.stats.pendingApplications?.toString() || '0',
      margin + cardWidth + 3,
      yPosition,
      cardWidth - 2
    );
    addStatCard(
      'Approved',
      data.stats.approvedApplications?.toString() || '0',
      margin + 2 * (cardWidth + 3),
      yPosition,
      cardWidth - 2
    );
    addStatCard(
      'Denied',
      data.stats.deniedApplications?.toString() || '0',
      margin + 3 * (cardWidth + 3),
      yPosition,
      cardWidth - 2
    );
    yPosition += 30;
  }

  // Applications by Type
  if (data.applicationsByType && data.applicationsByType.length > 0) {
    checkPageBreak(40);
    pdf.setTextColor(55, 65, 81);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Applications by Type', margin, yPosition);
    yPosition += 7;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    data.applicationsByType.forEach((app: any) => {
      checkPageBreak(7);
      pdf.setFillColor(249, 250, 251);
      pdf.rect(margin, yPosition, contentWidth, 7, 'F');
      pdf.setTextColor(55, 65, 81);
      pdf.text(app.type || 'N/A', margin + 2, yPosition + 5);
      pdf.text(app.count?.toString() || '0', margin + contentWidth - 20, yPosition + 5);
      yPosition += 7;
    });
  }

  // Footer on every page
  const totalPages = (pdf as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'italic');
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2 - 10,
      pageHeight - 10
    );
    pdf.text(
      'VLSystem - Confidential',
      margin,
      pageHeight - 10
    );
  }

  // Save the PDF
  pdf.save(options.filename);
}
