"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  const NAV_LINKS = [
    { href: "/verify", label: "সংগ্রহশালা" },
    { href: "/memorial", label: "শহীদ তালিকা" },
    { href: "/map", label: "ইতিহাস" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-mn-surface/80 backdrop-blur-md border-b border-mn-border-subtle h-20 transition-all duration-500">
      <div className="flex justify-between items-center w-full px-mn-margin-desktop max-w-screen-2xl mx-auto h-full">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 font-mn-headline-md text-mn-headline-md tracking-tight">
            <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-muted">
              <Image src="/logo1.jpeg" alt="স্মৃতিসৌধ" fill sizes="40px" className="object-cover" />
            </div>
            <span className="hidden sm:inline">স্মৃতিসৌধ</span>
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={pathname.startsWith(l.href) ? "font-mn-label-md text-mn-primary border-b border-mn-primary pb-1" : "font-mn-label-md text-mn-on-surface-variant hover:text-mn-primary"}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="material-symbols-outlined text-mn-on-surface hover:opacity-70 transition-opacity">search</button>
          <Link href="/aid" className="bg-mn-primary text-mn-on-primary px-6 py-2 font-mn-label-md text-mn-label-md uppercase tracking-widest hover:bg-opacity-90 transition-all">অনুদান</Link>
        </div>
      </div>
    </nav>
  )
}
