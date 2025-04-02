import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Events Hive",
  description: "Next.js Authentication with Next-Auth, Prisma, and shadcn/ui",
  metadataBase: new URL('https://events-hive-app.vercel.app'),
  icons: {
    icon: '/events_hive.png',
  },
  // Add this section for font preloading
  openGraph: {
    // Your OpenGraph metadata
  },
  // Add links array for preloading resources
  other: {
    'link': [
      {
        rel: 'preload',
        href: '/fonts/your-custom-font.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      }
    ],
  },
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster position="top-right" />
            <SpeedInsights />
            <Analytics/>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}