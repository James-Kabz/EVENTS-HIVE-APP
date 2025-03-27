"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, Pencil } from "lucide-react"
import { PermissionGate } from "@/components/auth/permission-gate"
import Link from "next/link"

interface Permission {
  id: string
  name: string
  description: string | null
  _count: {
    roles: number
  }
}

export function PermissionsTable() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch("/api/permissions")
        if (!response.ok) throw new Error("Failed to fetch permissions")
        const data = await response.json()
        setPermissions(data.permissions)
      } catch (error) {
        console.error("Error fetching permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
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
          <h3 className="text-lg font-medium">All Permissions</h3>
          <p className="text-sm text-muted-foreground">A list of all permissions in your application</p>
        </div>
        <PermissionGate permission="roles:create">
          <Button size="sm" asChild>
            <Link href="/dashboard/permissions/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
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
              <TableHead>Used in Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  No permissions found
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>{permission.description || "—"}</TableCell>
                  <TableCell>{permission._count.roles}</TableCell>
                  <TableCell className="text-right">
                    <PermissionGate permission="roles:update">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/permissions/${permission.id}/edit`}>
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

