import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get a specific role by ID
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

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error("Error fetching role:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Update a role
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

    const { name, description, permissions } = await request.json()

    // Validate input
    if (!name) {
      return NextResponse.json({ message: "Role name is required" }, { status: 400 })
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json({ message: "At least one permission is required" }, { status: 400 })
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 })
    }

    // Check if another role with the same name exists
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name,
        id: { not: id },
      },
    })

    if (duplicateRole) {
      return NextResponse.json({ message: "A role with this name already exists" }, { status: 409 })
    }

    // Update the role
    await prisma.$transaction(async (tx) => {
      // Delete existing role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      })

      // Update role details
      await tx.role.update({
        where: { id },
        data: {
          name,
          description,
        },
      })

      // Add new permissions
      for (const permissionId of permissions) {
        await tx.rolePermission.create({
          data: {
            roleId: id,
            permissionId,
          },
        })
      }
    })

    // Fetch the updated role
    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Role updated successfully",
      role: updatedRole,
    })
  } catch (error) {
    console.error("Error updating role:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

// Delete a role
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

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    })

    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 })
    }

    // Don't allow deleting the admin role
    if (role.name === "admin") {
      return NextResponse.json(
        {
          message: "Cannot delete the admin role",
        },
        { status: 403 },
      )
    }

    // Delete the role and its permissions
    await prisma.$transaction(async (tx) => {
      // First update any users with this role to have no role
      await tx.user.updateMany({
        where: { roleId: id },
        data: { roleId: null },
      })

      // Delete role permissions
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      })

      // Delete the role
      await tx.role.delete({
        where: { id },
      })
    })

    return NextResponse.json({ message: "Role deleted successfully" })
  } catch (error) {
    console.error("Error deleting role:", error)
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
  }
}

