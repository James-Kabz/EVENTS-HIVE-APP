"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Common permission categories and actions for the builder
const commonCategories = ["users", "roles", "permissions", "dashboard", "settings", "analytics", "content","events"]
const commonActions = ["read", "create", "update", "delete", "manage", "access"]

export function AddPermissionForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [category, setCategory] = useState("")
  const [action, setAction] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [customAction, setCustomAction] = useState("")

  const form = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Update the name field when category or action changes
  const updatePermissionName = () => {
    const selectedCategory = category === "custom" ? customCategory : category
    const selectedAction = action === "custom" ? customAction : action

    if (selectedCategory && selectedAction) {
      form.setValue("name", `${selectedCategory}:${selectedAction}`)
    }
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setCategory(value)
    if (value !== "custom") {
      setCustomCategory("")
    }
    updatePermissionName()
  }

  // Handle action change
  const handleActionChange = (value: string) => {
    setAction(value)
    if (value !== "custom") {
      setCustomAction("")
    }
    updatePermissionName()
  }

  // Handle custom category change
  const handleCustomCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomCategory(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))
    updatePermissionName()
  }

  // Handle custom action change
  const handleCustomActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAction(e.target.value.toLowerCase().replace(/[^a-z]/g, ""))
    updatePermissionName()
  }

  async function onSubmit(data: PermissionFormValues) {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/permissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create permission")
      }

      toast.success(`The permission "${data.name}" has been created successfully.`)

      router.push("/dashboard/permissions")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create permission")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Permission Builder</h3>
            <p className="text-sm text-muted-foreground">
              Build your permission using the format <code>category:action</code>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel>Category</FormLabel>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom category</SelectItem>
                  </SelectContent>
                </Select>
                {category === "custom" && (
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="space-y-2">
                <FormLabel>Action</FormLabel>
                <Select value={action} onValueChange={handleActionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonActions.map((act) => (
                      <SelectItem key={act} value={act}>
                        {act}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom action</SelectItem>
                  </SelectContent>
                </Select>
                {action === "custom" && (
                  <Input
                    placeholder="Enter custom action"
                    value={customAction}
                    onChange={handleCustomActionChange}
                    className="mt-2"
                  />
                )}
              </div>
            </div>
          </div>

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

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Permission"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

