import { EditUserForm } from "@/components/dashboard/users/edit-user-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb"
// import { Home } from "lucide-react"
// import Link from "next/link"
import { getUserById } from "@/lib/auth/user-service"
import { PermissionGate } from "@/components/auth/permission-gate"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params
  const user = await getUserById(id)

  return (
    <div className="space-y-6">
      {/* <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/users">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit {user?.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit User: {user?.name}</h1>
      </div>

      <PermissionGate
        permission="users:update"
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don&#39;t have permission to edit users.</CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>
              Update user information and manage their role. Changes will affect the user&#39;s access to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditUserForm userId={id} />
          </CardContent>
        </Card>
      </PermissionGate>
    </div>
  )
}

