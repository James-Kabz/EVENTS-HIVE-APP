"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { PermissionSelector } from "@/components/dashboard/roles/permission-selector"
import { Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Permission {
    permissionId: string;
    // Add any other properties that the permission object might have
  }

const roleFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Role name must be at least 2 characters.",
    })
    .max(50, {
      message: "Role name must not be longer than 50 characters.",
    }),
  description: z
    .string()
    .max(200, {
      message: "Description must not be longer than 200 characters.",
    })
    .optional(),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface EditRoleFormProps {
  roleId: string
}

export function EditRoleForm({ roleId }: EditRoleFormProps) {
  const router = useRouter()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    async function fetchRoleData() {
      try {
        const response = await fetch(`/api/roles/${roleId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch role data")
        }

        const data = await response.json()

        form.reset({
          name: data.name,
          description: data.description || "",
        })

        // Set the selected permissions
        const permissionIds = data.permissions.map((p: Permission) => p.permissionId)
        setSelectedPermissions(permissionIds)
      } catch (error) {
        console.log("Error fetching role data:", error)
        toast.error("Failed to load role data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoleData()
  }, [roleId, form])

  async function onSubmit(data: RoleFormValues) {
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission for this role.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          permissions: selectedPermissions,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update role")
      }

      toast.success(`The role "${data.name}" has been updated successfully.`)

      router.push("/dashboard/permissions")
      router.refresh()
    } catch (error) {
      toast.error( error instanceof Error ? error.message : "Failed to update role")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteRole() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete role")
      }

      toast.success("The role has been deleted successfully.")

      router.push("/dashboard/permissions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete role")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-8 flex-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Editor, Moderator" {...field} />
                    </FormControl>
                    <FormDescription>This is the name of the role that will be displayed to users.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of this role's responsibilities"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Describe what this role is responsible for in the system.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="ml-4">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the role and remove it from all users who
                    have it assigned.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteRole}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Permissions</h3>
              <p className="text-sm text-muted-foreground">Manage the permissions assigned to this role.</p>
            </div>

            <PermissionSelector
              selectedPermissions={selectedPermissions}
              onPermissionsChange={setSelectedPermissions}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

