import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { sendEmail, getPasswordResetEmailTemplate } from "@/lib/email/email"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // We don't want to reveal if a user exists or not for security reasons
    // So we'll return a success response even if the user doesn't exist
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link" },
        { status: 200 },
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    // Get email template
    const { subject, html, text } = getPasswordResetEmailTemplate(user.name || "", resetUrl)

    // Send email
    await sendEmail({
      to: user.email || "",
      subject,
      html,
      text,
    })

    return NextResponse.json(
      {
        message: "If an account with that email exists, we've sent a password reset link",
        // Only for development purposes, remove in production
        ...(process.env.NODE_ENV === "development" && { resetToken, resetUrl }),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

