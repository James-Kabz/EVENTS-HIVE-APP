import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailProps {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailProps) {
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

