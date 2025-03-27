import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

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

    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json({ roles })
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// create role

// Create a new role
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

    const { name, description, permissions } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json({ message: "Role name is required" }, { status: 400 })
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json({ message: "At least one permission is required" }, { status: 400 })
    }

    // Check if role with the same name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    })

    if (existingRole) {
      return NextResponse.json({ message: "A role with this name already exists" }, { status: 409 })
    }

    // Create the role with permissions
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          create: permissions.map((permissionId: string) => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Role created successfully",
        role,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

