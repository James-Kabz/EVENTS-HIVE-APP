import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get all ticket types for an event
export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const eventId = pathname.split("/").pop();

    if (!eventId) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { price: "asc" },
    })

    return NextResponse.json({ ticketTypes })
  } catch (error) {
    console.error("Error fetching ticket types:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Create a new ticket type for an event
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasCreatePermission = await checkPermission("events:edit")

    if (!hasCreatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { pathname } = new URL(request.url);
    const eventId = pathname.split("/").pop();

    if (!eventId) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const data = await request.json()

    // Check if event exists and user is the creator
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    // Check if user is the creator or has admin permissions
    const isCreator = event.creatorId === session.user.id
    const isAdmin = await checkPermission("admin:access")

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        {
          message: "You don't have permission to add ticket types to this event",
        },
        { status: 403 },
      )
    }

    // Validate required fields
    if (!data.name || !data.price || !data.quantity) {
      return NextResponse.json(
        {
          message: "Missing required fields: name, price, quantity",
        },
        { status: 400 },
      )
    }

    // Create the ticket type
    const ticketType = await prisma.ticketType.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number.parseFloat(data.price),
        quantity: Number.parseInt(data.quantity),
        remaining: Number.parseInt(data.quantity),
        eventId,
      },
    })

    return NextResponse.json(
      {
        message: "Ticket type created successfully",
        ticketType,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating ticket type:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

