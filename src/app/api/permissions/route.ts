import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get all permissions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasViewPermission = await checkPermission("roles:read")

    if (!hasViewPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const permissions = await prisma.permission.findMany({
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Create a new permission
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasCreatePermission = await checkPermission("roles:create")

    if (!hasCreatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { name, description } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json({ message: "Permission name is required" }, { status: 400 })
    }

    // Validate format (category:action)
    if (!/^[a-z]+:[a-z]+$/.test(name)) {
      return NextResponse.json(
        {
          message: "Permission name must be in format 'category:action' (e.g., users:read)",
        },
        { status: 400 },
      )
    }

    // Check if permission with the same name already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
    })

    if (existingPermission) {
      return NextResponse.json({ message: "A permission with this name already exists" }, { status: 409 })
    }

    // Create the permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(
      {
        message: "Permission created successfully",
        permission,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating permission:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

