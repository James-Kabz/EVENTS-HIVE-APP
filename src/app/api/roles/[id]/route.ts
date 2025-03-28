import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth/auth"
import { checkPermission } from "@/lib/auth/permissions"

const prisma = new PrismaClient()

// Get a specific role by ID
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const hasViewPermission = await checkPermission("roles:read")

    if (!hasViewPermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: "Invalid role ID" }, { status: 400 });
    }
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
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions).catch();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hasUpdatePermission = await checkPermission("roles:update");
    if (!hasUpdatePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: "Invalid role ID" }, { status: 400 });
    }

    const { name, description, permissions } = await request.json();
    if (!name) {
      return NextResponse.json({ message: "Role name is required" }, { status: 400 });
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json({ message: "At least one permission is required" }, { status: 400 });
    }

    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    const duplicateRole = await prisma.role.findFirst({
      where: { name, id: { not: id } },
    });

    if (duplicateRole) {
      return NextResponse.json({ message: "A role with this name already exists" }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.role.update({ where: { id }, data: { name, description } });

      for (const permissionId of permissions) {
        await tx.rolePermission.create({ data: { roleId: id, permissionId } });
      }
    });

    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });

    return NextResponse.json({ message: "Role updated successfully", role: updatedRole });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions).catch();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const hasDeletePermission = await checkPermission("roles:delete");
    if (!hasDeletePermission) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ message: "Invalid role ID" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      return NextResponse.json({ message: "Role not found" }, { status: 404 });
    }

    if (role.name === "admin") {
      return NextResponse.json({ message: "Cannot delete the admin role" }, { status: 403 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({ where: { roleId: id }, data: { roleId: null } });
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.role.delete({ where: { id } });
    });

    return NextResponse.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
