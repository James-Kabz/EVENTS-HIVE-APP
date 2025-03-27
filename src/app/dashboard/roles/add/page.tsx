import { AddRoleForm } from "@/components/dashboard/roles/add-role-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddRolePage() {
  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Add New Role</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>
            Create a new role and assign permissions to it. Roles define what actions users can perform in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddRoleForm />
        </CardContent>
      </Card>
    </div>
  )
}

