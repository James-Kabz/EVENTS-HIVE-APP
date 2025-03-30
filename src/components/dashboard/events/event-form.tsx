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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Trash } from "lucide-react"
import { cn } from "@/lib/utils"
import { TicketTypeForm } from "@/components/dashboard/events/ticket-type-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const eventFormSchema = z
    .object({
        name: z.string().min(2, {
            message: "Event name must be at least 2 characters.",
        }),
        description: z.string().optional(),
        location: z.string().min(2, {
            message: "Location is required.",
        }),
        startDate: z.date({
            required_error: "Start date is required.",
        }),
        endDate: z.date({
            required_error: "End date is required.",
        }),
        imageUrl: z.string().optional(),
        isPublished: z.boolean().default(false),
    })
    .refine((data) => data.endDate >= data.startDate, {
        message: "End date must be after start date",
        path: ["endDate"],
    })

type EventFormValues = z.infer<typeof eventFormSchema>

interface TicketType {
    id?: string
    name: string
    description?: string
    price: number
    quantity: number
}

interface EventFormProps {
    mode: "create" | "edit"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any
    onSuccess?: () => void
}

export function EventForm({ mode, initialData, onSuccess }: EventFormProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
    const [activeTab, setActiveTab] = useState("details")

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            name: "",
            description: "",
            location: "",
            imageUrl: "",
            isPublished: false,
        },
    })

    // Initialize form with event data if editing
    useEffect(() => {
        if (mode === "edit" && initialData) {
            form.reset({
                name: initialData.name,
                description: initialData.description || "",
                location: initialData.location,
                startDate: new Date(initialData.startDate),
                endDate: new Date(initialData.endDate),
                imageUrl: initialData.imageUrl || "",
                isPublished: initialData.isPublished,
            })

            // Set ticket types
            if (initialData.ticketTypes) {
                setTicketTypes(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    initialData.ticketTypes.map((ticket: any) => ({
                        id: ticket.id,
                        name: ticket.name,
                        description: ticket.description,
                        price: ticket.price,
                        quantity: ticket.quantity,
                    })),
                )
            }
        }
    }, [initialData, mode, form])

    const addTicketType = (ticketType: TicketType) => {
        setTicketTypes([...ticketTypes, ticketType])
    }

    const removeTicketType = (index: number) => {
        setTicketTypes(ticketTypes.filter((_, i) => i !== index))
    }

    async function onSubmit(data: EventFormValues) {
        if (ticketTypes.length === 0) {
            toast.info("Please add at least one ticket type for this event.",)
            return
        }

        setIsSubmitting(true)

        try {
            const url = mode === "create" ? "/api/events" : `/api/events/${initialData.id}`

            const method = mode === "create" ? "POST" : "PUT"

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    ticketTypes,
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || `Failed to ${mode} event`)
            }

            const result = await response.json()

            toast(
                mode === "create" ? "Event Created" : "Event Updated",
                {
                    description: `The event "${data.name}" has been ${mode === "create" ? "created" : "updated"} successfully.`,
                }
            );

            if (onSuccess) {
                onSuccess()
            } else {
                router.push(`/dashboard/events/${result.event.id}`)
            }
        } catch (error) {
            toast.error("Error", {
                description: error instanceof Error ? error.message : `Failed to ${mode} event`,
            });
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="details">Event Details</TabsTrigger>
                    <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Event Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Summer Music Festival" {...field} />
                                        </FormControl>
                                        <FormDescription>The name of your event as it will appear to attendees</FormDescription>
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
                                                placeholder="Describe your event..."
                                                className="resize-none min-h-32"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Provide details about your event to help attendees understand what to expect
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Start Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>End Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground",
                                                            )}
                                                        >
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        disabled={(date) => {
                                                            const start = form.getValues("startDate")
                                                            return start ? date < start : false
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Main St, City, Country" {...field} />
                                        </FormControl>
                                        <FormDescription>Where will your event take place?</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormDescription>A URL to an image that represents your event</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPublished"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Publish Event</FormLabel>
                                            <FormDescription>When checked, the event will be visible to all users</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-between">
                                <Button type="button" variant="outline" onClick={() => setActiveTab("tickets")}>
                                    Next: Ticket Types
                                </Button>

                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {mode === "create" ? "Creating..." : "Updating..."}
                                        </>
                                    ) : mode === "create" ? (
                                        "Create Event"
                                    ) : (
                                        "Update Event"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="tickets" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Types</CardTitle>
                            <CardDescription>Add different ticket types for your event</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <TicketTypeForm onAdd={addTicketType} />
                        </CardContent>
                    </Card>

                    {ticketTypes.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Added Ticket Types</CardTitle>
                                <CardDescription>{ticketTypes.length} ticket type(s) added</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {ticketTypes.map((ticketType, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-md">
                                            <div>
                                                <h4 className="font-medium">{ticketType.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Kshs {ticketType.price} - {ticketType.quantity} available
                                                </p>
                                                {ticketType.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{ticketType.description}</p>
                                                )}
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeTicketType(index)}>
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setActiveTab("details")}>
                            Back to Details
                        </Button>

                        <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === "create" ? "Creating..." : "Updating..."}
                                </>
                            ) : mode === "create" ? (
                                "Create Event"
                            ) : (
                                "Update Event"
                            )}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

