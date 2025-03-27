"use client"

import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { SidebarFooter } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function DashboardSidebarFooter() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <SidebarFooter>
      <Button
        variant="ghost"
        className={cn("w-full", isCollapsed ? "justify-center" : "justify-start")}
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="h-5 w-5" />
        {!isCollapsed && <span className="ml-2">Sign Out</span>}
      </Button>
    </SidebarFooter>
  )
}

