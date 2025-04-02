"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError("Verification token is missing")
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Verification failed")
        }

        setIsSuccess(true)
        toast.success("Email verified successfully")

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Verification failed")
        toast.error("Verification failed", {
          description: error instanceof Error ? error.message : "Something went wrong",
        })
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        <CardDescription>Verifying your email address</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        {isVerifying ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">Verifying your email address...</p>
          </div>
        ) : isSuccess ? (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Email Verified Successfully</h3>
              <p className="text-muted-foreground">
                Your email has been verified. You can now log in to your account.
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Verification Failed</h3>
              <p className="text-muted-foreground">{error || "Something went wrong"}</p>
              <div className="mt-4">
                <Link href="/resend-verification" className="text-primary hover:underline">
                  Resend verification email
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {!isVerifying && (
          <Button asChild>
            <Link href="/login">Go to Login</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={<p className="text-center text-muted-foreground">Loading...</p>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  )
}
