import type { EvidenceItem } from "@/lib/trust-types"

interface NewsApiArticle {
  source?: { name?: string }
  title?: string
  description?: string
  url?: string
}

interface NewsApiResponse {
  articles?: NewsApiArticle[]
  status?: string
}

export async function fetchNewsApiEvidence(query: string, limit = 4): Promise<EvidenceItem[]> {
  const key = process.env.NEWS_API_KEY?.trim()
  if (!key) return []

  const q = encodeURIComponent(query.slice(0, 200))
  const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=relevancy&pageSize=${limit}&apiKey=${key}`

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12_000) })
    if (!res.ok) return []
    const data = (await res.json()) as NewsApiResponse
    if (data.status !== "ok" || !data.articles?.length) return []

    return data.articles
      .filter((a) => a.url && (a.title || a.description))
      .map((a) => {
        const snippet = [a.title, a.description].filter(Boolean).join(" — ").slice(0, 400)
        return {
          source: a.source?.name ?? "News",
          title: a.title ?? "Article",
          url: a.url as string,
          snippet,
          reliability: 0.72,
          stance: "neutral" as const
        }
      })
  } catch {
    return []
  }
}
