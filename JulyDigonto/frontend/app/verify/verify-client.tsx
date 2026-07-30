"use client"

import { useState } from "react"
import {
  ShieldCheck,
  ShieldAlert,
  CircleAlert,
  Loader2,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  Film,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeepfakeGauge } from "@/components/deepfake-gauge"
import { UploadZone } from "@/components/upload-zone"
import { shortCid } from "@/lib/utils"
import { api, type VerifyImageResponse, type VerifyVideoResponse } from "@/lib/api"

type MediaKind = "image" | "video"
type VerifyResult = VerifyImageResponse | VerifyVideoResponse

function isVideoResult(r: VerifyResult): r is VerifyVideoResponse {
  return "frames_analyzed" in r
}

export function VerifyClient() {
  const [kind, setKind] = useState<MediaKind>("image")
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const endpoint =
        kind === "image" ? "/api/v1/verify" : "/api/v1/verify/video"
      const { data } = await api.post<VerifyResult>(endpoint, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (ev) => {
          if (!ev.total) return
          setProgress(Math.round((ev.loaded / ev.total) * 100))
        },
      })
      setResult(data)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Verification failed"
      setError(msg)
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  function copy(text: string, id: string) {
    void navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Left: upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {kind === "image" ? (
              <ImageIcon className="size-5 text-primary" />
            ) : (
              <Film className="size-5 text-primary" />
            )}
            Upload {kind}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setKind("image")}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                kind === "image"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <ImageIcon className="size-3.5" /> Photo
            </button>
            <button
              type="button"
              onClick={() => setKind("video")}
              className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                kind === "video"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Film className="size-3.5" /> Video
            </button>
          </div>

          <UploadZone
            accept={kind === "image" ? "image/*" : "video/*"}
            onFile={handleFile}
            hint={kind === "image" ? "PNG, JPG, WEBP" : "MP4, MOV, AVI"}
          />

          {error && (
            <p className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <CircleAlert className="size-4" /> {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Right: result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {result ? (
              result.is_verified ? (
                <ShieldCheck className="size-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="size-5 text-destructive" />
              )
            ) : (
              <ShieldCheck className="size-5 text-primary" />
            )}
            Verification result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !busy && (
            <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Upload a file to receive a deepfake score, EXIF summary, and IPFS
              CID. Results are anchored to the public ledger automatically.
            </p>
          )}

          {busy && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" /> Analyzing…
            </p>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={result.is_verified ? "success" : "destructive"}>
                  {result.is_verified ? "VERIFIED" : "TAMPERED"}
                </Badge>
                {result.is_duplicate && (
                  <Badge variant="warning">Duplicate</Badge>
                )}
                {isVideoResult(result) && (
                  <Badge variant="outline">
                    {result.frames_analyzed} frames
                  </Badge>
                )}
              </div>

              <DeepfakeGauge value={result.deepfake_score} />

              <div className="grid gap-2 text-sm">
                <Row label="CID" value={result.cid} mono copyId="cid" onCopy={copy} copied={copied} />
                {result.original_cid && (
                  <Row
                    label="Original CID"
                    value={result.original_cid}
                    mono
                    copyId="orig"
                    onCopy={copy}
                    copied={copied}
                  />
                )}
                {result.exif && (
                  <Row
                    label="Camera"
                    value={
                      typeof result.exif.camera === "string"
                        ? result.exif.camera
                        : "—"
                    }
                  />
                )}
                {(() => {
                  const capturedAt = result.exif?.captured_at
                  if (typeof capturedAt !== "string" && typeof capturedAt !== "number") {
                    return null
                  }
                  return (
                    <Row
                      label="Captured"
                      value={new Date(String(capturedAt)).toLocaleString()}
                    />
                  )
                })()}
                {isVideoResult(result) && (
                  <Row
                    label="Duration"
                    value={`${result.duration_sec.toFixed(1)}s`}
                  />
                )}
              </div>

              {!!result.tamper_flags?.length && (
                <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                    <CircleAlert className="size-3.5" /> Tamper flags
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs text-amber-700">
                    {result.tamper_flags.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({
  label,
  value,
  mono,
  copyId,
  onCopy,
  copied,
}: {
  label: string
  value: string
  mono?: boolean
  copyId?: string
  onCopy?: (text: string, id: string) => void
  copied?: string | null
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5 text-sm">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2">
        <span className={mono ? "font-mono text-xs" : "text-foreground"}>
          {mono ? shortCid(value, 10, 6) : value}
        </span>
        {copyId && onCopy && (
          <button
            type="button"
            onClick={() => onCopy(value, copyId)}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {copied === copyId ? (
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        )}
      </span>
    </div>
  )
}