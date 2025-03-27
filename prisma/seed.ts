import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create default permissions
  const permissions = [
    { name: "users:read", description: "Can view users" },
    { name: "users:create", description: "Can create users" },
    { name: "users:update", description: "Can update users" },
    { name: "users:delete", description: "Can delete users" },
    { name: "roles:read", description: "Can view roles" },
    { name: "roles:create", description: "Can create roles" },
    { name: "roles:update", description: "Can update roles" },
    { name: "roles:delete", description: "Can delete roles" },
    { name: "dashboard:access", description: "Can access dashboard" },
    { name: "settings:access", description: "Can access settings" },
    { name: "analytics:access", description: "Can access analytics" },
  ]

  // Create permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    })
  }

  console.log("Created default permissions")

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
    },
  })

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with limited access",
    },
  })

  const moderatorRole = await prisma.role.upsert({
    where: { name: "moderator" },
    update: {},
    create: {
      name: "moderator",
      description: "Moderator with elevated access",
    },
  })

  // Add the guest role to the seed file after the moderator role
  const guestRole = await prisma.role.upsert({
    where: { name: "guest" },
    update: {},
    create: {
      name: "guest",
      description: "Default role for new users with limited access",
    },
  })

  console.log("Created guest role")

  console.log("Created default roles")

  // Assign permissions to roles
  // Admin gets all permissions
  for (const permission of permissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permission.name },
    })

    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: permissionRecord.id,
        },
      })
    }
  }

  // User gets basic permissions
  const userPermissions = ["dashboard:access", "settings:access"]
  for (const permissionName of userPermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permissionName },
    })

    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: userRole.id,
          permissionId: permissionRecord.id,
        },
      })
    }
  }

  // Moderator gets elevated permissions
  const moderatorPermissions = ["dashboard:access", "settings:access", "analytics:access", "users:read", "roles:read"]
  for (const permissionName of moderatorPermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permissionName },
    })

    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: moderatorRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: moderatorRole.id,
          permissionId: permissionRecord.id,
        },
      })
    }
  }

  // Add basic permissions for guest role
  const guestPermissions = ["dashboard:access"]
  for (const permissionName of guestPermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permissionName },
    })

    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: guestRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: guestRole.id,
          permissionId: permissionRecord.id,
        },
      })
    }
  }

  console.log("Assigned permissions to roles")

  // Create a default admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Dev Admin",
      email: "dev@example.com",
      password: adminPassword,
      roleId: adminRole.id,
    },
  })

  console.log("Created default admin user")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

