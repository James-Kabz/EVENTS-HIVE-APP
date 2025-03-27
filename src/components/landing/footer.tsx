import type React from "react"
import Link from "next/link"
import { Calendar, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container max-w-7xl mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Events Hive</span>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <nav className="flex gap-4 md:gap-6">
            <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:underline underline-offset-4">
              Terms
            </Link>
            <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:underline underline-offset-4">
              Privacy
            </Link>
            <Link href="#" className="text-xs md:text-sm text-muted-foreground hover:underline underline-offset-4">
              Cookies
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <SocialLink href="#" icon={<Facebook className="h-4 w-4" />} label="Facebook" />
            <SocialLink href="#" icon={<Twitter className="h-4 w-4" />} label="Twitter" />
            <SocialLink href="#" icon={<Instagram className="h-4 w-4" />} label="Instagram" />
            <SocialLink href="#" icon={<Linkedin className="h-4 w-4" />} label="LinkedIn" />
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="text-muted-foreground hover:text-foreground">
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  )
}

