"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
  Database,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { bdt, formatDate, shortCid } from "@/lib/utils"
import { api, type AidLedgerRow, type ChainVerifyResponse } from "@/lib/api"

type Filter = "all" | "register" | "disburse" | "verify"

export function LedgerExplorer() {
  const [rows, setRows] = useState<AidLedgerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [verifyHash, setVerifyHash] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<ChainVerifyResponse | null>(null)
  const [verifying, setVerifying] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<AidLedgerRow[]>("/api/v1/aid/ledger")
      setRows(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ledger fetch failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter((r) => {
      const matchesType = filter === "all" || r.event_type === filter
      const matchesQuery =
        !q ||
        r.family_id.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.tx_hash.toLowerCase().includes(q)
      return matchesType && matchesQuery
    })
  }, [rows, filter, search])

  async function verifyRow(hash: string) {
    setVerifyHash(hash)
    setVerifying(true)
    setVerifyResult(null)
    try {
      const { data } = await api.get<ChainVerifyResponse>(
        `/api/v1/aid/ledger/${hash}/verify`,
      )
      setVerifyResult(data)
    } catch (e) {
      setVerifyResult({
        valid: false,
        reason: e instanceof Error ? e.message : "verify failed",
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="size-5 text-primary" />
          Public Aid Ledger
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search family, district, hash…"
              className="w-56 pl-8"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCw className="size-3.5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "register", "disburse", "verify"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Family</th>
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2 text-right">Amount</th>
                <th className="px-3 py-2">Hash</th>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No ledger entries match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.tx_hash}
                    className={`border-t border-border transition-colors hover:bg-muted/30 ${
                      verifyHash === r.tx_hash ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2">
                      <Badge
                        variant={
                          r.event_type === "disburse"
                            ? "default"
                            : r.event_type === "register"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {r.event_type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-medium">{r.family_id}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.district}</td>
                    <td className="px-3 py-2 text-right font-mono">{bdt(r.amount_bdt)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{shortCid(r.tx_hash, 10, 6)}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {formatDate(r.timestamp)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void verifyRow(r.tx_hash)}
                        disabled={verifying && verifyHash === r.tx_hash}
                        className="gap-1.5"
                      >
                        <ShieldCheck className="size-3.5" /> Verify
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {verifyHash && (
          <div className="rounded-lg border border-border bg-card/60 p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {verifyResult?.valid ? (
                  <ShieldCheck className="size-4 text-emerald-500" />
                ) : (
                  <ShieldAlert className="size-4 text-destructive" />
                )}
                Chain verification · <code className="font-mono text-xs">{shortCid(verifyHash, 10, 6)}</code>
              </p>
              <Button variant="ghost" size="sm" onClick={() => setVerifyHash(null)}>
                Close
              </Button>
            </div>
            {verifying ? (
              <p className="mt-2 text-xs text-muted-foreground">Verifying on chain…</p>
            ) : verifyResult ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs md:grid-cols-3">
                <Item
                  label="Valid"
                  value={verifyResult.valid ? "Yes" : "No"}
                  tone={verifyResult.valid ? "success" : "destructive"}
                />
                <Item label="Block" value={String(verifyResult.block_height ?? "—")} mono />
                <Item label="Confirmed" value={String(verifyResult.confirmations ?? "—")} mono />
                <Item label="Reason" value={verifyResult.reason ?? "—"} />
              </dl>
            ) : null}
            <a
              href={`https://explorer.example/tx/${verifyHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View in block explorer <ExternalLink className="size-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Item({
  label,
  value,
  mono,
  tone,
}: {
  label: string
  value: string
  mono?: boolean
  tone?: "success" | "destructive"
}) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "font-mono text-foreground"
            : tone === "success"
              ? "font-semibold text-emerald-600"
              : tone === "destructive"
                ? "font-semibold text-destructive"
                : "text-foreground"
        }
      >
        {value}
      </dd>
    </div>
  )
}