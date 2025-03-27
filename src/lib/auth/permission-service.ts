import { PrismaClient } from "@prisma/client"


const prisma = new PrismaClient()

export async function getPermissionById(id : string) {
  try {

    const permissionId = parseInt(id, 10);

    if (isNaN(permissionId)) {
      console.error("Invalid role ID:", id);
      return null; // Return null if ID is not a valid number
    }

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        _count: {
          select: {
            roles: true,
          },
        },
      },
    })

    return permission
  } catch (error) {
    console.error("Error fetching permission:", error)
    return null
  }
}

export async function getAllPermissions() {
  try {
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

    return permissions
  } catch (error) {
    console.error("Error fetching permissions:", error)
    return []
  }
}

