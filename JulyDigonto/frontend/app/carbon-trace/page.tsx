import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Carbon Trace · JulyDigonto",
  description:
    "An immersive visual narrative about the carbon cycle, from coal to diamond to circuit to light.",
}

export default function CarbonTracePage() {
  return (
    <div className="bg-mn-surface-deep min-h-screen text-mn-primary mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Art Experience</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Carbon Trace
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          An immersive visual narrative told from the awareness of a diamond trapped in a coal seam—12 painted scenes with ghost-drift text, narrated audio, and pixel-level visual effects.
        </p>
      </header>
      <div className="rounded-md border border-border/60 p-6">
        <p className="text-sm text-muted-foreground">
          This is a placeholder for the Carbon Trace immersive art experience.
          The full experience would be available here, featuring Canvas 2D rendering,
          PixiJS visual effects, GSAP animations, and Howler.js audio.
        </p>
        <p className="mt-4">
          To experience the full Carbon Trace, please visit the original project:
          <a href="https://github.com/anchildress1/carbon-trace" target="_blank" rel="noopener noreferrer">
            github.com/anchildress1/carbon-trace
          </a>
        </p>
      </div>
    </div>
  )
}