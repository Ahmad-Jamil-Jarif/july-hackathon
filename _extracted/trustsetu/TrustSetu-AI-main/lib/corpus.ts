export interface SourceDoc {
  source: string
  title: string
  url: string
  text: string
  reliability: number
}

export const TRUSTED_SOURCES: SourceDoc[] = [
  {
    source: "WHO",
    title: "Climate change and health",
    url: "https://www.who.int/news-room/fact-sheets/detail/climate-change-and-health",
    reliability: 0.95,
    text: "Climate change affects health through heat stress, nutrition, and vector-borne disease patterns."
  },
  {
    source: "RBI",
    title: "RBI warns public against digital payment fraud",
    url: "https://www.rbi.org.in/",
    reliability: 0.94,
    text: "Banks and regulators repeatedly warn users not to share OTP, PIN, CVV, or remote access to devices."
  },
  {
    source: "CERT-In",
    title: "Advisory on social engineering scams",
    url: "https://www.cert-in.org.in/",
    reliability: 0.92,
    text: "Cyber scams often use urgency, spoofed identities, and malicious links to trigger fast action."
  },
  {
    source: "PIB Fact Check",
    title: "Fact-checking viral misinformation",
    url: "https://factcheck.pib.gov.in/",
    reliability: 0.9,
    text: "Viral claims on messaging apps are often manipulated or contextually false and should be verified."
  },
  {
    source: "UNESCO",
    title: "Disinformation and media literacy",
    url: "https://www.unesco.org/",
    reliability: 0.9,
    text: "Disinformation can influence public perception; critical source verification is required before sharing."
  },
  {
    source: "TrustSetu — Media literacy",
    title: "Synthetic media and deepfakes",
    url: "https://www.unesco.org/en/artificial-intelligence",
    reliability: 0.88,
    text: "Synthetic media and deepfakes can appear authentic; verify provenance, timestamps, and independent outlets before sharing."
  }
]

export interface CorpusChunk {
  id: string
  text: string
  source: string
  title: string
  url: string
  reliability: number
}

export function buildCorpusChunks(): CorpusChunk[] {
  const chunks: CorpusChunk[] = []
  for (const doc of TRUSTED_SOURCES) {
    const parts = doc.text.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter((p) => p.length > 8)
    const bodies = parts.length ? parts : [doc.text]
    bodies.forEach((body, i) => {
      chunks.push({
        id: `${doc.source}-${i}`,
        text: body,
        source: doc.source,
        title: doc.title,
        url: doc.url,
        reliability: doc.reliability
      })
    })
  }
  return chunks
}
