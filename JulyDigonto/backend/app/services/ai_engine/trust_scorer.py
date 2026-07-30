"""Python port of trustsetu/lib/trust-engine.ts.

Provides a self-contained, deterministic scoring function that maps a piece
of free-text content to:
  - deepfake_score, bias_score, scam_probability
  - trust_score (0..100), overall_risk
  - list of (claim, verdict) for the canned July Uprising corpus

Pattern source: trustsetu/TrustSetu-AI-main/lib/trust-engine.ts (adapted).
"""
from __future__ import annotations

import re
from typing import Literal

from ...schemas import AnalyzeRequest, AnalyzeResponse, ClaimVerdict


# Translated from trust-engine.ts:SCAM_PATTERNS
SCAM_PATTERNS: list[str] = [
    r"\bclick here\b",
    r"\bact now\b",
    r"\blimited time\b",
    r"\bguaranteed (return|profit)\b",
    r"\bdouble your (money|crypto)\b",
    r"\bfree (iphone|laptop|gift)\b",
    r"\bwire transfer\b",
    r"\bsend (me |us )?(money|gift cards?)\b",
    r"\bverify your (account|wallet)\b",
    r"\bseed phrase\b",
]

# Translated from trust-engine.ts:BIAS_TERMS
BIAS_TERMS: list[str] = [
    "always", "never", "everyone", "nobody",
    "they all", "those people", "infiltrators", "traitors",
    "goons", "terrorists", "anti-national",
]

# Canned 12-topic July Uprising corpus (titles only used for matching)
EVIDENCE_CORPUS: dict[str, list[str]] = {
    "shaheed_minar": [
        "Shaheed Minar is a national monument in Dhaka built in 1952.",
        "It commemorates the Language Movement martyrs of 21 February 1952.",
    ],
    "quota_movement": [
        "The 2024 quota reform movement demanded reform of government job quotas.",
        "It led to the Supreme Court verdict scaling back quota percentages.",
    ],
    "internet_blackout": [
        "Bangladesh experienced mobile internet shutdowns during July 2024.",
        "Internet shutdowns were confirmed by NetBlocks and Access Now reports.",
    ],
    "missing_persons": [
        "Families reported missing relatives after the July 2024 crackdown.",
        "Ain o Salish Kendra and Odhikar documented enforced disappearances.",
    ],
    "fabricated_death_toll": [
        "The official death toll of July 2024 was contested by civil society.",
        "Independent counts ranged from the low hundreds to over a thousand.",
    ],
    "free_fire_ban": [
        "Free Fire and other games were briefly restricted during July 2024.",
        "The game ban was lifted after public backlash and legal challenges.",
    ],
    "hartal": [
        "Hartals were called by opposition groups to protest killings.",
        "Two-day and three-day nationwide hartals were observed in late July.",
    ],
    "blockade": [
        "Blockade programmes disrupted highways and transport in late July.",
        "Government condemned blockades as economic sabotage.",
    ],
    "victim_compensation": [
        "The government announced BDT 20 lakh compensation for each martyr.",
        "Disbursement of compensation funds was tracked by civil society.",
    ],
    "press_freedom": [
        "Reporters Without Borders documented press restrictions in July 2024.",
        "Several journalists were detained or had credentials revoked.",
    ],
    "student_leaders": [
        "Student coordinators organized the central protests via social media.",
        "Nahid Islam and Asif Mahmud were among the prominent coordinators.",
    ],
    "international_solidarity": [
        "UN human rights office called for an independent investigation.",
        "South Asian neighbours expressed concern over the violence.",
    ],
}

_RISK_HIGH = 60.0
_RISK_MEDIUM = 30.0


def _pattern_hits(text: str, patterns: list[str]) -> int:
    lowered = text.lower()
    hits = 0
    for p in patterns:
        if re.search(p, lowered, flags=re.IGNORECASE):
            hits += 1
    return hits


def _bias_score(text: str) -> float:
    lowered = text.lower()
    hits = sum(1 for term in BIAS_TERMS if term in lowered)
    return min(1.0, hits / 4.0)


def _scam_probability(text: str) -> float:
    hits = _pattern_hits(text, SCAM_PATTERNS)
    return min(1.0, hits / 3.0)


def split_claims(text: str) -> list[str]:
    """Naive sentence-level claim splitter."""
    if not text:
        return []
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [p.strip() for p in parts if len(p.strip()) > 8][:8]


def get_claim_verdict(claim: str) -> tuple[Literal["supported", "contradicted", "not_enough_evidence"], float, str]:
    """Match a claim against the canned July Uprising corpus."""
    lowered = claim.lower()
    for topic, evidence in EVIDENCE_CORPUS.items():
        if topic.replace("_", " ") in lowered or any(word in lowered for word in topic.split("_")):
            confidence = 0.78
            return "supported", confidence, f"matches corpus topic '{topic}'"
    if any(flag in lowered for flag in ("100% verified", "trust me bro", "trust me 100", "i swear it is true")):
        return "contradicted", 0.7, "unverifiable certainty claim"
    if any(flag in lowered for flag in ("fake news", "hoax", "rumor", "rumour")):
        return "not_enough_evidence", 0.5, "meta-claim about misinformation; needs source"
    return "not_enough_evidence", 0.35, "no matching evidence topic"


def score_trust_report(
    input_type: str,
    text: str,
    media_type: str,
    *,
    deepfake_score: float = 0.0,
) -> AnalyzeResponse:
    """Public entry point — mirrors TrustSetu's scoreTrustReport signature."""
    scam = _scam_probability(text)
    bias = _bias_score(text)
    trust = max(0.0, min(100.0, 100.0 - 35.0 * scam - 25.0 * bias - 20.0 * deepfake_score))

    if trust >= 80:
        risk: Literal["low", "medium", "high"] = "low"
    elif trust >= 55:
        risk = "medium"
    else:
        risk = "high"

    claims_in = split_claims(text)
    claim_models: list[ClaimVerdict] = []
    for c in claims_in:
        verdict, conf, rationale = get_claim_verdict(c)
        claim_models.append(ClaimVerdict(claim=c, verdict=verdict, confidence=conf, rationale=rationale))

    return AnalyzeResponse(
        deepfake_score=deepfake_score,
        bias_score=round(bias, 4),
        scam_probability=round(scam, 4),
        trust_score=round(trust, 2),
        overall_risk=risk,
        claims=claim_models,
    )


def score_from_request(req: AnalyzeRequest, deepfake_score: float = 0.0) -> AnalyzeResponse:
    return score_trust_report(req.inputType, req.text, req.mediaType, deepfake_score=deepfake_score)