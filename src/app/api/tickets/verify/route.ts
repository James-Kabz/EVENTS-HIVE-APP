import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to verify tickets
    const hasPermission = (await checkPermission("events:edit")) || (await checkPermission("admin:access"))

    if (!hasPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.ticketId && !data.ticketNumber) {
      return NextResponse.json({ message: "Ticket ID or ticket number is required" }, { status: 400 })
    }

    // Find the ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id: data.ticketId || "" }, { ticketNumber: data.ticketNumber || "" }],
      },
      include: {
        booking: {
          select: {
            status: true,
            name: true,
            email: true,
            event: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
                location: true,
              },
            },
          },
        },
        ticketType: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    })

    if (!ticket) {
      return NextResponse.json(
        {
          valid: false,
          message: "Ticket not found",
        },
        { status: 404 },
      )
    }

    // Check if booking is confirmed
    if (ticket.booking.status !== "CONFIRMED") {
      return NextResponse.json({
        valid: false,
        message: `Ticket is not valid. Booking status: ${ticket.booking.status}`,
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType.name,
          attendee: ticket.booking.name,
          event: ticket.booking.event.name,
          status: ticket.booking.status,
        },
      })
    }

    // Check if event date is valid (not in the past)
    const eventDate = new Date(ticket.booking.event.startDate)
    const now = new Date()

    if (eventDate < now) {
      return NextResponse.json({
        valid: false,
        message: "Event has already passed",
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType.name,
          attendee: ticket.booking.name,
          event: ticket.booking.event.name,
          eventDate: eventDate.toISOString(),
          status: ticket.booking.status,
        },
      })
    }

    // Check if ticket has already been used
    if (ticket.usedAt) {
      return NextResponse.json({
        valid: false,
        message: "Ticket has already been used",
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType.name,
          attendee: ticket.booking.name,
          event: ticket.booking.event.name,
          usedAt: ticket.usedAt.toISOString(),
          status: ticket.booking.status,
        },
      })
    }

    // If verification only, don't mark as used
    if (data.verifyOnly) {
      return NextResponse.json({
        valid: true,
        message: "Ticket is valid",
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          ticketType: ticket.ticketType.name,
          attendee: ticket.booking.name,
          event: ticket.booking.event.name,
          eventDate: eventDate.toISOString(),
          status: ticket.booking.status,
        },
      })
    }

    // Mark ticket as used
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { usedAt: new Date() },
    })

    return NextResponse.json({
      valid: true,
      message: "Ticket validated successfully",
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType.name,
        attendee: ticket.booking.name,
        event: ticket.booking.event.name,
        eventDate: eventDate.toISOString(),
        usedAt: updatedTicket.usedAt?.toISOString(),
        status: ticket.booking.status,
      },
    })
  } catch (error) {
    console.error("Error verifying ticket:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

