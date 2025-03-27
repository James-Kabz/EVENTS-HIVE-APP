import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role?.name,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Only proceed for Google sign-ins
      if (account?.provider === "google") {
        try {
          // Check if the user already exists in the database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
            include: { role: true },
          })

          // If the user exists but doesn't have a role, assign the guest role
          if (existingUser && !existingUser.roleId) {
            // Find the guest role
            const guestRole = await prisma.role.findUnique({
              where: { name: "guest" },
            })

            // If guest role doesn't exist, try to create it
            const roleId = guestRole?.id || (await createGuestRole())

            if (roleId) {
              // Update the user with the guest role
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { roleId },
              })
            }
          }
        } catch (error) {
          console.error("Error assigning guest role:", error)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }

      // If no role is assigned yet, check the database for updates
      if (!token.role && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: { role: true },
          })

          if (dbUser?.role) {
            token.role = dbUser.role.name
          }
        } catch (error) {
          console.error("Error fetching user role for token:", error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to create a guest role if it doesn't exist
async function createGuestRole() {
  try {
    // Check if guest role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name: "guest" },
    })

    if (existingRole) {
      return existingRole.id
    }

    // Create the guest role with basic permissions
    const guestRole = await prisma.role.create({
      data: {
        name: "guest",
        description: "Default role for new users with limited access",
      },
    })

    // Assign basic permissions to the guest role
    const basicPermissions = ["dashboard:access"]

    for (const permissionName of basicPermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      })

      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: guestRole.id,
            permissionId: permission.id,
          },
        })
      }
    }

    return guestRole.id
  } catch (error) {
    console.error("Error creating guest role:", error)
    return null
  }
}

