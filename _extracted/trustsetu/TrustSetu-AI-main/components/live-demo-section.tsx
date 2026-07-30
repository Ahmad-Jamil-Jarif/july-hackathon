"use client"

import { useState, useRef, forwardRef } from "react"
import { Upload, X, Zap, Shield, ScanFace, AlertTriangle, CheckCircle, Link2, Scale, Siren, Film, Download } from "lucide-react"

type ClaimVerdict = "supported" | "contradicted" | "not_enough_evidence"

interface EvidenceItem {
  source: string
  title: string
  url: string
  snippet: string
  reliability: number
  stance: "supports" | "contradicts" | "neutral"
}

interface ClaimAnalysis {
  claim: string
  verdict: ClaimVerdict
  confidence: number
  evidence: EvidenceItem[]
}

interface AnalysisResult {
  verifiedSummary: string
  trustScore: number
  biasScore: number
  scamProbability: number
  deepfakeScore: number
  overallRisk: "low" | "medium" | "high"
  actionableAdvice: string[]
  claims: ClaimAnalysis[]
}

const scanMessages = [
  "Initializing AI safety engine...",
  "Scanning content...",
  "Running neural detection models...",
  "Detecting deepfakes...",
  "Checking sensitive data exposure...",
  "Generating security report...",
]

export const LiveDemoSection = forwardRef<HTMLElement>(function LiveDemoSection(_, ref) {
  const [textInput, setTextInput] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [extractedFrames, setExtractedFrames] = useState<string[]>([])
  const [extractingFrames, setExtractingFrames] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file)
      setExtractedFrames([])
    }
  }

  const removeVideo = () => {
    setVideoFile(null)
    setExtractedFrames([])
    if (videoInputRef.current) videoInputRef.current.value = ""
  }

  const extractVideoFrames = async () => {
    if (!videoFile) return
    setExtractingFrames(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("video", videoFile)
      const res = await fetch("/api/video/extract-frames", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Frame extraction failed")
      setExtractedFrames(data.frames ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Frame extraction failed")
    } finally {
      setExtractingFrames(false)
    }
  }

  const downloadPdf = async () => {
    if (!result) return
    const res = await fetch("/api/report/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report: result }),
    })
    if (!res.ok) {
      setError("Could not download PDF.")
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "trustsetu-report.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    setCurrentMessage(0)

    // Simulate scanning messages
    for (let i = 0; i < scanMessages.length; i++) {
      setCurrentMessage(i)
      await new Promise((resolve) => setTimeout(resolve, 400))
    }

    try {
      const hasVideo = Boolean(videoFile || extractedFrames.length)
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputType: hasVideo ? "video" : "text",
          text: textInput.trim(),
          mediaType: hasVideo ? "video" : imagePreview ? "image" : undefined
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze content")
      }

      setResult(data.report as AnalysisResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const canAnalyze =
    textInput.trim().length > 0 ||
    imagePreview !== null ||
    videoFile !== null ||
    extractedFrames.length > 0

  return (
    <section ref={ref} className="relative py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
              Live AI Demo
            </span>
          </h2>
          <p className="text-[#888] text-lg max-w-2xl mx-auto">
            Paste text, upload an image, or add a video (extract frames with ffmpeg). Optional: set{" "}
            <code className="text-[#06b6d4]">NEWS_API_KEY</code> for live news evidence;{" "}
            <code className="text-[#06b6d4]">FAISS_SERVICE_URL</code> for a remote FAISS search service.
          </p>
        </div>

        {/* Demo container */}
        <div className="glass-card rounded-2xl p-6 md:p-8">
          {/* Input area */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Text input */}
            <div className="lg:row-span-2">
              <label className="block text-sm font-medium text-[#a5a5a5] mb-2">
                Text Content
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste text content to analyze for harmful content, misinformation, or sensitive data..."
                className="w-full min-h-[200px] lg:min-h-[320px] bg-[#0a0520] border border-[rgba(139,92,246,0.3)] rounded-xl p-4 text-white placeholder-[#666] resize-none focus:outline-none focus:border-[#8b5cf6] transition-colors"
              />
            </div>

            <div className="space-y-6">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-[#a5a5a5] mb-2">
                  Image Upload
                </label>
                {!imagePreview ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-36 border-2 border-dashed border-[rgba(139,92,246,0.3)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#8b5cf6] transition-colors bg-[#0a0520]"
                  >
                    <Upload className="w-8 h-8 text-[#666] mb-2" />
                    <p className="text-[#666] text-sm">Drag & drop or click</p>
                    <p className="text-[#555] text-xs mt-1">PNG, JPG, GIF</p>
                  </div>
                ) : (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Video upload + frames */}
              <div>
                <label className="block text-sm font-medium text-[#a5a5a5] mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Video (ffmpeg frame extraction)
                </label>
                {!videoFile ? (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-[rgba(139,92,246,0.3)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#8b5cf6] transition-colors bg-[#0a0520]"
                  >
                    <p className="text-[#666] text-sm">Click to select MP4 / WebM</p>
                    <p className="text-[#555] text-xs mt-1">Then extract frames (requires ffmpeg on PATH)</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[rgba(139,92,246,0.3)] bg-[#0a0520] p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-[#a5a5a5] truncate">{videoFile.name}</p>
                      <button type="button" onClick={removeVideo} className="text-red-400 text-xs shrink-0">
                        Remove
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={extractVideoFrames}
                      disabled={extractingFrames}
                      className="w-full py-2 rounded-lg text-sm font-medium bg-[#1e1b4b] border border-[rgba(139,92,246,0.4)] text-white hover:border-[#8b5cf6] disabled:opacity-50"
                    >
                      {extractingFrames ? "Extracting frames…" : "Extract preview frames"}
                    </button>
                    {extractedFrames.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pt-1">
                        {extractedFrames.map((src, i) => (
                          <img key={i} src={src} alt="" className="h-16 w-28 object-cover rounded border border-[rgba(139,92,246,0.2)]" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={analyzeContent}
            disabled={!canAnalyze || isAnalyzing}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
              canAnalyze && !isAnalyzing
                ? "glow-button text-white"
                : "bg-[#1e1b4b] text-[#666] cursor-not-allowed"
            }`}
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Analyze Content
              </>
            )}
          </button>

          {/* Scanning animation */}
          {isAnalyzing && (
            <div className="mt-8 p-6 bg-[#0a0520] rounded-xl border border-[rgba(139,92,246,0.3)]">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-[#8b5cf6]/20" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8b5cf6] animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#06b6d4] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[#8b5cf6] font-medium mb-2">AI Safety Engine Active</p>
                  <p className="text-[#06b6d4] text-sm animate-pulse">
                    {scanMessages[currentMessage]}
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4 h-2 bg-[#1e1b4b] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] transition-all duration-400"
                  style={{ width: `${((currentMessage + 1) / scanMessages.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {result && !isAnalyzing && (
            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(139,92,246,0.5)] text-sm font-medium text-white hover:bg-[rgba(139,92,246,0.15)]"
                >
                  <Download className="w-4 h-4" />
                  Download PDF report
                </button>
              </div>
              <div className="rounded-xl border border-[rgba(139,92,246,0.25)] bg-[#0a0520] p-5">
                <p className="text-sm text-[#a5a5a5] mb-1">Verified Summary</p>
                <p className="text-[#d7d7d7]">{result.verifiedSummary}</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Trust Score */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className={`w-6 h-6 ${result.trustScore >= 80 ? 'text-green-400' : result.trustScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`} />
                  <span className="font-medium">Trust Score</span>
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                  {result.trustScore}%
                </div>
                <div className="h-3 bg-[#1e1b4b] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.trustScore >= 80 ? 'bg-green-500' : result.trustScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.trustScore}%` }}
                  />
                </div>
                <p className="text-sm text-[#888] mt-2">
                  {result.overallRisk === "low" ? "Low risk profile" : result.overallRisk === "medium" ? "Moderate risk detected" : "High risk content"}
                </p>
              </div>

              {/* Bias Score */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className={`w-6 h-6 ${result.biasScore <= 25 ? 'text-green-400' : result.biasScore <= 55 ? 'text-yellow-400' : 'text-red-400'}`} />
                  <span className="font-medium">Bias Score</span>
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                  {result.biasScore}%
                </div>
                <div className="h-3 bg-[#1e1b4b] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.biasScore <= 25 ? 'bg-green-500' : result.biasScore <= 55 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.biasScore}%` }}
                  />
                </div>
                <p className="text-sm text-[#888] mt-2">
                  Higher means stronger narrative bias
                </p>
              </div>

              {/* Scam Probability */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Siren className={`w-6 h-6 ${result.scamProbability <= 30 ? 'text-green-400' : result.scamProbability <= 60 ? 'text-yellow-400' : 'text-red-400'}`} />
                  <span className="font-medium">Scam Probability</span>
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                  {result.scamProbability}%
                </div>
                <div className="h-3 bg-[#1e1b4b] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.scamProbability <= 30 ? 'bg-green-500' : result.scamProbability <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.scamProbability}%` }}
                  />
                </div>
                <p className="text-sm text-[#888] mt-2">Pattern-based social-engineering risk</p>
              </div>

              {/* Deepfake Score */}
              <div className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ScanFace className={`w-6 h-6 ${result.deepfakeScore <= 25 ? 'text-green-400' : result.deepfakeScore <= 55 ? 'text-yellow-400' : 'text-red-400'}`} />
                  <span className="font-medium">Deepfake Score</span>
                </div>
                <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                  {result.deepfakeScore}%
                </div>
                <div className="h-3 bg-[#1e1b4b] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      result.deepfakeScore <= 25 ? 'bg-green-500' : result.deepfakeScore <= 55 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.deepfakeScore}%` }}
                  />
                </div>
                <p className="text-sm text-[#888] mt-2">Synthetic media likelihood</p>
              </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-5">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                    Actionable Advice
                  </h4>
                  <div className="space-y-2">
                    {result.actionableAdvice.map((advice, idx) => (
                      <p key={idx} className="text-sm text-[#b8b8b8]">
                        {idx + 1}. {advice}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5">
                  <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#8b5cf6]" />
                    Claim Verification
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {result.claims.map((claim, idx) => (
                      <div key={idx} className="rounded-lg bg-[#0a0520] border border-[rgba(139,92,246,0.2)] p-3">
                        <p className="text-sm text-[#e5e5e5] mb-2">{claim.claim}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className={`px-2 py-1 rounded ${
                            claim.verdict === "supported"
                              ? "bg-green-500/20 text-green-400"
                              : claim.verdict === "contradicted"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                          }`}>
                            {claim.verdict.replaceAll("_", " ")}
                          </span>
                          <span className="text-[#9b9b9b]">Confidence {claim.confidence}%</span>
                        </div>
                        {claim.evidence[0] && (
                          <a
                            href={claim.evidence[0].url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-xs text-[#06b6d4] hover:text-[#67e8f9] transition-colors"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            Evidence: {claim.evidence[0].source}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
})
