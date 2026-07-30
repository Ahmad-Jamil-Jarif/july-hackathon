export type MemorialHeatmapMapLabels = {
  title: string
  hint: string
  loading: string
  error: string
  retry: string
}

export type MemorialHeatmapMapProps = {
  labels: MemorialHeatmapMapLabels
  mapHeightClassName?: string
  showHeader?: boolean
}