"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Permission {
  id: string
  name: string
  description: string | null
}

interface PermissionSelectorProps {
  selectedPermissions: string[]
  onPermissionsChange: (permissions: string[]) => void
}

export function PermissionSelector({ selectedPermissions, onPermissionsChange }: PermissionSelectorProps) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({})

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const response = await fetch("/api/permissions")
        if (!response.ok) throw new Error("Failed to fetch permissions")
        const data = await response.json()
        setPermissions(data.permissions)

        // Group permissions by category (based on prefix before :)
        const grouped: Record<string, Permission[]> = {}
        data.permissions.forEach((permission: Permission) => {
          const category = permission.name.split(":")[0] || "Other"
          if (!grouped[category]) {
            grouped[category] = []
          }
          grouped[category].push(permission)
        })
        setGroupedPermissions(grouped)
      } catch (error) {
        console.error("Error fetching permissions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  const handleTogglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      onPermissionsChange(selectedPermissions.filter((id) => id !== permissionId))
    } else {
      onPermissionsChange([...selectedPermissions, permissionId])
    }
  }

  const handleSelectAllInCategory = (category: string) => {
    const categoryPermissionIds = groupedPermissions[category].map((p) => p.id)
    const newSelectedPermissions = [...selectedPermissions]

    // Check if all permissions in this category are already selected
    const allSelected = categoryPermissionIds.every((id) => selectedPermissions.includes(id))

    if (allSelected) {
      // Remove all permissions in this category
      onPermissionsChange(selectedPermissions.filter((id) => !categoryPermissionIds.includes(id)))
    } else {
      // Add all permissions in this category that aren't already selected
      categoryPermissionIds.forEach((id) => {
        if (!newSelectedPermissions.includes(id)) {
          newSelectedPermissions.push(id)
        }
      })
      onPermissionsChange(newSelectedPermissions)
    }
  }

  const filteredPermissions = searchQuery
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    : permissions

  const filteredGroupedPermissions: Record<string, Permission[]> = {}
  if (searchQuery) {
    filteredPermissions.forEach((permission) => {
      const category = permission.name.split(":")[0] || "Other"
      if (!filteredGroupedPermissions[category]) {
        filteredGroupedPermissions[category] = []
      }
      filteredGroupedPermissions[category].push(permission)
    })
  }

  const groupsToRender = searchQuery ? filteredGroupedPermissions : groupedPermissions
  const categories = Object.keys(groupsToRender).sort()

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {selectedPermissions.length > 0 ? (
          <>
            <span className="text-sm text-muted-foreground py-1">Selected:</span>
            {selectedPermissions.map((id) => {
              const permission = permissions.find((p) => p.id === id)
              return permission ? (
                <Badge
                  key={id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleTogglePermission(id)}
                >
                  {permission.name}
                  <span className="ml-1 text-xs">×</span>
                </Badge>
              ) : null
            })}
          </>
        ) : (
          <span className="text-sm text-muted-foreground py-1">No permissions selected</span>
        )}
      </div>

      <Tabs defaultValue="grouped" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grouped">Grouped</TabsTrigger>
          <TabsTrigger value="all">All Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="grouped" className="border rounded-md mt-2">
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-6">
              {categories.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No permissions found</div>
              ) : (
                categories.map((category) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`select-all-${category}`}
                        checked={groupsToRender[category].every((p) => selectedPermissions.includes(p.id))}
                        onCheckedChange={() => handleSelectAllInCategory(category)}
                      />
                      <label
                        htmlFor={`select-all-${category}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                    </div>
                    <div className="ml-6 space-y-2">
                      {groupsToRender[category].map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handleTogglePermission(permission.id)}
                          />
                          <div className="grid gap-1.5">
                            <label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.name}
                            </label>
                            {permission.description && (
                              <p className="text-sm text-muted-foreground">{permission.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="all" className="border rounded-md mt-2">
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-2">
              {filteredPermissions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No permissions found</div>
              ) : (
                filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`all-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handleTogglePermission(permission.id)}
                    />
                    <div className="grid gap-1.5">
                      <label
                        htmlFor={`all-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {permission.name}
                      </label>
                      {permission.description && (
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

