import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './format-currency';
import { formatDate } from './date-utils';

/**
 * PDF dışa aktarım için temel konfigürasyon
 */
const DEFAULT_PDF_OPTIONS = {
  orientation: 'portrait' as const,
  unit: 'mm' as const,
  format: 'a4' as const,
  compress: true,
};

/**
 * PDF belgesinin temel bilgilerini ayarlar ve döndürür
 */
function initializePdf(title: string, companyInfo: any = {}) {
  const pdf = new jsPDF(DEFAULT_PDF_OPTIONS);
  
  // Font ve dil ayarları
  pdf.setLanguage('tr');
  pdf.setFont('helvetica');

  // Başlık
  pdf.setFontSize(18);
  pdf.text(title, 14, 20);
  
  // Çizgi
  pdf.setLineWidth(0.5);
  pdf.line(14, 25, 196, 25);
  
  // Şirket bilgileri
  if (companyInfo) {
    pdf.setFontSize(10);
    let yOffset = 35;
    
    if (companyInfo.companyName) {
      pdf.text(`Şirket: ${companyInfo.companyName}`, 14, yOffset);
      yOffset += 5;
    }
    
    if (companyInfo.taxId) {
      pdf.text(`Vergi No: ${companyInfo.taxId}`, 14, yOffset);
      yOffset += 5;
    }
    
    if (companyInfo.address) {
      pdf.text(`Adres: ${companyInfo.address}`, 14, yOffset);
      yOffset += 5;
    }
    
    // Oluşturma tarihi
    pdf.text(`Oluşturma Tarihi: ${formatDate(new Date())}`, 14, yOffset);
  }
  
  return pdf;
}

/**
 * Finans raporu PDF'i oluşturur
 */
export function generateFinancialReportPdf(reportData: any, periodName: string, companyInfo: any = {}) {
  const pdf = initializePdf(`Finansal Rapor - ${periodName}`, companyInfo);
  
  // Özet Verileri
  pdf.setFontSize(12);
  pdf.text('Finansal Özet', 14, 60);
  
  autoTable(pdf, {
    startY: 65,
    head: [['Açıklama', 'Tutar']],
    body: [
      ['Toplam Gelir', formatCurrency(reportData.summary.totalIncome)],
      ['Toplam Gider', formatCurrency(reportData.summary.totalExpense)],
      ['Net Kar/Zarar', formatCurrency(reportData.summary.netIncome)]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10
    },
    columnStyles: {
      1: { halign: 'right' }
    }
  });
  
  // Aylık Veriler Tablosu
  const startY = pdf.lastAutoTable?.finalY || 100;
  
  if (reportData.monthlyData && reportData.monthlyData.length > 0) {
    pdf.setFontSize(12);
    pdf.text('Aylık Gelir/Gider Verileri', 14, startY + 10);
    
    const tableData = reportData.monthlyData.map((item: any) => [
      item.date.substring(0, 7),
      formatCurrency(item.income),
      formatCurrency(item.expense),
      formatCurrency(item.netIncome)
    ]);
    
    autoTable(pdf, {
      startY: startY + 15,
      head: [['Dönem', 'Gelir', 'Gider', 'Net Kar/Zarar']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' }
      }
    });
  }
  
  // Kategori Bazlı Veriler
  if (reportData.incomeByCategory && reportData.incomeByCategory.length > 0) {
    const startY = pdf.lastAutoTable?.finalY || 160;
    
    pdf.setFontSize(12);
    pdf.text('Gelir Kategorileri', 14, startY + 10);
    
    const tableData = reportData.incomeByCategory.map((item: any) => [
      item.category,
      formatCurrency(item.amount)
    ]);
    
    autoTable(pdf, {
      startY: startY + 15,
      head: [['Kategori', 'Toplam Tutar']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [92, 184, 92],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
  }
  
  if (reportData.expenseByCategory && reportData.expenseByCategory.length > 0) {
    const startY = pdf.lastAutoTable?.finalY || 200;
    
    pdf.setFontSize(12);
    pdf.text('Gider Kategorileri', 14, startY + 10);
    
    const tableData = reportData.expenseByCategory.map((item: any) => [
      item.category,
      formatCurrency(item.amount)
    ]);
    
    autoTable(pdf, {
      startY: startY + 15,
      head: [['Kategori', 'Toplam Tutar']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [217, 83, 79],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
  }
  
  // Sayfa numarası ekleme
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Sayfa ${i} / ${pageCount}`, 195, 285, { align: 'right' });
  }
  
  return pdf;
}

/**
 * Bilanço raporu PDF'i oluşturur
 */
export function generateBalanceSheetPdf(balanceSheetData: any, periodName: string, companyInfo: any = {}) {
  const pdf = initializePdf(`Bilanço - ${periodName}`, companyInfo);
  
  // Özet Verileri
  pdf.setFontSize(12);
  pdf.text('Finansal Durum Özeti', 14, 60);
  
  autoTable(pdf, {
    startY: 65,
    head: [['Açıklama', 'Tutar']],
    body: [
      ['Toplam Varlıklar', formatCurrency(balanceSheetData.assetTotal)],
      ['Toplam Yükümlülükler', formatCurrency(balanceSheetData.liabilityTotal)],
      ['Toplam Özkaynaklar', formatCurrency(balanceSheetData.equityTotal)]
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10
    },
    columnStyles: {
      1: { halign: 'right' }
    }
  });
  
  // Varlıklar Tablosu
  const startY = pdf.lastAutoTable?.finalY || 100;
  
  if (balanceSheetData.assets && balanceSheetData.assets.length > 0) {
    pdf.setFontSize(12);
    pdf.text('Varlıklar', 14, startY + 10);
    
    // Dönen Varlıklar
    const currentAssets = balanceSheetData.assets.filter((asset: any) => asset.type === 'current');
    const currentAssetsTotal = currentAssets.reduce((total: number, asset: any) => total + asset.amount, 0);
    
    // Duran Varlıklar
    const nonCurrentAssets = balanceSheetData.assets.filter((asset: any) => asset.type === 'non-current');
    const nonCurrentAssetsTotal = nonCurrentAssets.reduce((total: number, asset: any) => total + asset.amount, 0);
    
    // Varlıklar tablosu verileri
    const assetsTableData = [
      ['Dönen Varlıklar', formatCurrency(currentAssetsTotal)]
    ];
    
    // Dönen varlık detayları
    currentAssets.forEach((asset: any) => {
      assetsTableData.push([`  ${asset.name}`, formatCurrency(asset.amount)]);
    });
    
    // Duran varlıklar toplamı
    assetsTableData.push(['Duran Varlıklar', formatCurrency(nonCurrentAssetsTotal)]);
    
    // Duran varlık detayları
    nonCurrentAssets.forEach((asset: any) => {
      assetsTableData.push([`  ${asset.name}`, formatCurrency(asset.amount)]);
    });
    
    // Toplam varlıklar
    assetsTableData.push(['TOPLAM VARLIKLAR', formatCurrency(balanceSheetData.assetTotal)]);
    
    autoTable(pdf, {
      startY: startY + 15,
      head: [['Hesap', 'Tutar']],
      body: assetsTableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [92, 184, 92],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
  }
  
  // Kaynaklar Tablosu
  if (balanceSheetData.liabilities && balanceSheetData.liabilities.length > 0) {
    const startY = pdf.lastAutoTable?.finalY || 160;
    
    pdf.setFontSize(12);
    pdf.text('Kaynaklar', 14, startY + 10);
    
    // Kısa Vadeli Yükümlülükler
    const currentLiabilities = balanceSheetData.liabilities.filter((liability: any) => liability.type === 'current');
    const currentLiabilitiesTotal = currentLiabilities.reduce((total: number, liability: any) => total + liability.amount, 0);
    
    // Uzun Vadeli Yükümlülükler
    const nonCurrentLiabilities = balanceSheetData.liabilities.filter((liability: any) => liability.type === 'non-current');
    const nonCurrentLiabilitiesTotal = nonCurrentLiabilities.reduce((total: number, liability: any) => total + liability.amount, 0);
    
    // Özkaynaklar
    const equityTotal = balanceSheetData.equityTotal;
    
    // Kaynaklar tablosu verileri
    const liabilitiesTableData = [
      ['Kısa Vadeli Yükümlülükler', formatCurrency(currentLiabilitiesTotal)]
    ];
    
    // Kısa vadeli yükümlülük detayları
    currentLiabilities.forEach((liability: any) => {
      liabilitiesTableData.push([`  ${liability.name}`, formatCurrency(liability.amount)]);
    });
    
    // Uzun vadeli yükümlülükler toplamı
    liabilitiesTableData.push(['Uzun Vadeli Yükümlülükler', formatCurrency(nonCurrentLiabilitiesTotal)]);
    
    // Uzun vadeli yükümlülük detayları
    nonCurrentLiabilities.forEach((liability: any) => {
      liabilitiesTableData.push([`  ${liability.name}`, formatCurrency(liability.amount)]);
    });
    
    // Özkaynaklar toplamı
    liabilitiesTableData.push(['Özkaynaklar', formatCurrency(equityTotal)]);
    
    // Özkaynaklar detayları
    balanceSheetData.equity.forEach((equity: any) => {
      liabilitiesTableData.push([`  ${equity.name}`, formatCurrency(equity.amount)]);
    });
    
    // Toplam kaynaklar
    liabilitiesTableData.push(['TOPLAM KAYNAKLAR', formatCurrency(balanceSheetData.liabilityTotal + balanceSheetData.equityTotal)]);
    
    autoTable(pdf, {
      startY: startY + 15,
      head: [['Hesap', 'Tutar']],
      body: liabilitiesTableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        1: { halign: 'right' }
      }
    });
  }
  
  // Sayfa numarası ekleme
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Sayfa ${i} / ${pageCount}`, 195, 285, { align: 'right' });
  }
  
  return pdf;
}

/**
 * Fatura PDF'i oluşturur
 */
export function generateInvoicePdf(invoiceData: any, invoiceItems: any[], customerData: any = {}, companyInfo: any = {}) {
  const pdf = new jsPDF(DEFAULT_PDF_OPTIONS);
  
  // Font ve dil ayarları
  pdf.setLanguage('tr');
  pdf.setFont('helvetica');

  // Başlık
  pdf.setFontSize(18);
  pdf.text('FATURA', 14, 20);
  
  // Fatura Numarası
  pdf.setFontSize(12);
  pdf.text(`Fatura No: ${invoiceData.invoiceNumber}`, 14, 30);
  
  // Fatura Tarihi
  pdf.text(`Tarih: ${formatDate(invoiceData.date)}`, 14, 35);
  
  // Vade Tarihi
  pdf.text(`Vade Tarihi: ${formatDate(invoiceData.dueDate)}`, 14, 40);
  
  // Durum
  let statusText = 'Durum: ';
  let statusColor = [0, 0, 0]; // Siyah
  
  switch (invoiceData.status) {
    case 'paid':
      statusText += 'Ödendi';
      statusColor = [92, 184, 92]; // Yeşil
      break;
    case 'pending':
      statusText += 'Beklemede';
      statusColor = [240, 173, 78]; // Turuncu
      break;
    case 'overdue':
      statusText += 'Gecikmiş';
      statusColor = [217, 83, 79]; // Kırmızı
      break;
    default:
      statusText += invoiceData.status;
  }
  
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(statusText, 14, 45);
  pdf.setTextColor(0, 0, 0); // Rengi siyaha geri al
  
  // Çizgi
  pdf.setLineWidth(0.5);
  pdf.line(14, 50, 196, 50);
  
  // Şirket bilgileri
  if (companyInfo) {
    pdf.setFontSize(10);
    pdf.text('Satıcı:', 14, 60);
    
    let yOffset = 65;
    
    if (companyInfo.companyName) {
      pdf.text(companyInfo.companyName, 14, yOffset);
      yOffset += 5;
    }
    
    if (companyInfo.taxId) {
      pdf.text(`Vergi No: ${companyInfo.taxId}`, 14, yOffset);
      yOffset += 5;
    }
    
    if (companyInfo.address) {
      pdf.text(companyInfo.address, 14, yOffset);
      yOffset += 5;
    }
    
    if (companyInfo.phone) {
      pdf.text(`Tel: ${companyInfo.phone}`, 14, yOffset);
      yOffset += 5;
    }
    
    if (companyInfo.email) {
      pdf.text(`E-posta: ${companyInfo.email}`, 14, yOffset);
    }
  }
  
  // Müşteri bilgileri
  if (customerData) {
    pdf.setFontSize(10);
    pdf.text('Müşteri:', 120, 60);
    
    let yOffset = 65;
    
    if (customerData.name) {
      pdf.text(customerData.name, 120, yOffset);
      yOffset += 5;
    }
    
    if (customerData.taxId) {
      pdf.text(`Vergi No: ${customerData.taxId}`, 120, yOffset);
      yOffset += 5;
    }
    
    if (customerData.address) {
      pdf.text(customerData.address, 120, yOffset);
      yOffset += 5;
    }
    
    if (customerData.phone) {
      pdf.text(`Tel: ${customerData.phone}`, 120, yOffset);
      yOffset += 5;
    }
    
    if (customerData.email) {
      pdf.text(`E-posta: ${customerData.email}`, 120, yOffset);
    }
  }
  
  // Fatura kalemleri tablosu
  if (invoiceItems && invoiceItems.length > 0) {
    const tableData = invoiceItems.map(item => [
      item.description,
      item.quantity.toString(),
      item.unitPrice.toFixed(2),
      (item.taxRate || 0).toFixed(2) + '%',
      item.totalPrice.toFixed(2)
    ]);
    
    autoTable(pdf, {
      startY: 100,
      head: [['Açıklama', 'Miktar', 'Birim Fiyat', 'KDV', 'Tutar']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });
  }
  
  // Fatura toplamları
  const startY = pdf.lastAutoTable?.finalY || 200;
  
  autoTable(pdf, {
    startY: startY + 10,
    body: [
      ['Ara Toplam', formatCurrency(invoiceData.totalAmount - invoiceData.taxAmount)],
      ['KDV', formatCurrency(invoiceData.taxAmount)],
      ['GENEL TOPLAM', formatCurrency(invoiceData.totalAmount)]
    ],
    theme: 'plain',
    styles: {
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 150, halign: 'right', fontStyle: 'bold' },
      1: { cellWidth: 'auto', halign: 'right' }
    }
  });
  
  // Açıklamalar
  if (invoiceData.notes) {
    const startY = pdf.lastAutoTable?.finalY || 230;
    
    pdf.setFontSize(10);
    pdf.text('Açıklamalar:', 14, startY + 10);
    pdf.setFontSize(9);
    pdf.text(invoiceData.notes, 14, startY + 15);
  }
  
  // Alt bilgi
  const startY2 = pdf.lastAutoTable?.finalY || 250;
  
  pdf.setFontSize(9);
  pdf.text('Ödeme Bilgileri:', 14, startY2 + 20);
  
  if (companyInfo.bankName && companyInfo.iban) {
    pdf.text(`Banka: ${companyInfo.bankName}`, 14, startY2 + 25);
    pdf.text(`IBAN: ${companyInfo.iban}`, 14, startY2 + 30);
  }
  
  // Sayfa numarası ekleme
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Sayfa ${i} / ${pageCount}`, 195, 285, { align: 'right' });
  }
  
  return pdf;
}

/**
 * Ödeme planı PDF'i oluşturur
 */
export function generatePaymentSchedulePdf(paymentSchedules: any[], periodName: string, companyInfo: any = {}) {
  const pdf = initializePdf(`Ödeme Planı - ${periodName}`, companyInfo);
  
  // Ödeme planı tablosu
  if (paymentSchedules && paymentSchedules.length > 0) {
    pdf.setFontSize(12);
    pdf.text('Ödeme Planı', 14, 60);
    
    const tableData = paymentSchedules.map(payment => [
      formatDate(payment.dueDate),
      payment.description,
      payment.category || '',
      payment.isPaid ? 'Ödendi' : 'Beklemede',
      formatCurrency(payment.amount)
    ]);
    
    // Tarih sırasına göre sırala
    tableData.sort((a, b) => {
      const dateA = new Date(a[0]).getTime();
      const dateB = new Date(b[0]).getTime();
      return dateA - dateB;
    });
    
    autoTable(pdf, {
      startY: 65,
      head: [['Tarih', 'Açıklama', 'Kategori', 'Durum', 'Tutar']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10
      },
      columnStyles: {
        0: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' }
      }
    });
    
    // Özet tablosu
    const startY = pdf.lastAutoTable?.finalY || 200;
    
    // Ödenmiş ve bekleyen ödemeleri hesapla
    const paidPayments = paymentSchedules.filter(p => p.isPaid);
    const pendingPayments = paymentSchedules.filter(p => !p.isPaid);
    
    const paidTotal = paidPayments.reduce((total, p) => total + p.amount, 0);
    const pendingTotal = pendingPayments.reduce((total, p) => total + p.amount, 0);
    const totalAmount = paidTotal + pendingTotal;
    
    autoTable(pdf, {
      startY: startY + 10,
      body: [
        ['Ödenen Toplam', formatCurrency(paidTotal)],
        ['Bekleyen Toplam', formatCurrency(pendingTotal)],
        ['GENEL TOPLAM', formatCurrency(totalAmount)]
      ],
      theme: 'plain',
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 150, halign: 'right', fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'right' }
      }
    });
  }
  
  // Sayfa numarası ekleme
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.text(`Sayfa ${i} / ${pageCount}`, 195, 285, { align: 'right' });
  }
  
  return pdf;
}

/**
 * Genel PDF dosyasını indir fonksiyonu
 */
export function downloadPdf(pdf: jsPDF, filename: string) {
  pdf.save(filename);
}