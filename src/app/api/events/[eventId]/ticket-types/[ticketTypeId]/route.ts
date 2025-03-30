import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get a specific ticket type
export async function GET(req: Request) {
  try {
    const { pathname } = new URL(req.url)
    const segments = pathname.split("/")
    const ticketTypeId = segments.pop()
    const eventId = segments[segments.length - 2]

    if (!ticketTypeId || !eventId) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: {
          select: {
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    })

    if (!ticketType) {
      return NextResponse.json({ message: "Ticket type not found" }, { status: 404 })
    }

    return NextResponse.json(ticketType)
  } catch (error) {
    console.error("Error fetching ticket type:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Update a ticket type
export async function PUT(req: Request) {
  try {
    const { pathname } = new URL(req.url)
    const segments = pathname.split("/")
    const ticketTypeId = segments.pop()
    const eventId = segments[segments.length - 2]

    if (!ticketTypeId || !eventId) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasUpdatePermission = await checkPermission("events:edit")

    if (!hasUpdatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const data = await req.json()

    // Check if ticket type exists
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: {
          select: {
            creatorId: true,
          },
        },
      },
    })

    if (!ticketType) {
      return NextResponse.json({ message: "Ticket type not found" }, { status: 404 })
    }

    // Check if user is the event creator or has admin permissions
    const isCreator = ticketType.event.creatorId === session.user.id
    const isAdmin = await checkPermission("admin:access")

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        {
          message: "You don't have permission to update this ticket type",
        },
        { status: 403 },
      )
    }

    // Calculate the difference in quantity to adjust remaining tickets
    const quantityDifference = data.quantity ? Number.parseInt(data.quantity) - ticketType.quantity : 0

    // Update the ticket type
    const updatedTicketType = await prisma.ticketType.update({
      where: { id: ticketTypeId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? Number.parseFloat(data.price) : undefined,
        quantity: data.quantity ? Number.parseInt(data.quantity) : undefined,
        remaining: {
          increment: quantityDifference,
        },
      },
    })

    return NextResponse.json({
      message: "Ticket type updated successfully",
      ticketType: updatedTicketType,
    })
  } catch (error) {
    console.error("Error updating ticket type:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Delete a ticket type
export async function DELETE(req: Request) {
  try {
    const { pathname } = new URL(req.url)
    const segments = pathname.split("/")
    const ticketTypeId = segments.pop()
    const eventId = segments[segments.length - 2]

    if (!ticketTypeId || !eventId) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasDeletePermission = await checkPermission("events:edit")

    if (!hasDeletePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Check if ticket type exists
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
      include: {
        event: {
          select: {
            creatorId: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    })

    if (!ticketType) {
      return NextResponse.json({ message: "Ticket type not found" }, { status: 404 })
    }

    // Check if user is the event creator or has admin permissions
    const isCreator = ticketType.event.creatorId === session.user.id
    const isAdmin = await checkPermission("admin:access")

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        {
          message: "You don't have permission to delete this ticket type",
        },
        { status: 403 },
      )
    }

    // Check if tickets of this type have been sold
    if (ticketType._count.tickets > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete ticket type with existing bookings",
        },
        { status: 400 },
      )
    }

    // Delete the ticket type
    await prisma.ticketType.delete({
      where: { id: ticketTypeId },
    })

    return NextResponse.json({ message: "Ticket type deleted successfully" })
  } catch (error) {
    console.error("Error deleting ticket type:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

