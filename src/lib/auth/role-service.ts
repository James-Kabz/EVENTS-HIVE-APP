
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getRoleById(id: string) {
  try {
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

    return role
  } catch (error) {
    console.error("Error fetching role:", error)
    return null
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

