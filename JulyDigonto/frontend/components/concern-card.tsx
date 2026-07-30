import Link from "next/link"
import { MapPin, Clock, Flame } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, shortCid } from "@/lib/utils"

import type { MemorialMarker } from "@/components/map/civic-interactive-map"

type ConcernCardProps = {
  entry: MemorialMarker
}

export function ConcernCard({ entry }: ConcernCardProps) {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:border-primary/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <Flame className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight">{entry.name}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" /> {entry.district}
            </p>
          </div>
        </div>
        <Badge variant="destructive" className="shrink-0">
          Martyr
        </Badge>
      </div>

      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {entry.testimony}
      </p>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border/40 pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatDate(entry.created_at)}
        </span>
        <span className="font-mono">CID {shortCid(entry.ipfs_cid, 8, 4)}</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="font-mono">
            {entry.lat.toFixed(3)}, {entry.lng.toFixed(3)}
          </span>
          <Button asChild size="sm" variant="outline" className="h-7">
            <Link href="/map">View on map</Link>
          </Button>
        </span>
      </div>
    </article>
  )
}