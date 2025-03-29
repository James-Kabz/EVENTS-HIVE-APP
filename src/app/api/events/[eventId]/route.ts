import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get a specific event by ID
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const { eventId } = params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        ticketTypes: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Update an event
export async function PUT(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasUpdatePermission = await checkPermission("events:edit")

    if (!hasUpdatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { eventId } = params
    const data = await request.json()

    // Check if event exists
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
      return NextResponse.json({ message: "You don't have permission to update this event" }, { status: 403 })
    }

    // Update the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        location: data.location,
        imageUrl: data.imageUrl,
        isPublished: data.isPublished,
      },
      include: {
        ticketTypes: true,
      },
    })

    return NextResponse.json({
      message: "Event updated successfully",
      event: updatedEvent,
    })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Delete an event
export async function DELETE(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasDeletePermission = await checkPermission("events:delete")

    if (!hasDeletePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { eventId } = params

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        creatorId: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 })
    }

    // Check if user is the creator or has admin permissions
    const isCreator = event.creatorId === session.user.id
    const isAdmin = await checkPermission("admin:access")

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ message: "You don't have permission to delete this event" }, { status: 403 })
    }

    // Check if event has bookings
    if (event._count.bookings > 0) {
      return NextResponse.json(
        {
          message: "Cannot delete event with existing bookings",
        },
        { status: 400 },
      )
    }

    // Delete the event and related ticket types
    await prisma.event.delete({
      where: { id: eventId },
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

