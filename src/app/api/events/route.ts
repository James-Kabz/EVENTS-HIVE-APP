import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib//auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

interface TicketType {
  name: string;
  description: string;
  price: string;
  quantity: string;
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.id ? await checkPermission("admin:access") : false

    // Build the where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: any = {}

    // If published parameter is provided, use it
    if (published === "true") {
      where.isPublished = true
    } else if (published === "false") {
      // Only allow filtering for unpublished events if user is admin or has edit permission
      if (isAdmin || (session?.user?.id && (await checkPermission("events:edit")))) {
        where.isPublished = false
      } else {
        // Non-admin users should only see published events
        where.isPublished = true
      }
    } else {
      // If no published parameter, non-admin users should only see published events
      if (!isAdmin && (!session?.user?.id || !(await checkPermission("events:edit")))) {
        where.isPublished = true
      }
    }

    // If user is logged in, allow them to see their own unpublished events
    if (session?.user?.id && !isAdmin && !(await checkPermission("events:edit"))) {
      where = {
        OR: [{ isPublished: true }, { creatorId: session.user.id }],
      }
    }

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

