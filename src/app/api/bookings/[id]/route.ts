import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get a specific booking
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check if user is the booking owner or has admin permissions
    const isOwner = booking.userId === session.user.id
    const isAdmin = await checkPermission("admin:access")
    const isEventCreator = booking.event.creator.id === session.user.id

    if (!isOwner && !isAdmin && !isEventCreator) {
      return NextResponse.json(
        {
          message: "You don't have permission to view this booking",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Cancel a booking
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }
    const { action } = await request.json()

    if (action !== "cancel") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    // Check if booking exists
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 })
    }

    // Check if user is the booking owner or has admin permissions
    const isOwner = booking.userId === session.user.id
    const isAdmin = await checkPermission("admin:access")

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          message: "You don't have permission to cancel this booking",
        },
        { status: 403 },
      )
    }

    // Check if booking is already cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json({ message: "Booking is already cancelled" }, { status: 400 })
    }

    // Cancel the booking and restore ticket availability
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updated = await tx.booking.update({
        where: { id },
        data: {
          status: "CANCELLED",
        },
      })

      // Restore ticket availability for each ticket type
      const ticketTypeCounts = booking.tickets.reduce((acc: Record<string, number>, ticket) => {
        const typeId = ticket.ticketType.id
        acc[typeId] = (acc[typeId] || 0) + 1
        return acc
      }, {})

      for (const [typeId, count] of Object.entries(ticketTypeCounts)) {
        await tx.ticketType.update({
          where: { id: typeId },
          data: {
            remaining: {
              increment: count,
            },
          },
        })
      }

      return updated
    })

    return NextResponse.json({
      message: "Booking cancelled successfully",
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

