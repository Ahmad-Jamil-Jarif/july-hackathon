import type { Metadata } from "next"

import { MemorialClient } from "./memorial-client"

export const metadata: Metadata = {
  title: "Memorial · JulyNexus",
  description:
    "Honor the martyrs of the July uprising. Each testimony is pinned to IPFS and plotted on the public map.",
}

export default function MemorialPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Memorial</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Memorial of the martyrs
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Citizen-submitted testimonies of those lost. Each entry is anchored to
          IPFS, geolocated, and signed on the public aid ledger.
        </p>
      </header>
      <MemorialClient />
    </div>
  )
}