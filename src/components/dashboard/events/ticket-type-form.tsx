"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"

const ticketTypeSchema = z.object({
  name: z.string().min(2, {
    message: "Ticket name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  quantity: z.coerce.number().int().min(1, {
    message: "Quantity must be at least 1.",
  }),
})

type TicketTypeValues = z.infer<typeof ticketTypeSchema>

interface TicketTypeFormProps {
  onAdd: (ticketType: TicketTypeValues) => void
  initialValues?: TicketTypeValues
}

export function TicketTypeForm({ onAdd, initialValues }: TicketTypeFormProps) {
  const [isAdding, setIsAdding] = useState(false)

  const form = useForm<TicketTypeValues>({
    resolver: zodResolver(ticketTypeSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
      price: 0,
      quantity: 1,
    },
  })

  function onSubmit(data: TicketTypeValues) {
    onAdd(data)
    form.reset({
      name: "",
      description: "",
      price: 0,
      quantity: 1,
    })
    setIsAdding(false)
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Name</FormLabel>
                <FormControl>
                  <Input placeholder="General Admission" {...field} />
                </FormControl>
                <FormDescription>The name of this ticket type</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what this ticket includes..."
                    className="resize-none"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ( Kshs )</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Available</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isAdding} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Ticket Type
          </Button>
        </form>
      </Form>
    </div>
  )
}

