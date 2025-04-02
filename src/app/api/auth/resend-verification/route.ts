import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"
import { sendEmail } from "@/lib/email/email"
import { getEmailVerificationTemplate } from "@/lib/email/email-templates"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists for security
    if (!user) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a verification email" },
        { status: 200 },
      )
    }

    // Check if email is already verified
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email is already verified. You can log in." }, { status: 400 })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")

    // Check if token already exists (extremely unlikely but good practice)
    const tokenExists = await prisma.user.findFirst({
      where: { verificationToken },
      select: { id: true },
    })

    if (tokenExists) {
      // Generate a new token if collision occurs
      return NextResponse.json({ message: "Please try again" }, { status: 500 })
    }

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
      },
    })

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`

    // Get email template
    const { subject, html, text } = getEmailVerificationTemplate(user.name || "", verificationUrl)

    // Send verification email
    await sendEmail({
      to: user.email || "",
      subject,
      html,
      text,
    })

    return NextResponse.json(
      {
        message: "Verification email sent. Please check your inbox.",
        // Only for development purposes, remove in production
        ...(process.env.NODE_ENV === "development" && { verificationUrl }),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

