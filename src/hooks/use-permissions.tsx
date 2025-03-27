"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

/**
 * Hook to check if the current user has a specific permission
 */
export function useHasPermission(permissionName: string): {
  hasPermission: boolean
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()
  const [hasPermission, setHasPermission] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const checkPermission = async () => {
      if (!session?.user?.id) {
        setHasPermission(false)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/check-permission?permission=${permissionName}`)
        const data = await response.json()
        setHasPermission(data.hasPermission)
      } catch (err) {
        console.error("Error checking permission:", err)
        setError(err instanceof Error ? err : new Error("Failed to check permission"))
        setHasPermission(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkPermission()
  }, [session, permissionName])

  return { hasPermission, isLoading, error }
}

/**
 * Hook to get all permissions for the current user
 */
export function useUserPermissions(): {
  permissions: string[]
  isLoading: boolean
  error: Error | null
} {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user?.id) {
        setPermissions([])
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/auth/user-permissions")
        const data = await response.json()
        setPermissions(data.permissions || [])
      } catch (err) {
        console.error("Error fetching permissions:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch permissions"))
        setPermissions([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPermissions()
  }, [session])

  return { permissions, isLoading, error }
}

