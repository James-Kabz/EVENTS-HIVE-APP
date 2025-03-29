import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

interface TicketType {
  name: string;
  description: string;
  price: string;
  quantity: string;
}

// Get all events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")

    // Filter options
    const where = published === "true" ? { isPublished: true } : published === "false" ? { isPublished: false } : {}

    const events = await prisma.event.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            remaining: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Create a new event
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasCreatePermission = await checkPermission("events:create")

    if (!hasCreatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.startDate || !data.endDate || !data.location) {
      return NextResponse.json(
        {
          message: "Missing required fields: name, startDate, endDate, location",
        },
        { status: 400 },
      )
    }

    // Create the event with ticket types
    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        location: data.location,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished || false,
        creatorId: session.user.id,
        ticketTypes: {
          create:
            data.ticketTypes?.map((ticketType: TicketType) => ({
              name: ticketType.name,
              description: ticketType.description,
              price: Number.parseFloat(ticketType.price),
              quantity: Number.parseInt(ticketType.quantity),
              remaining: Number.parseInt(ticketType.quantity),
            })) || [],
        },
      },
      include: {
        ticketTypes: true,
      },
    })

    return NextResponse.json(
      {
        message: "Event created successfully",
        event,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

