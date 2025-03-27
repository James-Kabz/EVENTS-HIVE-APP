"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbProps {
  homeHref?: string
}

export function DashboardBreadcrumb({ homeHref = "/dashboard" }: BreadcrumbProps) {
  const pathname = usePathname()

  // Skip rendering breadcrumbs on the home page
  if (pathname === homeHref) {
    return null
  }

  // Split the pathname into segments and remove empty segments
  const segments = pathname.split("/").filter(Boolean)

  // Create breadcrumb items from the segments
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const isLastItem = index === segments.length - 1

    // Format the segment for display (capitalize, replace hyphens with spaces)
    const formattedSegment = segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

    return {
      href,
      label: formattedSegment,
      isLastItem,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home item */}
        <BreadcrumbItem>
          <BreadcrumbLink href={homeHref}>
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Separator after home */}
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator>

        {/* Map through breadcrumb items */}
        {breadcrumbItems.map((item) => (
          // Important: We use React.Fragment to avoid nesting li elements
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isLastItem ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>

            {/* Add separator only if not the last item */}
            {!item.isLastItem && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

