// Port of sohojatra/lib/sohojatra/ai.ts scoreUrgency — Bangla + English keywords
// for civic-memory testimonies and memorial urgency scoring.

const EN_KEYWORDS = [
  "urgent",
  "danger",
  "fire",
  "flood",
  "water",
  "corruption",
  "kill",
  "wound",
  "attack",
  "shelter",
  "hospital",
  "ambulance",
  "blood",
  "trapped",
  "missing",
]

const BN_KEYWORDS = [
  "জরুরি",
  "বিপদ",
  "আগুন",
  "বন্যা",
  "পানি",
  "দুর্নীতি",
  "হত্যা",
  "আহত",
  "আক্রমণ",
  "আশ্রয়",
  "হাসপাতাল",
  "অ্যাম্বুলেন্স",
  "রক্ত",
  "আটকে",
  "নিখোঁজ",
]

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export type UrgencyBreakdown = {
  total: number
  lengthScore: number
  keywordScore: number
  punctuationScore: number
  matchedKeywords: string[]
}

export function scoreUrgency(text = ""): UrgencyBreakdown {
  const words = wordCount(text)
  const lengthScore = clamp(words * 4, 0, 40)
  const lowered = text.toLowerCase()
  const matchedEn = EN_KEYWORDS.filter((k) => lowered.includes(k))
  const matchedBn = BN_KEYWORDS.filter((k) => text.includes(k))
  const keywordScore =
    matchedEn.length + matchedBn.length > 0
      ? clamp(30 + (matchedEn.length + matchedBn.length) * 5, 30, 55)
      : 10
  const punctuationScore = /[!।]/.test(text) ? 10 : 0
  const total = clamp(lengthScore + keywordScore + punctuationScore, 0, 100)
  return {
    total,
    lengthScore,
    keywordScore,
    punctuationScore,
    matchedKeywords: [...matchedEn, ...matchedBn],
  }
}