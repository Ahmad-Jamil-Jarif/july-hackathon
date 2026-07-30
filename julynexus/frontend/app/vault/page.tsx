import type { Metadata } from "next"

import { VaultClient } from "./vault-client"

export const metadata: Metadata = {
  title: "Evidence Vault · JulyDigonto",
  description:
    "Browse, fetch, and retrieve the verified media files stored on IPFS through the local gateway.",
}

export default function VaultPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Storage · Vault</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Evidence vault
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Every verified file lives in an append-only vault. Browse the index,
          open a CID, and confirm byte-level integrity against the recorded
          SHA-256 hash.
        </p>
      </header>
      <VaultClient />
    </div>
  )
}