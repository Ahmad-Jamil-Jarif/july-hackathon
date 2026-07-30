import { retrieveEvidenceForClaim } from "@/lib/rag-retrieve"
import type { ClaimAnalysis, EvidenceItem, EvidenceVerdict, TrustReport } from "@/lib/trust-types"

export type { ClaimAnalysis, EvidenceItem, EvidenceVerdict, TrustReport } from "@/lib/trust-types"

const SCAM_PATTERNS = [
  /\b(otp|pin|cvv|password)\b/i,
  /\b(click here|urgent|act now|limited time)\b/i,
  /\b(bank account blocked|kyc update)\b/i,
  /\b(prize|lottery|won)\b/i,
  /\b(bitcoin|crypto investment guaranteed)\b/i
]

const BIAS_TERMS = [
  "always",
  "never",
  "everyone knows",
  "obviously",
  "traitor",
  "anti-national",
  "fake media",
  "100% true",
  "shocking truth"
]

const splitClaims = (text: string): string[] => {
  return text
    .split(/[\n.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20)
    .slice(0, 8)
}

const getClaimVerdict = (evidence: EvidenceItem[]): { verdict: EvidenceVerdict; confidence: number } => {
  const support = evidence.filter((item) => item.stance === "supports").length
  const contradict = evidence.filter((item) => item.stance === "contradicts").length
  const confidence = Math.min(
    98,
    Math.max(
      35,
      Math.round(
        evidence.reduce((sum, item) => sum + item.reliability, 0) * 30 + support * 12 - contradict * 8
      )
    )
  )

  if (support >= 2) return { verdict: "supported", confidence }
  if (contradict >= 2) return { verdict: "contradicted", confidence: Math.max(30, confidence - 12) }
  return { verdict: "not_enough_evidence", confidence: Math.max(25, confidence - 8) }
}

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const computeBiasScore = (input: string): number => {
  const lowered = input.toLowerCase()
  const hits = BIAS_TERMS.filter((term) => lowered.includes(term)).length
  const exclamations = (input.match(/!/g) ?? []).length
  return clampScore(12 + hits * 15 + exclamations * 2)
}

const computeScamProbability = (input: string): number => {
  const hits = SCAM_PATTERNS.reduce((count, pattern) => count + (pattern.test(input) ? 1 : 0), 0)
  const hasLink = /(http[s]?:\/\/|bit\.ly|tinyurl)/i.test(input)
  return clampScore(8 + hits * 18 + (hasLink ? 10 : 0))
}

const computeDeepfakeScore = (mediaType?: string, text?: string): number => {
  const keywordBoost = /(deepfake|ai generated|face swap|synthetic media)/i.test(text ?? "") ? 35 : 0
  const mediaBoost = mediaType === "video" ? 32 : mediaType === "image" ? 18 : 5
  return clampScore(10 + mediaBoost + keywordBoost)
}

export async function generateTrustReport(payload: {
  inputType: "news" | "claim" | "scam" | "video" | "text"
  text: string
  mediaType?: "image" | "video"
}): Promise<TrustReport> {
  let claims = splitClaims(payload.text)
  if (!claims.length && payload.text.trim().length > 0) {
    claims = [payload.text.trim().slice(0, 2000)]
  }
  const claimAnalyses: ClaimAnalysis[] = []

  for (const claim of claims) {
    const evidence = await retrieveEvidenceForClaim(claim, 5)
    const { verdict, confidence } = getClaimVerdict(evidence)
    claimAnalyses.push({ claim, verdict, confidence, evidence })
  }

  const supportedCount = claimAnalyses.filter((c) => c.verdict === "supported").length
  const contradictedCount = claimAnalyses.filter((c) => c.verdict === "contradicted").length
  const noEvidenceCount = claimAnalyses.filter((c) => c.verdict === "not_enough_evidence").length

  const biasScore = computeBiasScore(payload.text)
  const scamProbability = computeScamProbability(payload.text)
  const deepfakeScore = computeDeepfakeScore(payload.mediaType, payload.text)

  const baseTrust =
    70 +
    supportedCount * 7 -
    contradictedCount * 14 -
    noEvidenceCount * 6 -
    biasScore * 0.25 -
    scamProbability * 0.28 -
    deepfakeScore * 0.18

  const trustScore = clampScore(baseTrust)
  const overallRisk: "low" | "medium" | "high" =
    trustScore >= 70 ? "low" : trustScore >= 45 ? "medium" : "high"

  const actionableAdvice: string[] = []
  if (scamProbability >= 50) actionableAdvice.push("Do not click unknown links or share OTP, PIN, or banking credentials.")
  if (deepfakeScore >= 55) actionableAdvice.push("Run frame-level verification and reverse image/video checks before sharing.")
  if (biasScore >= 50) actionableAdvice.push("Read at least two independent sources to reduce narrative bias.")
  if (contradictedCount > 0) actionableAdvice.push("Treat contradicted claims as unverified until stronger evidence appears.")
  if (actionableAdvice.length === 0) actionableAdvice.push("Content appears relatively safe, but still validate before forwarding.")

  const verifiedSummary = `Processed ${claimAnalyses.length} claims. ${supportedCount} supported, ${contradictedCount} contradicted, and ${noEvidenceCount} with limited evidence. Risk is ${overallRisk} with trust score ${trustScore}/100.`

  return {
    verifiedSummary,
    trustScore,
    biasScore,
    scamProbability,
    deepfakeScore,
    overallRisk,
    actionableAdvice,
    claims: claimAnalyses
  }
}
