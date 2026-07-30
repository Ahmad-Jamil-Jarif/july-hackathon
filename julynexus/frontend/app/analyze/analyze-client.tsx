"use client"

import { useState } from "react"
import {
  ScanSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Scale,
  ShieldAlert,
  Activity,
  Download,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrustGauge } from "@/components/trust-gauge"
import { scoreUrgency } from "@/lib/urgency"
import { api, type AnalyzeResponse } from "@/lib/api"

const SAMPLE = "Breaking: mobile internet restored nationwide after 36 hours. Opposition claims curfew imposed in 12 districts. Citizens report peaceful vigils."

export function AnalyzeClient() {
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportUrl, setReportUrl] = useState<string | null>(null)

  const urgency = scoreUrgency(text)

  async function analyze() {
    if (!text.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const { data } = await api.post<AnalyzeResponse>("/api/v1/analyze", {
        text,
      })
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setBusy(false)
    }
  }

  async function generateReport() {
    if (!result || reportLoading) return
    setReportLoading(true)
    try {
      // We need to send the same analysis request to the report endpoint
      // But we can reuse the result? The report endpoint expects an AnalyzeRequest.
      // We'll send the same text and inputType/mediaType from the original request.
      // However, we don't have the original request stored. We'll approximate by
      // sending a request with the same text and default inputType/mediaType.
      // Alternatively, we can change the backend to accept an AnalyzeResponse.
      // For simplicity, we'll just call the analyze endpoint again and then generate the report.
      // But that would be wasteful. Instead, let's change the backend to accept the analysis.
      // Given time, we'll do a simple approach: we'll call the analyze endpoint and then
      // immediately call the report endpoint with the same parameters.
      // We don't have the original inputType and mediaType stored. We'll assume they are
      // the defaults: inputType: "text", mediaType: undefined.
      // We'll create a request object from the current text and default values.
      const requestData = {
        text,
        // We don't have inputType and mediaType from the UI, so we'll use defaults.
        // In a real app, we would store these.
        inputType: "text" as const,
        mediaType: undefined,
      }
      const { data } = await api.post<Blob>("/api/v1/report/generate", requestData, {
        responseType: "blob",
      })
      // Create a URL for the blob
      const url = URL.createObjectURL(data)
      setReportUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate report")
    } finally {
      setReportLoading(false)
    }
  }

  function downloadReport() {
    if (reportUrl) {
      const link = document.createElement("a")
      link.href = reportUrl
      link.download = "trust_report.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Revoke the object URL
      URL.revokeObjectURL(reportUrl)
      setReportUrl(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScanSearch className="size-5 text-primary" />
            Input text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the message, post, or caption to analyze…"
            rows={10}
          />

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{text.length} chars</span>
            {urgency.matchedKeywords.length > 0 && (
              <span className="flex flex-wrap gap-1">
                {urgency.matchedKeywords.slice(0, 4).map((k) => (
                  <Badge key={k} variant="warning">
                    {k}
                  </Badge>
                ))}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setText(SAMPLE)}
              disabled={busy}
            >
              Load sample
            </Button>
            <Button variant="outline" size="sm" onClick={() => setText("")} disabled={busy}>
              Clear
            </Button>
            <Button onClick={() => void analyze()} disabled={busy || !text.trim()}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Analyze"}
            </Button>
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="size-4" /> {error}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {!result && !busy && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              The analyzer decomposes text into atomic claims, scores trust on a
              0–100 scale, and flags scam / bias indicators. Results stream
              inline as soon as the first claim is grounded.
            </CardContent>
          </Card>
        )}

        {busy && (
          <Card>
            <CardContent className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Decompressing claims, grounding evidence…
            </CardContent>
          </Card>
        )}

        {result && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overall trust</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <TrustGauge value={result.trust_score} />
                <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                  <Metric icon={<ShieldAlert className="size-3.5" />} label="Risk" value={result.overall_risk} />
                  <Metric icon={<Activity className="size-3.5" />} label="Deepfake" value={`${Math.round(result.deepfake_score * 100)}%`} />
                  <Metric icon={<Scale className="size-3.5" />} label="Bias" value={`${Math.round(result.bias_score * 100)}%`} />
                  <Metric icon={<AlertTriangle className="size-3.5" />} label="Scam" value={`${Math.round(result.scam_probability * 100)}%`} />
                </div>
                {/* Report generation button */}
                <div className="flex items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await generateReport()
                    }}
                    disabled={reportLoading}
                  >
                    {reportLoading ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <>
                        <Download className="size-3" />
                        <span>Generate PDF Report</span>
                      </>
                    )}
                  </Button>
                  {reportUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadReport}
                    >
                      <Download className="size-3" />
                      <span>Download Report</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {result?.claims?.length ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Claim verdicts · {result.claims.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.claims.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                >
                  <VerdictIcon verdict={c.verdict} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{c.text}</p>
                    {c.rationale && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.rationale}
                      </p>
                    )}
                    {!!c.evidence?.length && (
                      <ul className="mt-2 space-y-1 text-xs">
                        {c.evidence.slice(0, 2).map((e, j) => (
                          <li key={j} className="flex gap-2 text-muted-foreground">
                            <span className="text-primary">→</span>
                            <span className="line-clamp-2">{e}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Badge
                    variant={
                      c.verdict === "SUPPORTED"
                        ? "success"
                        : c.verdict === "REFUTED"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {c.verdict}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "SUPPORTED")
    return <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
  if (verdict === "REFUTED")
    return <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
  return <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-md border border-border/60 p-2">
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  )
}