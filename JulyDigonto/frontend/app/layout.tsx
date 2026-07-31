import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk, EB_Garamond, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"

import { MemorialShell } from "./memorial-shell"

import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

// Memorial Museum typography
const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-eb-garamond",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "JulyDigonto — Evidentiary Truth, Civic Dignity, Verified Memory",
  description:
    "JulyDigonto is a civic-tech platform for the July Uprising: AI forensics, IPFS vault, and victim-aid transparency.",
  keywords: [
    "deepfake detection",
    "civic memory",
    "Bangladesh",
    "July Uprising",
    "victim aid",
    "IPFS",
    "aid transparency",
  ],
  authors: [{ name: "JulyDigonto" }],
  openGraph: {
    title: "JulyDigonto",
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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${ebGaramond.variable} ${jetbrainsMono.variable} font-sans antialiased dark bg-mn-surface-deep`}
      >
        <MemorialShell>{children}</MemorialShell>
        <Toaster />
      </body>
    </html>
  )
}