import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create default permissions
  const permissions = [
    { name: "attendees:read", description: "Can view attendees" },
    { name: "attendees:create", description: "Can create attendees" },
    { name: "attendees:update", description: "Can update attendees" },
    { name: "attendees:delete", description: "Can delete attendees" },
    { name: "roles:read", description: "Can view roles" },
    { name: "roles:create", description: "Can create roles" },
    { name: "roles:update", description: "Can update roles" },
    { name: "roles:delete", description: "Can delete roles" },
    { name: "dashboard:access", description: "Can access dashboard" },
    { name: "admin:access", description: "Can access admin panel" },
    { name: "settings:access", description: "Can access settings" },
    { name: "analytics:access", description: "Can access analytics" },
    { name: "events:read", description: "Can access events" },
    { name: "events:edit", description: "Can edit events" },
    { name: "events:create", description: "Can create events" },
    { name: "events:delete", description: "Can delete events" },
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

  const attendeeRole = await prisma.role.upsert({
    where: { name: "attendee" },
    update: {},
    create: {
      name: "attendee",
      description: "Regular attendee with limited access",
    },
  })

  const organiserRole = await prisma.role.upsert({
    where: { name: "organiser" },
    update: {},
    create: {
      name: "organiser",
      description: "Organiser with events access",
    },
  })

  // Add the guest role to the seed file after the Organiser role
  const guestRole = await prisma.role.upsert({
    where: { name: "guest" },
    update: {},
    create: {
      name: "guest",
      description: "Default role for new attendees with limited access",
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

  // attendee gets basic permissions
  const attendeePermissions = ["dashboard:access", "settings:access", "events:read"]
  for (const permissionName of attendeePermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permissionName },
    })

    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: attendeeRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: attendeeRole.id,
          permissionId: permissionRecord.id,
        },
      })
    }
  }

  // Organiser gets events permissions
  const organiserPermissions = [
    "dashboard:access",
    "settings:access",
    "analytics:access",
    "attendees:read",
    "roles:read",
    "events:read",
    "events:edit",
    "events:create",
    "events:delete",
  ]
  for (const permissionName of organiserPermissions) {
    const permissionRecord = await prisma.permission.findUnique({
      where: { name: permissionName },
    })

    if (permissionRecord) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: organiserRole.id,
            permissionId: permissionRecord.id,
          },
        },
        update: {},
        create: {
          roleId: organiserRole.id,
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
    where: { email: "dev@gmail.com" },
    update: {},
    create: {
      name: "Dev Admin",
      email: "dev@gmail.com",
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

