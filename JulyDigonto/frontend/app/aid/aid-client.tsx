"use client"

import { AidDisburser } from "@/components/aid-disburser"
import { LedgerExplorer } from "@/components/ledger-explorer"

export function AidClient() {
  return (
    <div className="space-y-8">
      <AidDisburser />
      <LedgerExplorer />
    </div>
  )
}