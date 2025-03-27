"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, LayoutDashboard, ShieldCheck, UserCheck, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

// Import the custom components
import { DashboardSidebarHeader } from "@/components/dashboard/sidebar-header"
import { DashboardSidebarFooter } from "@/components/dashboard/sidebar-footer"
import { useUserPermissions } from "@/hooks/use-permissions"

interface Props {
  user: {
    id?: string | null
    role?: string | null
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

interface RouteItem {
  title: string
  href: string
  icon: React.ElementType
  permission?: string
}

export function DashboardSidebar({ user }: Props) {
  console.log(user);
  const pathname = usePathname()
  // Use the hook to get all user permissions at once
  const { permissions, isLoading } = useUserPermissions()

  // Define routes with their required permissions
  const routes: RouteItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      permission: "dashboard:access", // Basic permission that most roles should have
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
      permission: "analytics:access", // More restricted permission
    },
  ]

  const adminRoutes: RouteItem[] = [
    {
      title: "Admin",
      href: "",
      icon: UserCheck,
      permission: "admin:access",
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      permission: "users:read",
    },
    {
      title: "Roles & Permissions",
      href: "/dashboard/permissions",
      icon: ShieldCheck,
      permission: "roles:read",
    },
  ]

  // Check if user has any admin permissions
  const hasAnyAdminPermission =
    !isLoading && adminRoutes.some((route) => route.permission && permissions.includes(route.permission))

  // Function to check if a route should be displayed
  const shouldShowRoute = (route: RouteItem) => {
    if (!route.permission) return true
    if (isLoading) return false
    return permissions.includes(route.permission)
  }

  return (
    <Sidebar collapsible="icon">
      <DashboardSidebarHeader />
      <SidebarContent>
        <SidebarMenu>
          {/* Main routes */}
          {routes.map((route) =>
            shouldShowRoute(route) ? (
              <SidebarMenuItem key={route.href || route.title}>
                <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                  <Link href={route.href || "#"}>
                    <route.icon className="h-5 w-5" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null,
          )}

          {/* Admin section header - only show if user has any admin permissions */}
          {hasAnyAdminPermission && (
            <div className="mt-6 mb-2">
              <h4 className="px-3 text-xs font-semibold text-muted-foreground">Admin</h4>
            </div>
          )}

          {/* Admin routes */}
          {adminRoutes.map((route) =>
            shouldShowRoute(route) ? (
              <SidebarMenuItem key={route.href || route.title}>
                <SidebarMenuButton asChild isActive={pathname === route.href} tooltip={route.title}>
                  <Link href={route.href || "#"}>
                    <route.icon className="h-5 w-5" />
                    <span>{route.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null,
          )}
        </SidebarMenu>
      </SidebarContent>
      <DashboardSidebarFooter />
    </Sidebar>
  )
}

