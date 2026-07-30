import type { Metadata } from "next"

import { KioskClient } from "./kiosk-client"

export const metadata: Metadata = {
  title: "Kiosk Simulator · JulyDigonto",
  description:
    "ESP32 kiosk hardware simulator with offline-first queue, panic button, RFID, and citizen tribute form.",
}

export default function KioskPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">IoT · Kiosk</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          ESP32 kiosk simulator
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Browser-based emulator of the ESP32 kiosk firmware. Toggle offline
          mode to demonstrate the on-device SD buffer and the deferred-sync
          contract used in the field.
        </p>
      </header>
      <KioskClient />
    </div>
  )
}