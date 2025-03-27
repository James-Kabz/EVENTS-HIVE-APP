"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { data: session } = useSession()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkPermission() {
      if (!session?.user?.id) {
        setHasPermission(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/check-permission?permission=${permission}`)
        const data = await response.json()
        setHasPermission(data.hasPermission)
      } catch (error) {
        console.error("Error checking permission:", error)
        setHasPermission(false)
      }
    }

    checkPermission()
  }, [session, permission])

  // Show nothing while loading
  if (hasPermission === null) {
    return null
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>
}

