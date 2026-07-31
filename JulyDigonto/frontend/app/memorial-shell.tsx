"use client"

import { useEffect, type ReactNode } from "react"
import dynamic from "next/dynamic"

const BackgroundShader = dynamic(() => import("@/components/BackgroundShader"), { ssr: false })
const Navbar = dynamic(() => import("@/components/Navbar").then((m) => m.Navbar), { ssr: false })
const Footer = dynamic(() => import("@/components/Footer").then((m) => m.Footer), { ssr: false })
import { usePathname } from "next/navigation"
import Link from "next/link"

const NAV_LINKS = [
  { href: "/verify", label: "সংগ্রহশালা" },
  { href: "/memorial", label: "শহীদ তালিকা" },
  { href: "/map", label: "ইতিহাস" },
  { href: "/analyze", label: "বিশ্লেষণ" },
  { href: "/vault", label: "ভল্ট" },
  { href: "/aid", label: "সহায়তা" },
] as const

export function MemorialShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  // shader and chrome are provided by shared client components

  // Reveal-on-scroll via IntersectionObserver (port of the original inline script)
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(".reveal")
    if (revealElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("active")
          }
        }
      },
      { threshold: 0.1 },
    )

    revealElements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  // Navbar handles its own shrink-on-scroll behavior

  // shader and chrome are implemented in shared components

  // The homepage has its own dedicated shell (video bg + security scripts).
  // Pass children through untouched so /home-client.tsx remains the source of truth.
  if (isHome) return <>{children}</>

  return (
    <div className="memorial-scope">
      {/* Background shader + accents */}
      <BackgroundShader />
      <div className="red-bar-left hidden md:block" />
      <div className="red-bar-right hidden md:block" />
      <div className="red-dot-top-right" />

      <Navbar />

      <main className="relative z-10 pt-20">{children}</main>

      <Footer />
    </div>
  )
}