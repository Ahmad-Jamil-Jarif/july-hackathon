import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(input: string | Date | null | undefined): string {
  if (!input) return "—"
  const d = typeof input === "string" ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function shortCid(cid: string, lead = 8, tail = 6): string {
  if (!cid) return ""
  if (cid.length <= lead + tail + 3) return cid
  return `${cid.slice(0, lead)}…${cid.slice(-tail)}`
}

export function bdt(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", { maximumFractionDigits: 0 })}`
}