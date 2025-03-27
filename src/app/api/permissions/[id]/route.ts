import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get a specific permission by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasViewPermission = await checkPermission("roles:read")

    if (!hasViewPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Await the params object before accessing its properties
    const { id } = await params

    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    })

    if (!permission) {
      return NextResponse.json({ message: "Permission not found" }, { status: 404 })
    }

    return NextResponse.json(permission)
  } catch (error) {
    console.error("Error fetching permission:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Update a permission
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasUpdatePermission = await checkPermission("roles:update")

    if (!hasUpdatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Await the params object before accessing its properties
    const { id } = await params

    const { name, description } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json({ message: "Permission name is required" }, { status: 400 })
    }

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      return NextResponse.json({ message: "Permission not found" }, { status: 404 })
    }

    // Check if another permission with the same name exists
    const duplicatePermission = await prisma.permission.findFirst({
      where: {
        name,
        id: { not: id },
      },
    })

    if (duplicatePermission) {
      return NextResponse.json({ message: "A permission with this name already exists" }, { status: 409 })
    }

    // Update the permission
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Permission updated successfully",
      permission: updatedPermission,
    })
  } catch (error) {
    console.error("Error updating permission:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Delete a permission
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasDeletePermission = await checkPermission("roles:delete")

    if (!hasDeletePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Await the params object before accessing its properties
    const { id } = await params

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    })

    if (!permission) {
      return NextResponse.json({ message: "Permission not found" }, { status: 404 })
    }

    // Don't allow deleting core permissions
    const corePermissions = ["dashboard:access", "users:read", "roles:read"]
    if (corePermissions.includes(permission.name)) {
      return NextResponse.json(
        {
          message: `Cannot delete the core permission "${permission.name}"`,
        },
        { status: 403 },
      )
    }

    // Delete the permission and its role associations
    await prisma.$transaction(async (tx) => {
      // Delete role permissions
      await tx.rolePermission.deleteMany({
        where: { permissionId: id },
      })

      // Delete the permission itself
      await tx.permission.delete({
        where: { id },
      })
    })

    return NextResponse.json({ message: "Permission deleted successfully" })
  } catch (error) {
    console.error("Error deleting permission:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

