"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Archive,
  Download,
  FileWarning,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate, shortCid } from "@/lib/utils"
import { api, API_BASE, type VaultEntry, type VaultBytes } from "@/lib/api"

export function VaultClient() {
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [active, setActive] = useState<VaultBytes | null>(null)
  const [busyCid, setBusyCid] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<VaultEntry[]>("/api/v1/vault")
      setEntries(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vault fetch failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return entries
    return entries.filter(
      (e) =>
        e.cid.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.content_type.toLowerCase().includes(q),
    )
  }, [entries, search])

  async function open(cid: string) {
    setBusyCid(cid)
    setError(null)
    try {
      const { data } = await api.get<VaultBytes>(`/api/v1/vault/${cid}`)
      setActive(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed")
    } finally {
      setBusyCid(null)
    }
  }

  function downloadUrl(cid: string) {
    return `${API_BASE}/api/v1/vault/${cid}/raw`
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Archive className="size-5 text-primary" /> Vault index ·{" "}
            {entries.length} entries
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CID, name, MIME…"
                className="w-56 pl-8"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <p className="mb-3 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <FileWarning className="size-4" /> {error}
            </p>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">CID</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2 text-right">Size</th>
                  <th className="px-3 py-2">Added</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      No vault entries. Upload evidence on the Verify page first.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr
                      key={e.cid}
                      className={`border-t border-border transition-colors hover:bg-muted/30 ${
                        active?.cid === e.cid ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-3 py-2 font-medium">{e.name}</td>
                      <td className="px-3 py-2 font-mono text-xs">
                        {shortCid(e.cid, 10, 6)}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {e.content_type}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs">
                        {formatBytes(e.size)}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {formatDate(e.added_at)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void open(e.cid)}
                            disabled={busyCid === e.cid}
                            className="gap-1.5"
                          >
                            {busyCid === e.cid ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="size-3.5" />
                            )}
                            Inspect
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <a href={downloadUrl(e.cid)} download>
                              <Download className="size-3.5" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inspect entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!active && (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Select an entry from the index to view its bytes, verified hash,
              and preview if the type is an image or video.
            </p>
          )}

          {active && (
            <>
              <div className="rounded-md border border-border bg-card/60 p-3">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {active.integrity_ok ? (
                    <ShieldCheck className="size-4 text-emerald-500" />
                  ) : (
                    <ShieldAlert className="size-4 text-destructive" />
                  )}
                  {active.name}
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Detail label="CID" value={active.cid} mono />
                  <Detail label="Size" value={formatBytes(active.size)} mono />
                  <Detail label="Type" value={active.content_type} />
                  <Detail
                    label="Added"
                    value={new Date(active.added_at).toLocaleString()}
                  />
                  <Detail
                    label="SHA-256"
                    value={shortCid(active.sha256, 12, 8)}
                    mono
                  />
                  <Detail
                    label="Integrity"
                    value={active.integrity_ok ? "OK" : "MISMATCH"}
                  />
                </dl>
              </div>

              {active.content_type.startsWith("image/") && (
                <div className="overflow-hidden rounded-md border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={downloadUrl(active.cid)}
                    alt={active.name}
                    className="max-h-80 w-full object-contain bg-black"
                  />
                </div>
              )}

              {active.content_type.startsWith("video/") && (
                <video
                  controls
                  src={downloadUrl(active.cid)}
                  className="max-h-80 w-full rounded-md border border-border bg-black"
                />
              )}

              <Button asChild variant="outline" className="w-full">
                <a href={downloadUrl(active.cid)} download>
                  <Download className="mr-2 size-4" /> Download raw bytes
                </a>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={mono ? "font-mono text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  )
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}