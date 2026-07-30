export type EvidenceVerdict = "supported" | "contradicted" | "not_enough_evidence"

export interface EvidenceItem {
  source: string
  title: string
  url: string
  snippet: string
  reliability: number
  stance: "supports" | "contradicts" | "neutral"
}

export interface ClaimAnalysis {
  claim: string
  verdict: EvidenceVerdict
  confidence: number
  evidence: EvidenceItem[]
}

export interface TrustReport {
  verifiedSummary: string
  trustScore: number
  biasScore: number
  scamProbability: number
  deepfakeScore: number
  overallRisk: "low" | "medium" | "high"
  actionableAdvice: string[]
  claims: ClaimAnalysis[]
}
