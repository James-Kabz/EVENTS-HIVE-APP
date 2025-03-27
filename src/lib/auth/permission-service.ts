import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getPermissionById(id: string) {
  try {
    // Ensure id is properly awaited if it's a promise
    const permissionId = await id

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

