import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "./auth"

const prisma = new PrismaClient()

export async function getUserPermissions(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    if (!user || !user.role) {
      return []
    }

    // Extract permission names from the role's permissions
    return user.role.permissions.map((rp) => rp.permission.name)
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return []
  }
}

export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions(userId)
    return permissions.includes(permissionName)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

export async function getCurrentUserPermissions() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return []
    }

    return getUserPermissions(session.user.id)
  } catch (error) {
    console.error("Error getting current user permissions:", error)
    return []
  }
}

export async function checkPermission(permissionName: string): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return false
    }

    return hasPermission(session.user.id, permissionName)
  } catch (error) {
    console.error("Error checking current user permission:", error)
    return false
  }
}

