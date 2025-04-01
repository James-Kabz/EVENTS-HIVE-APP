import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { generateTicketPDF } from "@/lib/ticket-generator/ticket-generator"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: { ticketId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { ticketId } = params

    // Fetch the ticket with related data
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            event: true,
          },
        },
        ticketType: true,
      },
    })

    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 })
    }

    // Check if user is authorized to access this ticket
    const isOwner = ticket.booking.userId === session.user.id
    const isAdmin = await prisma.user.findFirst({
      where: {
        id: session.user.id,
        role: {
          name: "admin",
        },
      },
    })

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "You don't have permission to access this ticket" }, { status: 403 })
    }

    // Generate PDF ticket
    const pdfBuffer = await generateTicketPDF({
      bookingId: ticket.booking.id,
      eventName: ticket.booking.event.name,
      eventDate: new Date(ticket.booking.event.startDate),
      eventLocation: ticket.booking.event.location,
      attendeeName: ticket.booking.name,
      ticketType: ticket.ticketType.name,
      ticketNumber: ticket.ticketNumber,
    })

    // Set response headers for PDF download
    const headers = new Headers()
    headers.set("Content-Type", "application/pdf")
    headers.set("Content-Disposition", `attachment; filename="ticket-${ticket.ticketNumber}.pdf"`)

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error downloading ticket:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

