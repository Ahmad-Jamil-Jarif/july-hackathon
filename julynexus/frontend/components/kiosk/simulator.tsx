"use client"

import { useEffect, useRef, useState } from "react"
import {
  Cpu,
  WifiOff,
  Wifi,
  Radio,
  Bell,
  AlertTriangle,
  Heart,
  Send,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { API_BASE } from "@/lib/api"

type LedColor = "off" | "green" | "red" | "amber"
type EventType = "tribute" | "report" | "panic" | "rfid" | "heartbeat"

type BufferedEvent = {
  id: string
  type: EventType
  payload: Record<string, unknown>
  bufferedAt: string
  sent?: boolean
}

const DEVICE_ID_DEFAULT = "kiosk-001"

export function KioskSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [deviceId, setDeviceId] = useState(DEVICE_ID_DEFAULT)
  const [rfid, setRfid] = useState("")
  const [online, setOnline] = useState(true)
  const [buzzer, setBuzzer] = useState(false)
  const [motion, setMotion] = useState(false)
  const [panic, setPanic] = useState(false)
  const [leds, setLeds] = useState<{
    green: LedColor
    red: LedColor
    amber: LedColor
  }>({ green: "off", red: "off", amber: "off" })
  const [buffer, setBuffer] = useState<BufferedEvent[]>([])
  const [lastSent, setLastSent] = useState<string | null>(null)
  const [tributeName, setTributeName] = useState("")
  const [tributeText, setTributeText] = useState("")

  // LED color logic
  useEffect(() => {
    if (panic) {
      setLeds({ green: "off", red: "red", amber: "off" })
    } else if (!online) {
      setLeds({ green: "off", red: "off", amber: "amber" })
    } else if (motion) {
      setLeds({ green: "green", red: "off", amber: "off" })
    } else {
      setLeds({ green: "off", red: "off", amber: "off" })
    }
  }, [online, motion, panic])

  // LCD canvas render
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#0b1410"
    ctx.fillRect(0, 0, c.width, c.height)

    // 16x2 grid simulation (compact view)
    const rows = 2
    const cols = 16
    const cellW = c.width / cols
    const cellH = c.height / rows

    const line1 =
      panic
        ? "!!! PANIC !!!    "
        : !online
          ? "OFFLINE QUEUE   "
          : motion
            ? `RFID: ${(rfid || "----").slice(0, 8).padEnd(8, " ")}     `
            : "JulyNexus Kiosk "

    const line2 = online
      ? `OK | buf:${String(buffer.length).padStart(2, " ")} | ${new Date().toLocaleTimeString().slice(0, 8)}`
      : `Buffered:${buffer.length.toString().padStart(3, " ")}`

    ctx.fillStyle = "#34d399"
    ctx.font = `${Math.floor(cellH * 0.65)}px monospace`
    ctx.textBaseline = "middle"

    ctx.fillText(line1.padEnd(cols, " "), 4, cellH / 2)
    ctx.fillText(line2.padEnd(cols, " "), 4, cellH + cellH / 2)

    // pixelation block effect
    ctx.fillStyle = "rgba(0,0,0,0.15)"
    for (let i = 0; i < c.width; i += 2) {
      ctx.fillRect(i, Math.floor(Math.random() * c.height), 1, 1)
    }
  }, [online, motion, panic, rfid, buffer.length])

  function enqueue(type: EventType, payload: Record<string, unknown>) {
    const ev: BufferedEvent = {
      id: crypto.randomUUID(),
      type,
      payload,
      bufferedAt: new Date().toISOString(),
      sent: false,
    }
    setBuffer((b) => [...b, ev])
  }

  async function flushBuffer() {
    if (!online || buffer.length === 0) return
    const events = buffer.filter((b) => !b.sent)
    if (events.length === 0) return

    const payload = {
      device_id: deviceId,
      events: events.map((e) => ({
        device_id: deviceId,
        event_type: e.type,
        payload: e.payload,
        buffered_at: e.bufferedAt,
      })),
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/kiosk/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Sync failed")
      const data = await res.json()
      setBuffer((b) =>
        b.map((e) => (events.find((x) => x.id === e.id) ? { ...e, sent: true } : e)),
      )
      setLastSent(
        `Synced ${data.synced}/${events.length} (rejected ${data.rejected})`,
      )
    } catch {
      setLastSent("⚠️ Sync failed — staying in offline queue.")
    }
  }

  // Auto-flush every 6s when online
  useEffect(() => {
    const t = setInterval(() => {
      if (online && buffer.some((b) => !b.sent)) void flushBuffer()
    }, 6000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, buffer, deviceId])

  function handleRfidScan() {
    if (!rfid.trim()) {
      setBuzzer(true)
      setTimeout(() => setBuzzer(false), 400)
      return
    }
    enqueue("rfid", { uid: rfid.trim() })
    setRfid("")
  }

  function handlePanic() {
    setPanic(true)
    enqueue("panic", { source: "kiosk_button", device_id: deviceId })
    setBuzzer(true)
    setTimeout(() => {
      setBuzzer(false)
      setPanic(false)
    }, 2500)
  }

  function handleTribute() {
    if (!tributeName.trim() || !tributeText.trim()) return
    enqueue("tribute", {
      name: tributeName.trim(),
      testimony: tributeText.trim(),
    })
    setTributeName("")
    setTributeText("")
  }

  function handleMotion() {
    setMotion(true)
    enqueue("heartbeat", { source: "pir" })
    setTimeout(() => setMotion(false), 1500)
  }

  function handleReport() {
    enqueue("report", { ts: new Date().toISOString() })
  }

  const bufferedCount = buffer.filter((b) => !b.sent).length

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Hardware panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cpu className="size-5 text-primary" />
            ESP32 Kiosk · Browser Simulator
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            All inputs are local — events queue to the SD buffer when offline
            and flush via <code>POST /api/v1/kiosk/sync</code>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* LCD */}
          <div className="rounded-md border border-emerald-900/40 bg-emerald-950/30 p-3 shadow-inner">
            <canvas
              ref={canvasRef}
              width={512}
              height={120}
              className="w-full"
              aria-label="LCD display"
            />
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-emerald-700/70">
              16×2 LCD (simulated)
            </p>
          </div>

          {/* LEDs */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <Led color={leds.green} label="ONLINE" />
            <Led color={leds.amber} label="BUFFER" />
            <Led color={leds.red} label="PANIC" />
          </div>

          {/* RFID + motion */}
          <div className="space-y-2 rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-primary" />
              <Label htmlFor="rfid" className="text-xs font-semibold">
                RFID SCAN (MFRC522)
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="rfid"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                placeholder="UID e.g. 04a3b2c1…"
                className="font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRfidScan()
                }}
              />
              <Button onClick={handleRfidScan}>Scan</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMotion}
                className="gap-1.5"
              >
                <Heart className="size-3.5" /> PIR motion
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReport}
                className="gap-1.5"
              >
                <Send className="size-3.5" /> File report
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handlePanic}
                className="gap-1.5"
              >
                <AlertTriangle className="size-3.5" /> PANIC
              </Button>
            </div>
          </div>

          {/* Tribute */}
          <div className="space-y-2 rounded-md border border-border p-3">
            <Label className="text-xs font-semibold">CITIZEN TRIBUTE</Label>
            <Input
              value={tributeName}
              onChange={(e) => setTributeName(e.target.value)}
              placeholder="Name of the martyr"
            />
            <Input
              value={tributeText}
              onChange={(e) => setTributeText(e.target.value)}
              placeholder="Short testimony"
            />
            <Button onClick={handleTribute} size="sm">
              Submit tribute
            </Button>
          </div>

          {/* Network + buzzer */}
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border p-3">
            <Label className="text-xs font-semibold">DEVICE</Label>
            <Input
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="font-mono text-xs"
            />
            <Button
              variant={online ? "default" : "outline"}
              size="sm"
              onClick={() => setOnline((v) => !v)}
              className="gap-1.5"
            >
              {online ? (
                <>
                  <Wifi className="size-3.5" /> Online
                </>
              ) : (
                <>
                  <WifiOff className="size-3.5" /> Offline
                </>
              )}
            </Button>
            <Button
              variant={buzzer ? "destructive" : "outline"}
              size="sm"
              onClick={() => setBuzzer((v) => !v)}
              className="gap-1.5"
            >
              <Bell className="size-3.5" /> Buzzer {buzzer ? "ON" : "off"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBuffer([])}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" /> Clear
            </Button>
          </div>

          {lastSent && (
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {lastSent}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Buffer / queue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Offline Queue</CardTitle>
          <Badge variant={online ? "success" : "warning"}>
            {online ? "Live" : "Buffered"} · {bufferedCount} pending
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
            {buffer.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No events yet. Scan an RFID, press PIR, or file a report to
                populate the buffer.
              </p>
            ) : (
              buffer
                .slice()
                .reverse()
                .map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-xs",
                      e.sent
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-amber-500/40 bg-amber-500/5",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="font-semibold uppercase">{e.type}</p>
                      <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-[10px] text-muted-foreground">
                        {JSON.stringify(e.payload, null, 0)}
                      </pre>
                    </div>
                    <Badge variant={e.sent ? "success" : "warning"}>
                      {e.sent ? "Sent" : "Buffered"}
                    </Badge>
                  </div>
                ))
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => void flushBuffer()}
              disabled={!online || bufferedCount === 0}
              className="gap-1.5"
            >
              <Send className="size-4" /> Flush queue now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Led({ color, label }: { color: LedColor; label: string }) {
  const map: Record<LedColor, string> = {
    off: "bg-muted text-muted-foreground",
    green: "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    amber: "bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.6)]",
    red: "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.7)]",
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          map[color],
        )}
        aria-label={`${label} LED ${color}`}
      />
      <span className="text-[10px] font-semibold tracking-wider">{label}</span>
    </div>
  )
}