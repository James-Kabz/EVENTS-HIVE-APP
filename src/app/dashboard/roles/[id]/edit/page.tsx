import { EditRoleForm } from "@/components/dashboard/roles/edit-role-form"
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
import { getRoleById } from "@/lib/auth/role-service"

interface EditRolePageProps {
  params: {
    id: string
  }
}

export default async function EditRolePage({ params }: EditRolePageProps) {
  const { id } = await params
  const role = await getRoleById(id)
  
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
              <Link href="/dashboard/permissions">Permissions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/roles">Roles</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Edit {role?.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Role: {role?.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Update role details and manage its permissions. Changes will affect all users with this role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditRoleForm roleId={id} />
        </CardContent>
      </Card>
    </div>
  )
}

