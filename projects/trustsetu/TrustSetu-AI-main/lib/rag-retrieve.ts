import { BM25Index } from "@/lib/bm25"
import { buildCorpusChunks, type CorpusChunk } from "@/lib/corpus"
import type { EvidenceItem } from "@/lib/trust-types"
import { faissRemoteSearch } from "@/lib/faiss-remote"
import { fetchNewsApiEvidence } from "@/lib/web-evidence"

let cachedChunks: CorpusChunk[] | null = null
let cachedBm25: BM25Index | null = null

function getIndex(): { chunks: CorpusChunk[]; bm25: BM25Index } {
  if (!cachedChunks || !cachedBm25) {
    cachedChunks = buildCorpusChunks()
    cachedBm25 = new BM25Index(cachedChunks.map((c) => c.text))
  }
  return { chunks: cachedChunks, bm25: cachedBm25 }
}

const tokenOverlapStance = (claim: string, snippet: string): EvidenceItem["stance"] => {
  const c = new Set((claim.toLowerCase().match(/[a-z0-9]+/g) ?? []).slice(0, 40))
  const s = new Set(snippet.toLowerCase().match(/[a-z0-9]+/g) ?? [])
  if (!c.size || !s.size) return "neutral"
  let o = 0
  c.forEach((t) => {
    if (s.has(t)) o += 1
  })
  const ratio = o / c.size
  if (ratio > 0.22) return "supports"
  if (ratio < 0.06) return "contradicts"
  return "neutral"
}

function chunkToEvidence(chunk: CorpusChunk, claim: string): EvidenceItem {
  return {
    source: chunk.source,
    title: chunk.title,
    url: chunk.url,
    snippet: chunk.text,
    reliability: chunk.reliability,
    stance: tokenOverlapStance(claim, chunk.text)
  }
}

function dedupe(items: EvidenceItem[]): EvidenceItem[] {
  const seen = new Set<string>()
  const out: EvidenceItem[] = []
  for (const it of items) {
    const k = it.url
    if (seen.has(k)) continue
    seen.add(k)
    out.push(it)
  }
  return out
}

export async function retrieveEvidenceForClaim(claim: string, topK = 5): Promise<EvidenceItem[]> {
  const { chunks, bm25 } = getIndex()
  const faissHits = await faissRemoteSearch(claim, topK)
  const newsHits = await fetchNewsApiEvidence(claim, 4)

  const bmHits = bm25.search(claim, topK)
  const fromBm: EvidenceItem[] = bmHits.map((h) => chunkToEvidence(chunks[h.index], claim))

  const merged = dedupe([...(faissHits ?? []), ...fromBm, ...newsHits])

  const rescored = merged.map((ev) => ({
    ...ev,
    stance: tokenOverlapStance(claim, ev.snippet)
  }))

  rescored.sort((a, b) => b.reliability - a.reliability)
  return rescored.slice(0, topK)
}
