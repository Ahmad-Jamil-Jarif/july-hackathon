import type { Metadata } from "next"

import { VerifyClient } from "./verify-client"

export const metadata: Metadata = {
  title: "Verify Media · JulyDigonto",
  description:
    "Upload photos and videos to verify provenance, detect deepfakes, and pin evidence to IPFS.",
}

export default function VerifyPage() {
  return (
    <div className="bg-mn-surface-deep min-h-screen text-mn-primary mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Step 1 · Verify</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Verify photo &amp; video evidence
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Drop a media file to receive a SHA-256 hash, an IPFS CID, deepfake
          probability, and EXIF tamper flags. Every verified file is anchored to
          the public ledger.
        </p>
      </header>
      <VerifyClient />
    </div>
  )
}