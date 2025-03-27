"use client"

// import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/dashboard/user-nav"
import { SidebarTrigger } from "../ui/sidebar"
import { DashboardBreadcrumb } from "./breadcrumb"

interface Props {
  user: {
    id?: string | null
    role?: string | null
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function DashboardHeader({ user }: Props) {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <SidebarTrigger />
          <div className="container py-2">
            <DashboardBreadcrumb />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <UserNav user={user} />
        </div>
      </div>

    </header>
  )
}

