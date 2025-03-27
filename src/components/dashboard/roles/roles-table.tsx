"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Pencil, Plus } from "lucide-react"
import { PermissionGate } from "@/components/auth/permission-gate"
import Link from "next/link"

interface Role {
  id: string
  name: string
  description: string | null
  permissions: {
    permission: {
      id: string
      name: string
    }
  }[]
  _count: {
    users: number
  }
}

export function RolesTable() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch("/api/roles")
        if (!response.ok) throw new Error("Failed to fetch roles")
        const data = await response.json()
        setRoles(data.roles)
      } catch (error) {
        console.error("Error fetching roles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium">All Roles</h3>
          <p className="text-sm text-muted-foreground">A list of all roles in your application</p>
        </div>
        <PermissionGate permission="roles:create">
          <Button size="sm" asChild>
            <Link href="/dashboard/roles/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Role
            </Link>
          </Button>
        </PermissionGate>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Users</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((p) => (
                        <Badge key={p.permission.id} variant="outline">
                          {p.permission.name}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline">+{role.permissions.length - 3} more</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{role._count.users}</TableCell>
                  <TableCell className="text-right">
                    <PermissionGate permission="roles:update">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/roles/${role.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

