import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const ticketId = pathname.split("/").pop();

    if (!ticketId) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }


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

    return NextResponse.json(ticket)
  } catch (error) {
    console.error("Error fetching ticket:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

