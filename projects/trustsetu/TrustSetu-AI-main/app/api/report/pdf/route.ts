import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import type { TrustReport } from "@/lib/trust-types"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { report?: TrustReport }
    const report = body.report
    if (!report?.verifiedSummary) {
      return NextResponse.json({ error: "Missing report payload." }, { status: 400 })
    }

    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const pageW = doc.internal.pageSize.getWidth()
    let y = 48
    const margin = 48
    const lineH = 16
    const maxW = pageW - margin * 2

    const addLine = (text: string, size = 11, bold = false) => {
      doc.setFontSize(size)
      if (bold) doc.setFont("helvetica", "bold")
      else doc.setFont("helvetica", "normal")
      const lines = doc.splitTextToSize(text, maxW) as string[]
      for (const ln of lines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(ln, margin, y)
        y += lineH
      }
    }

    addLine("TrustSetu — Trust Report", 18, true)
    addLine(`Generated: ${new Date().toISOString()}`, 9)
    y += 8
    addLine("Verified summary", 13, true)
    addLine(report.verifiedSummary)
    y += 8
    addLine("Scores", 13, true)
    addLine(
      `Trust: ${report.trustScore}%  |  Bias: ${report.biasScore}%  |  Scam: ${report.scamProbability}%  |  Deepfake: ${report.deepfakeScore}%  |  Risk: ${report.overallRisk}`
    )
    y += 8
    addLine("Actionable advice", 13, true)
    report.actionableAdvice.forEach((a, i) => addLine(`${i + 1}. ${a}`))
    y += 8
    addLine("Claim verification", 13, true)
    report.claims.forEach((c, i) => {
      addLine(`${i + 1}. [${c.verdict.replaceAll("_", " ")}] ${c.claim}`)
      const ev = c.evidence[0]
      if (ev) addLine(`   Evidence: ${ev.source} — ${ev.url}`, 10)
      y += 4
    })

    const out = doc.output("arraybuffer")
    return new NextResponse(out, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="trustsetu-report.pdf"'
      }
    })
  } catch {
    return NextResponse.json({ error: "Could not generate PDF." }, { status: 500 })
  }
}
