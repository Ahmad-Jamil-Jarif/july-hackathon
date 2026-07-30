import type { EvidenceItem } from "@/lib/trust-types"

interface RemoteHit {
  text?: string
  source?: string
  title?: string
  url?: string
  reliability?: number
  score?: number
}

export async function faissRemoteSearch(claim: string, k = 5): Promise<EvidenceItem[] | null> {
  const base = process.env.FAISS_SERVICE_URL?.replace(/\/$/, "")
  if (!base) return null

  try {
    const res = await fetch(`${base}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: claim, k }),
      signal: AbortSignal.timeout(10_000)
    })
    if (!res.ok) return null
    const data = (await res.json()) as { results?: RemoteHit[] }
    const hits = data.results ?? []
    return hits
      .filter((h) => h.text && h.url)
      .map((h) => ({
        source: h.source ?? "FAISS index",
        title: h.title ?? "Retrieved passage",
        url: h.url as string,
        snippet: (h.text as string).slice(0, 400),
        reliability: typeof h.reliability === "number" ? h.reliability : 0.82,
        stance: "neutral" as const
      }))
  } catch {
    return null
  }
}
