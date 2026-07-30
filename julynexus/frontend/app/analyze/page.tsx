import type { Metadata } from "next"

import { AnalyzeClient } from "./analyze-client"

export const metadata: Metadata = {
  title: "Analyze Claims · JulyNexus",
  description:
    "Decompose text into atomic claims, check for bias, scam probability, and run fact verification against grounded evidence.",
}

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Step 2 · Analyze</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Decompose &amp; fact-check text
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Paste a message, social post, or news caption. We split it into
          atomic claims, score trust, flag scam indicators, and surface grounded
          evidence for each claim.
        </p>
      </header>
      <AnalyzeClient />
    </div>
  )
}