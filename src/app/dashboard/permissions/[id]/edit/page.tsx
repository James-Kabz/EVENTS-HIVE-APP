import { EditPermissionForm } from "@/components/dashboard/permissions/edit-permission-form"
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
import { getPermissionById } from "@/lib/auth/permission-service"

interface EditPermissionPageProps {
  params: {
    id: string
  }
}

export default async function EditPermissionPage({ params }: EditPermissionPageProps) {
  const { id } = await params
  const permission = await getPermissionById(id)

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
            <BreadcrumbLink>Edit {permission?.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Permission: {permission?.name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Details</CardTitle>
          <CardDescription>
            Update permission details. Changes will affect all roles that have this permission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditPermissionForm permissionId={id} />
        </CardContent>
      </Card>
    </div>
  )
}

