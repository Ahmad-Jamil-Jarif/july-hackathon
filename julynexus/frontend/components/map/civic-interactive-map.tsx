"use client"

import "maplibre-gl/dist/maplibre-gl.css"

import { useCallback, useEffect, useMemo, useState } from "react"
import MapGL, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
} from "react-map-gl/maplibre"
import { Flame, MapPin, Layers } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { API_BASE } from "@/lib/api"
import { cn } from "@/lib/utils"

export type MemorialMarker = {
  id: string
  name: string
  district: string
  lat: number
  lng: number
  testimony: string
  ipfs_cid: string
  created_at: string
}

type ViewMode = "markers" | "heatmap"

const DHAKA_CENTER: [number, number] = [90.4125, 23.8103]

const DARK_RASTER_STYLE = {
  version: 8 as const,
  sources: {
    basemap: {
      type: "raster" as const,
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © CARTO',
    },
  },
  layers: [
    {
      id: "basemap",
      type: "raster" as const,
      source: "basemap",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
}

export function CivicInteractiveMap() {
  const [viewMode, setViewMode] = useState<ViewMode>("markers")
  const [entries, setEntries] = useState<MemorialMarker[]>([])
  const [selected, setSelected] = useState<MemorialMarker | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/api/v1/memorial`)
      .then((r) => r.json())
      .then((data: MemorialMarker[]) => {
        if (!cancelled) setEntries(data.filter((e) => e.lat && e.lng))
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const geojson = useMemo<GeoJSON.FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: entries.map((e) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [e.lng, e.lat] },
        properties: {
          id: e.id,
          name: e.name,
          district: e.district,
          weight: 1,
        },
      })),
    }
  }, [entries])

  const handleMarkerClick = useCallback((entry: MemorialMarker) => {
    setSelected(entry)
  }, [])
  const handleClosePopup = useCallback(() => setSelected(null), [])

  return (
    <div className="relative h-[min(75vh,720px)] min-h-[420px] w-full overflow-hidden rounded-xl border border-border bg-card">
      <MapGL
        initialViewState={{
          longitude: DHAKA_CENTER[0],
          latitude: DHAKA_CENTER[1],
          zoom: 7,
        }}
        mapStyle={DARK_RASTER_STYLE}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
        onClick={(e) => {
          if (!e.features?.length) setSelected(null)
        }}
      >
        <NavigationControl position="bottom-left" />

        {viewMode === "heatmap" && (
          <Source id="memorial-heat-source" type="geojson" data={geojson}>
            <Layer
              id="memorial-heat-layer"
              type="heatmap"
              paint={{
                "heatmap-weight": ["get", "weight"],
                "heatmap-intensity": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  5,
                  0.5,
                  12,
                  2,
                ],
                "heatmap-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  5,
                  18,
                  12,
                  40,
                ],
                "heatmap-opacity": 0.85,
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(0,0,0,0)",
                  0.2,
                  "rgba(255,237,213,0.5)",
                  0.4,
                  "rgba(251,146,60,0.7)",
                  0.7,
                  "rgba(239,68,68,0.85)",
                  1,
                  "rgba(127,29,29,0.95)",
                ],
              }}
            />
          </Source>
        )}

        {viewMode === "markers" &&
          entries.map((e) => (
            <Marker
              key={e.id}
              longitude={e.lng}
              latitude={e.lat}
              anchor="center"
              onClick={(evt) => {
                evt.originalEvent.stopPropagation()
                handleMarkerClick(e)
              }}
            >
              <div
                className={cn(
                  "flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-125",
                  selected?.id === e.id
                    ? "bg-red-600"
                    : "bg-red-500/90",
                )}
                title={e.name}
              >
                <Flame className="size-3.5 text-white" />
              </div>
            </Marker>
          ))}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            onClose={handleClosePopup}
            closeOnClick={false}
            maxWidth="300px"
          >
            <div className="flex flex-col gap-2 p-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold leading-tight">
                  {selected.name}
                </p>
                <Badge variant="destructive" className="shrink-0">
                  Martyr
                </Badge>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" /> {selected.district}
              </p>
              <p className="text-xs leading-relaxed text-foreground/80">
                {selected.testimony.slice(0, 220)}
                {selected.testimony.length > 220 ? "…" : ""}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                CID {selected.ipfs_cid.slice(0, 10)}…
              </p>
            </div>
          </Popup>
        )}
      </MapGL>

      {/* Controls panel */}
      <Card className="absolute right-3 top-3 w-56 border-border/80 bg-background/90 backdrop-blur">
        <CardContent className="space-y-2 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Layers className="size-3.5" /> VIEW MODE
          </div>
          <div className="flex gap-1 rounded-md bg-muted p-0.5">
            <Button
              size="sm"
              variant={viewMode === "markers" ? "default" : "ghost"}
              className="h-7 flex-1 text-xs"
              onClick={() => setViewMode("markers")}
            >
              Markers
            </Button>
            <Button
              size="sm"
              variant={viewMode === "heatmap" ? "default" : "ghost"}
              className="h-7 flex-1 text-xs"
              onClick={() => setViewMode("heatmap")}
            >
              Heatmap
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Loading tributes…"
              : `${entries.length} memorial entries`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}