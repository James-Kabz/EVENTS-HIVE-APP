import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

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

    // In a real application, you would send an email with the reset link
    // For this example, we'll just return the token
    // In production, you would use a service like SendGrid, Mailgun, etc.

    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`
    // await sendEmail({
    //   to: user.email,
    //   subject: "Reset your password",
    //   text: `Click the link to reset your password: ${resetUrl}`,
    // })

    return NextResponse.json(
      {
        message: "If an account with that email exists, we've sent a password reset link",
        // Only for development purposes, remove in production
        resetToken,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

