"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "@/components/error-boundary"
import { AlertCircle } from "lucide-react"

// Component that will throw an error
const ErrorComponent = () => {
  throw new Error("This is a test error from ErrorComponent")
  return null
}

export default function ErrorExamplesPage() {
  const [showError, setShowError] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const triggerApiError = async (type: string) => {
    try {
      const response = await fetch(`/api/error-examples?type=${type}`)
      const data = await response.json()

      if (!response.ok) {
        setApiError(`${response.status} Error: ${data.message}`)
      } else {
        setApiError(`Success: ${data.message}`)
      }
    } catch (error) {
      setApiError(`Fetch Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Error Handling Examples</h1>
        <p className="text-muted-foreground">This page demonstrates different error handling techniques in Next.js.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Component Error</CardTitle>
            <CardDescription>Test React Error Boundary by rendering a component that throws an error.</CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>{showError ? <ErrorComponent /> : <p>Component is working normally.</p>}</ErrorBoundary>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowError(!showError)}>
              {showError ? "Hide Error Component" : "Show Error Component"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Error Handling</CardTitle>
            <CardDescription>Test API error responses with different status codes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => triggerApiError("not-found")}>
                  404 Error
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerApiError("unauthorized")}>
                  401 Error
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerApiError("forbidden")}>
                  403 Error
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerApiError("validation")}>
                  422 Error
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerApiError("server")}>
                  500 Error
                </Button>
                <Button size="sm" variant="outline" onClick={() => triggerApiError("")}>
                  Success
                </Button>
              </div>

              {apiError && (
                <div
                  className={`p-3 rounded-md ${apiError.startsWith("Success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  <div className="flex items-center">
                    {!apiError.startsWith("Success") && <AlertCircle className="h-4 w-4 mr-2" />}
                    <p className="text-sm">{apiError}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation Errors</CardTitle>
            <CardDescription>Test navigation to error pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" asChild>
                <a href="/this-page-does-not-exist">404 Not Found</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/unauthorized">401 Unauthorized</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/forbidden">403 Forbidden</a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  throw new Error("Manual error triggered")
                }}
              >
                Throw Error
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

