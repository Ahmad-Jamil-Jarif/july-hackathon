"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const CivicInteractiveMap = dynamic(
  () =>
    import("@/components/map/civic-interactive-map").then(
      (m) => m.CivicInteractiveMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[600px] items-center justify-center bento-card border-border-subtle bg-mn-surface-container">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    ),
  },
)

export function MapClient() {
  return (
    <div className="overflow-hidden bento-card border-border-subtle bg-mn-surface-container shadow-sm">
      <CivicInteractiveMap />
    </div>
  )
}