import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/auth";
import { checkPermission } from "@/lib/auth/permissions";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!(await checkPermission("attendees:read"))) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();
    if (!id) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        roleId: true,
        createdAt: true,
        role: { select: { id: true, name: true } },
      },
    });

    return user
      ? NextResponse.json(user)
      : NextResponse.json({ message: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!(await checkPermission("attendees:update"))) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();
    if (!id) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    const { name, email, roleId } = await request.json();
    if (!name || !email) return NextResponse.json({ message: "Name and email are required" }, { status: 400 });

    const existingUser = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!existingUser) return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (id === session.user.id && existingUser.role?.name === "admin" && roleId !== existingUser.roleId) {
      return NextResponse.json({ message: "Admins cannot change their own role" }, { status: 403 });
    }

    const duplicateEmail = await prisma.user.findFirst({
      where: { email, id: { not: id } },
    });
    if (duplicateEmail) return NextResponse.json({ message: "Email is already in use" }, { status: 409 });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, roleId: roleId || null },
      include: { role: true },
    });

    return NextResponse.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!(await checkPermission("users:delete"))) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();
    if (!id) return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });

    if (id === session.user.id) {
      return NextResponse.json({ message: "You cannot delete your own account" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.session.deleteMany({ where: { userId: id } }),
      prisma.account.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
