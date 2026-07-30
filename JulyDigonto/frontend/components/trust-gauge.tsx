"use client"

type TrustGaugeProps = {
  value: number // 0..100
  label?: string
}

export function TrustGauge({ value, label = "Trust Score" }: TrustGaugeProps) {
  const pct = Math.max(0, Math.min(100, value))
  const radius = 70
  const circ = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ
  const color =
    pct >= 70
      ? "stroke-emerald-500"
      : pct >= 40
        ? "stroke-amber-500"
        : "stroke-red-500"

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          strokeWidth="14"
          className="stroke-muted fill-none"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={`${color} fill-none transition-all duration-700 ease-out`}
        />
        <text
          x="90"
          y="92"
          textAnchor="middle"
          dominantBaseline="middle"
          transform="rotate(90 90 90)"
          className="fill-foreground text-3xl font-bold"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(pct)}
        </text>
        <text
          x="90"
          y="120"
          textAnchor="middle"
          dominantBaseline="middle"
          transform="rotate(90 90 120)"
          className="fill-muted-foreground text-xs uppercase tracking-widest"
        >
          / 100
        </text>
      </svg>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}