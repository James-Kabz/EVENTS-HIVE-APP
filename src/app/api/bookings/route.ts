import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

interface TicketItem {
  ticketTypeId: string;
  quantity: number;
  price: number;
  name: string;
}

// Get all bookings for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
          },
        },
        tickets: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Create a new booking
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.eventId || !data.name || !data.email || !data.phone || !data.tickets || data.tickets.length === 0) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: {
        id: data.eventId,
        isPublished: true,
      },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found or not published" }, { status: 404 })
    }

    // Validate ticket types and check availability
    let totalAmount = 0
    
    const ticketItems: TicketItem[] = []

    for (const ticketItem of data.tickets) {
      const { ticketTypeId, quantity } = ticketItem

      if (!ticketTypeId || !quantity || quantity < 1) {
        return NextResponse.json(
          {
            message: "Invalid ticket information",
          },
          { status: 400 },
        )
      }

      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
      })

      if (!ticketType) {
        return NextResponse.json(
          {
            message: `Ticket type not found: ${ticketTypeId}`,
          },
          { status: 404 },
        )
      }

      if (ticketType.remaining < quantity) {
        return NextResponse.json(
          {
            message: `Not enough tickets available for: ${ticketType.name}`,
          },
          { status: 400 },
        )
      }

      totalAmount += ticketType.price * quantity
      ticketItems.push({
        ticketTypeId,
        quantity,
        price: ticketType.price,
        name: ticketType.name,
      })
    }

    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Create the booking with a transaction to ensure consistency
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Create the booking
      const newBooking = await tx.booking.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          totalAmount,
          status: "PENDING", // Will be updated after payment
          userId,
          eventId: data.eventId,
        },
      })

      // 2. Create tickets for the booking
      for (const item of ticketItems) {
        for (let i = 0; i < item.quantity; i++) {
          await tx.ticket.create({
            data: {
              ticketNumber: `TKT-${nanoid(8)}`,
              bookingId: newBooking.id,
              ticketTypeId: item.ticketTypeId,
            },
          })
        }

        // 3. Update remaining tickets for each ticket type
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: {
            remaining: {
              decrement: item.quantity,
            },
          },
        })
      }

      return newBooking
    })

    // In a real app, you would initiate payment here
    // For demo purposes, we'll simulate a successful payment
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CONFIRMED",
        paymentId: `PAY-${nanoid(10)}`,
      },
      include: {
        tickets: {
          include: {
            ticketType: true,
          },
        },
        event: {
          select: {
            name: true,
            startDate: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: updatedBooking,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

