"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShieldAlert, RefreshCw } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

export default function ForbiddenPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)

  const handleSessionRefresh = async () => {
    setIsRefreshing(true)
    setRefreshError(null)

    try {
      // Sign out to clear the current session
      await signOut({ 
        redirect: false,  // Prevent automatic redirect
        callbackUrl: "/login"
      })

      // Redirect to login page
      window.location.href = "/login"
    } catch (error) {
      console.error("Session refresh error:", error)
      setRefreshError("Failed to refresh session. Please try again.")
      setIsRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-6xl font-bold">403</h1>
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          You don&#39;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Button asChild variant="outline">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>

          <Button 
            onClick={handleSessionRefresh}
            disabled={isRefreshing}
            variant="secondary"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Session
              </>
            )}
          </Button>

          {refreshError && (
            <p className="text-red-500 text-sm">{refreshError}</p>
          )}
        </div>
      </div>
    </div>
  )
}