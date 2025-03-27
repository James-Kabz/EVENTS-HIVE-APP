import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getUserById(id: string) {
  try {
    // Ensure id is properly awaited if it's a promise
    const userId = await id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return users
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

