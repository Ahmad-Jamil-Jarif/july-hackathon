"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShieldCheck, MapPin, Menu } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/verify", label: "Verify" },
  { href: "/analyze", label: "Analyze" },
  { href: "/vault", label: "Vault" },
  { href: "/memorial", label: "Memorial" },
  { href: "/map", label: "Map" },
  { href: "/aid", label: "Aid" },
  { href: "/kiosk", label: "Kiosk" },
  { href: "/chatbot", label: "Chatbot" },
  { href: "/dashboard", label: "Dashboard" },
]

export function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-bd-flag text-xs font-bold text-white shadow-sm">
            JN
          </span>
          <span className="hidden text-base sm:inline">JulyDigonto</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.slice(1).map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden inline-flex size-9 items-center justify-center rounded-md border border-input bg-background text-foreground shadow-xs"
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto flex max-w-6xl flex-col gap-1 px-4 py-2">
            {NAV_LINKS.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}

// Avoid unused-import warning for ShieldCheck/MapPin; they may be used later
void ShieldCheck
void MapPin