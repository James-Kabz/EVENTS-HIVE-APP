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

const permissionFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Permission name must be at least 2 characters.",
    })
    .max(50, {
      message: "Permission name must not be longer than 50 characters.",
    })
    .refine((value) => /^[a-z]+:[a-z]+$/.test(value), {
      message: "Permission name must be in format 'category:action' (e.g., users:read).",
    }),
  description: z
    .string()
    .max(200, {
      message: "Description must not be longer than 200 characters.",
    })
    .optional(),
})

type PermissionFormValues = z.infer<typeof permissionFormSchema>

interface EditPermissionFormProps {
  permissionId: string
}

export function EditPermissionForm({ permissionId }: EditPermissionFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [rolesCount, setRolesCount] = useState(0)

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    async function fetchPermissionData() {
      try {
        const response = await fetch(`/api/permissions/${permissionId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch permission data")
        }

        const data = await response.json()

        form.reset({
          name: data.name,
          description: data.description || "",
        })

        setRolesCount(data._count.roles)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load permission data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissionData()
  }, [permissionId, form])

  async function onSubmit(data: PermissionFormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update permission")
      }

      toast.success(`The permission "${data.name}" has been updated successfully.`)

      router.push("/dashboard/permissions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update permission")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeletePermission() {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/permissions/${permissionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete permission")
      }

      toast.success("The permission has been deleted successfully.")

      router.push("/dashboard/permissions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role")
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
                    <FormLabel>Permission Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      The permission name in the format <code>category:action</code> (e.g., users:read)
                    </FormDescription>
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
                        placeholder="Brief description of what this permission allows"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Describe what actions this permission grants in the system.</FormDescription>
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
                    This action cannot be undone. This will permanently delete the permission and remove it from all
                    roles that have it assigned.
                    {rolesCount > 0 && (
                      <p className="mt-2 font-semibold">
                        This permission is currently used by {rolesCount} role{rolesCount !== 1 ? "s" : ""}.
                      </p>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePermission}
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

