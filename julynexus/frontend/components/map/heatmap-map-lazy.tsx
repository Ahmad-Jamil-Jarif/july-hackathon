"use client"

import dynamic from "next/dynamic"

import type { MemorialHeatmapMapProps } from "./heatmap-map-types"

const MemorialHeatmapMapInner = dynamic(
  () => import("./heatmap-map").then((m) => m.MemorialHeatmapMap),
  { ssr: false, loading: () => <HeatmapMapSkeleton /> },
)

function HeatmapMapSkeleton() {
  return (
    <div
      className="flex h-[min(65vh,560px)] min-h-[280px] w-full animate-pulse items-center justify-center rounded-xl border border-border bg-muted/40"
      aria-hidden
    />
  )
}

export function MemorialHeatmapMapLazy(props: MemorialHeatmapMapProps) {
  return <MemorialHeatmapMapInner {...props} />
}