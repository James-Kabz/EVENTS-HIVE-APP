import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// Get published events for the public landing page
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit") as string) : 6

    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        startDate: {
          gte: new Date(), // Only future events
        },
      },
      include: {
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit,
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching public events:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

