import { NextRequest, NextResponse } from "next/server"
import { generateTrustReport } from "@/lib/trust-engine"

interface AnalyzeRequestBody {
  inputType?: "news" | "claim" | "scam" | "video" | "text"
  text?: string
  mediaType?: "image" | "video"
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody
    let text = body.text?.trim() ?? ""

    if (!text) {
      text =
        body.mediaType === "video"
          ? "Video submitted for deepfake and misinformation analysis."
          : body.mediaType === "image"
            ? "Image submitted for visual authenticity and scam-pattern analysis."
            : ""
    }

    if (!text) {
      return NextResponse.json({ error: "Text input or media context is required for analysis." }, { status: 400 })
    }

    const report = await generateTrustReport({
      inputType: body.inputType ?? "text",
      text,
      mediaType: body.mediaType
    })

    return NextResponse.json({ report })
  } catch {
    return NextResponse.json({ error: "Unable to process request. Please try again." }, { status: 500 })
  }
}
