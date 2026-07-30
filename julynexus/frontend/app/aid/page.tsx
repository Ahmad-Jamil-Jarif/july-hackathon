import type { Metadata } from "next"

import { AidClient } from "./aid-client"

export const metadata: Metadata = {
  title: "Aid Transparency · JulyNexus",
  description:
    "Register beneficiary families, disburse funds, and inspect every transaction on the public ledger.",
}

export default function AidPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Aid Transparency</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Aid registration &amp; disbursement
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Register families, disburse funds, and verify every transaction on the
          public ledger. Recipients are referenced by hashed IDs — never by
          raw national-ID numbers.
        </p>
      </header>
      <AidClient />
    </div>
  )
}