import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"

import { Nav } from "@/components/nav"
import { Toaster } from "@/components/ui/toaster"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "JulyNexus — Evidentiary Truth, Civic Dignity, Verified Memory",
  description:
    "JulyNexus is a civic-tech platform for the July Uprising: AI forensics, IPFS vault, and victim-aid transparency.",
  keywords: [
    "deepfake detection",
    "civic memory",
    "Bangladesh",
    "July Uprising",
    "victim aid",
    "IPFS",
    "aid transparency",
  ],
  authors: [{ name: "JulyNexus" }],
  openGraph: {
    title: "JulyNexus",
    description:
      "Verify. Preserve. Serve. — Evidentiary truth infrastructure for civic memory.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#006a4e",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <Nav />
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        <footer className="border-t border-border bg-card/50 py-8 text-center text-xs text-muted-foreground">
          <div className="container mx-auto max-w-6xl px-4">
            <p className="font-semibold text-foreground">
              জুলাই নেক্সাস · JulyNexus · Built for the July Uprising Memorial Hackathon
            </p>
            <p className="mt-1">MIT License · For reproducibility</p>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  )
}