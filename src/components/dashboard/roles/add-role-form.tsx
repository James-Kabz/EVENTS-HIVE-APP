"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PermissionSelector } from "@/components/dashboard/roles/permission-selector"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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

export function AddRoleForm() {
  const router = useRouter()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  async function onSubmit(data: RoleFormValues) {
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission for this role.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
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
        throw new Error(error.message || "Failed to create role")
      }

      toast.success("Role created successfully!");

      router.push("/dashboard/permissions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create role");
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Select the permissions that will be assigned to this role.
              </p>
            </div>

            <PermissionSelector
              selectedPermissions={selectedPermissions}
              onPermissionsChange={setSelectedPermissions}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Role"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

