const PDFDocument = require('pdfkit');

module.exports = function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prospectName = 'John Doe', position = 'Employee', hourlyRate = '0', benefits = '' } = req.body || {};

  // Tell the browser to download a PDF instead of rendering JSON
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Offer_${prospectName.replace(/\s+/g, '_')}.pdf`);

  // Create a new PDF document
  const doc = new PDFDocument({ margin: 50 });

  // Stream the document directly to the response object
  doc.pipe(res);

  // --- PDF Content Assembly ---
  doc.fontSize(24).font('Helvetica-Bold').text('BizTrack', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text('Business Management System', { align: 'center' });
  doc.moveDown(2);

  doc.fontSize(18).font('Helvetica-Bold').text('OFFER OF EMPLOYMENT', { underline: true });
  doc.moveDown();

  doc.fontSize(12).font('Helvetica').text(`Dear ${prospectName},`);
  doc.moveDown();
  doc.text(`We are pleased to offer you the position of ${position}. After reviewing your application and assessments, we are confident you will be a great addition to our team.`);
  doc.moveDown();

  doc.font('Helvetica-Bold').text('Employment Details:');
  doc.font('Helvetica').text(`• Position: ${position}`);
  doc.text(`• Hourly Rate: GHS ${hourlyRate}/hr`);
  if (benefits) {
    doc.text(`• Benefits: ${benefits}`);
  }
  doc.moveDown();

  doc.text('This offer is contingent upon your acceptance of our standard terms and conditions. Earnings are calculated dynamically via our time-tracking system.');
  doc.moveDown(2);

  doc.text('Sincerely,');
  doc.moveDown();
  doc.font('Helvetica-Bold').text('Management Team');
  doc.font('Helvetica').text('BizTrack System');

  // Finalize the PDF and trigger download
  doc.end();
};