import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import { format } from "date-fns"

interface TicketData {
  bookingId: string
  eventName: string
  eventDate: Date
  eventLocation: string
  attendeeName: string
  ticketType: string
  ticketNumber: string
}

export async function generateTicketPDF(ticketData: TicketData): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size

  // Get the standard font
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Set page dimensions
  const { width, height } = page.getSize()
  const margin = 50

  // Generate QR code
  const qrCodeData = JSON.stringify({
    bookingId: ticketData.bookingId,
    ticketNumber: ticketData.ticketNumber,
    eventName: ticketData.eventName,
  })

  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 200,
  })

  // Remove the data URL prefix to get just the base64 data
  const qrCodeBase64 = qrCodeDataUrl.replace("data:image/png;base64,", "")
  const qrCodeImage = await pdfDoc.embedPng(Buffer.from(qrCodeBase64, "base64"))

  // Draw ticket border
  page.drawRectangle({
    x: margin,
    y: height - 350,
    width: width - 2 * margin,
    height: 300,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  })

  // Draw event name
  page.drawText("TICKET", {
    x: margin + 20,
    y: height - 80,
    size: 24,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText(ticketData.eventName, {
    x: margin + 20,
    y: height - 120,
    size: 18,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  })

  // Draw event details
  page.drawText(`Date: ${format(ticketData.eventDate, "MMMM d, yyyy - h:mm a")}`, {
    x: margin + 20,
    y: height - 150,
    size: 12,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText(`Location: ${ticketData.eventLocation}`, {
    x: margin + 20,
    y: height - 170,
    size: 12,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText(`Attendee: ${ticketData.attendeeName}`, {
    x: margin + 20,
    y: height - 190,
    size: 12,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText(`Ticket Type: ${ticketData.ticketType}`, {
    x: margin + 20,
    y: height - 210,
    size: 12,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText(`Ticket #: ${ticketData.ticketNumber}`, {
    x: margin + 20,
    y: height - 230,
    size: 12,
    font: helveticaFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  // Draw QR code
  const qrCodeDims = qrCodeImage.scale(0.8)
  page.drawImage(qrCodeImage, {
    x: width - margin - qrCodeDims.width - 20,
    y: height - 120 - qrCodeDims.height,
    width: qrCodeDims.width,
    height: qrCodeDims.height,
  })

  // Add footer
  page.drawText("This ticket is valid for one-time entry only. Please present this ticket at the event entrance.", {
    x: margin + 20,
    y: height - 320,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

