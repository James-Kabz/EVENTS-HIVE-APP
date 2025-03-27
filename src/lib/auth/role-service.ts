
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getRoleById(id: string) {
  try {
    const roleId = parseInt(id, 10); // Convert string ID to a number

    if (isNaN(roleId)) {
      console.error("Invalid role ID:", id);
      return null; // Return null if ID is not a valid number
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId }, // Use the converted number ID
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
    });

    return role;
  } catch (error) {
    console.error("Error fetching role:", error);
    return null;
  }
}

export async function getAllRoles() {
  try {
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

    return roles
  } catch (error) {
    console.error("Error fetching roles:", error)
    return []
  }
}

