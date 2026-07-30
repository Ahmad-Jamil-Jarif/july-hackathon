import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export const api = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response) {
      const detail = err.response.data?.detail ?? err.response.data?.error
      if (detail) {
        err.message =
          typeof detail === "string" ? detail : JSON.stringify(detail)
      }
    }
    return Promise.reject(err)
  },
)

export const API_BASE = baseURL

// ----- typed endpoint helpers -----

export type ClaimVerdict = {
  text: string
  verdict: "SUPPORTED" | "REFUTED" | "INSUFFICIENT" | string
  rationale?: string
  evidence?: string[]
  confidence?: number
}

export type AnalyzeResponse = {
  deepfake_score: number
  bias_score: number
  scam_probability: number
  trust_score: number
  overall_risk: "low" | "medium" | "high" | string
  claims: ClaimVerdict[]
}

export type VerifyImageResponse = {
  cid: string
  is_verified: boolean
  is_duplicate: boolean
  original_cid?: string
  deepfake_score: number
  exif?: {
    camera?: string
    captured_at?: string
    gps_lat?: number
    gps_lng?: number
  } | null
  tamper_flags: string[]
}

export type VerifyVideoResponse = {
  cid: string
  is_verified: boolean
  is_duplicate: boolean
  original_cid?: string
  deepfake_score: number
  exif?: Record<string, unknown> | null
  tamper_flags: string[]
  frames_analyzed: number
  duration_sec: number
}

export type MemorialEntry = {
  id: string
  name: string
  district: string
  lat: number
  lng: number
  testimony: string
  ipfs_cid: string
  created_at: string
}

export type VaultEntry = {
  cid: string
  name: string
  content_type: string
  size: number
  sha256: string
  added_at: string
}

export type VaultBytes = VaultEntry & {
  bytes_b64?: string
  integrity_ok: boolean
}

export type AidRegisterResponse = {
  id: string
  family_id: string
  status: string
  amount_bdt: number
  hash: string
  created_at: string
}

export type AidDisburseResponse = {
  id: string
  tx_hash: string
  amount_bdt: number
  block_height: number
  verifier?: string
  signed_at: string
}

export type AidLedgerRow = {
  id: string
  family_id: string
  district: string
  event_type: "register" | "disburse" | "verify" | string
  amount_bdt: number
  tx_hash: string
  timestamp: string
}

export type ChainVerifyResponse = {
  valid: boolean
  reason?: string
  block_height?: number
  confirmations?: number
}

export type KioskEvent = {
  id: string
  device_id: string
  event_type: string
  payload: Record<string, unknown>
  buffered_at: string
  synced_at: string
}

export type DashboardKpi = {
  verified_media: number
  aid_disbursed_bdt: number
  memorial_entries: number
  kiosk_events_24h: number
  ledger_ok: boolean
  ledger_length: number
}