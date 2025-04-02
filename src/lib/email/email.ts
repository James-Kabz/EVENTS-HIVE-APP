import { Resend } from "resend"
import QRCode from "qrcode"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailProps {
  to: string
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export async function sendEmail({ to, subject, html, text, attachments }: SendEmailProps) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error("Email configuration is missing")
    throw new Error("Email configuration is missing")
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      attachments,
    })

    if (error) {
      console.error("Error sending email:", error)
      throw new Error(`Error sending email: ${error.message}`)
    }

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Failed to send email:", error)
    throw error
  }
}

// Generate QR code as data URL
export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
      type: "image/png"
    })
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw error
  }
}

// Generate QR code as Buffer
export async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(data, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300,
    })
  } catch (error) {
    console.error("Error generating QR code buffer:", error)
    throw error
  }
}

// Email templates
export function getPasswordResetEmailTemplate(userName: string, resetUrl: string) {
  return {
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hello ${userName || "there"},</p>
        <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>Thank you,<br>Events Hive Team</p>
      </div>
    `,
    text: `
      Reset Your Password
      
      Hello ${userName || "there"},
      
      We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
      
      To reset your password, visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      Thank you,
      Events Hive Team
    `,
  }
}

// Ticket confirmation email template
export function getTicketConfirmationEmailTemplate(
  userName: string,
  eventName: string,
  eventDate: string,
  eventLocation: string,
  ticketDetails: Array<{ name: string; quantity: number }>,
  qrCodeDataUrl: string,
  ticketUrl: string,
) {
  return {
    subject: `Your Tickets for ${eventName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Ticket Confirmation</h2>
        <p>Hello ${userName || "there"},</p>
        <p>Thank you for your booking! Your tickets for <strong>${eventName}</strong> have been confirmed.</p>
        
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Event Details</h3>
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          
          <h3>Ticket Details</h3>
          <ul>
            ${ticketDetails.map((ticket) => `<li>${ticket.quantity}x ${ticket.name}</li>`).join("")}
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p>Scan this QR code at the event entrance:</p>
          <img src="${qrCodeDataUrl}" alt="Ticket QR Code" style="max-width: 200px; height: auto;" />
          <p style="font-size: 12px; color: #666; margin-top: 5px;">
            (If the QR code is not visible, please view your tickets in the dashboard)
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${ticketUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Ticket</a>
        </div>
        
        <p>You can also view your booking details in your account dashboard.</p>
        <p>We look forward to seeing you at the event!</p>
        <p>Thank you,<br>Events Hive Team</p>
      </div>
    `,
    text: `
      Your Ticket Confirmation
      
      Hello ${userName || "there"},
      
      Thank you for your booking! Your tickets for ${eventName} have been confirmed.
      
      Event Details:
      Event: ${eventName}
      Date: ${eventDate}
      Location: ${eventLocation}
      
      Ticket Details:
      ${ticketDetails.map((ticket) => `- ${ticket.quantity}x ${ticket.name}`).join("\n")}
      
      Please download your ticket or save the QR code to present at the event entrance.
      
      Download your ticket here: ${ticketUrl}
      
      You can also view your booking details in your account dashboard.
      
      We look forward to seeing you at the event!
      
      Thank you,
      Events Hive Team
    `,
  }
}

