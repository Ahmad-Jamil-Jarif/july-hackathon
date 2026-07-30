"use client"

import { useEffect, useRef, useState } from "react"
import { Send, Bot, User, Loader2, Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_BASE } from "@/lib/api"

type Msg = {
  id: string
  role: "user" | "assistant"
  content: string
  evidence?: Array<{ topic: string; text: string }>
  streaming?: boolean
}

const SUGGESTIONS_EN = [
  "What is the constitutional right to assembly in Bangladesh?",
  "How does the aid transparency ledger work?",
  "What evidence is needed to report a martyr?",
]

const SUGGESTIONS_BN = [
  "সংবিধানে সমাবেশের অধিকার কী?",
  "তহবিল স্বচ্ছতা লেজার কীভাবে কাজ করে?",
  "একজন শহীদের সাক্ষ্য যাচাই করতে কী প্রয়োজন?",
]

export function ChatbotPanel() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [banglaMode, setBanglaMode] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  async function ask(q: string) {
    if (!q.trim() || busy) return
    const userMsg: Msg = {
      id: crypto.randomUUID(),
      role: "user",
      content: q,
    }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setBusy(true)

    const assistantId = crypto.randomUUID()
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", content: "", streaming: true },
    ])

    try {
      const res = await fetch(`${API_BASE}/api/v1/chatbot/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      })

      if (!res.ok || !res.body) throw new Error("Stream failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        const events = buf.split("\n\n")
        buf = events.pop() ?? ""

        for (const ev of events) {
          const line = ev.split("\n").find((l) => l.startsWith("data:"))
          if (!line) continue
          const data = line.slice(5).trim()
          if (!data) continue
          try {
            const parsed = JSON.parse(data) as
              | { type: "delta"; text: string }
              | {
                  type: "done"
                  evidence: Array<{ topic: string; text: string }>
                }

            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? parsed.type === "delta"
                    ? {
                        ...msg,
                        content: msg.content + parsed.text,
                        streaming: true,
                      }
                    : {
                        ...msg,
                        streaming: false,
                        evidence: parsed.evidence,
                      }
                  : msg,
              ),
            )
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } catch {
      // Fallback to non-streaming endpoint
      try {
        const res2 = await fetch(`${API_BASE}/api/v1/chatbot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: q }),
        })
        const data = await res2.json()
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: data.answer ?? "(no answer)",
                  evidence: data.evidence,
                  streaming: false,
                }
              : msg,
          ),
        )
      } catch (err) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: "⚠️ Chatbot unreachable. Is the backend running on port 8000?",
                  streaming: false,
                }
              : msg,
          ),
        )
      }
    } finally {
      setBusy(false)
    }
  }

  const suggestions = banglaMode ? SUGGESTIONS_BN : SUGGESTIONS_EN

  return (
    <Card className="flex h-[min(75vh,720px)] flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/80 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="size-5 text-primary" /> Constitution Chat
        </CardTitle>
        <Button
          variant={banglaMode ? "default" : "outline"}
          size="sm"
          onClick={() => setBanglaMode((v) => !v)}
          className="gap-1.5"
        >
          <Languages className="size-3.5" />
          {banglaMode ? "বাংলা" : "EN"}
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 overflow-hidden p-0">
        <div
          ref={scrollerRef}
          className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
        >
          {messages.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 text-sm text-muted-foreground">
              Ask anything about civic rights, the verification process, or
              memorial submission. Suggestions:
              <ul className="mt-2 space-y-1">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
                      className="text-left text-primary hover:underline"
                    >
                      → {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-2",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {m.role === "assistant" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="size-4" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {m.content}
                  {m.streaming && (
                    <span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-current" />
                  )}
                </p>
                {!!m.evidence?.length && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {m.evidence.slice(0, 3).map((e, i) => (
                      <Badge
                        key={`${e.topic}-${i}`}
                        variant="outline"
                        className="text-[10px]"
                      >
                        {e.topic.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="size-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        <form
          className="flex gap-2 border-t border-border/80 px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            ask(input)
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              banglaMode
                ? "আপনার প্রশ্ন লিখুন…"
                : "Ask a question about rights, evidence, or aid…"
            }
            disabled={busy}
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}