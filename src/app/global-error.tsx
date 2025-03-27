"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background text-foreground">
          <div className="space-y-6 max-w-md">
            <h1 className="text-6xl font-bold">500</h1>
            <h2 className="text-2xl font-semibold">Application Error</h2>
            <p className="text-muted-foreground">
              {process.env.NODE_ENV === "development"
                ? `Error: ${error.message}`
                : "A critical error occurred. Our team has been notified."}
            </p>
            {process.env.NODE_ENV === "development" && error.digest && (
              <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
            )}
            <Button onClick={reset}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

