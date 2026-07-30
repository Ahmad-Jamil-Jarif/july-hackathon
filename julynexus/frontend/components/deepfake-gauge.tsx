"use client"

type DeepfakeGaugeProps = {
  value: number // 0..1
  label?: string
}

export function DeepfakeGauge({ value, label = "Deepfake score" }: DeepfakeGaugeProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const ringColor =
    pct >= 70
      ? "stroke-red-500"
      : pct >= 40
        ? "stroke-amber-500"
        : "stroke-emerald-500"
  const status =
    pct >= 70 ? "Synthetic" : pct >= 40 ? "Suspicious" : "Likely authentic"
  const statusColor =
    pct >= 70
      ? "text-red-600"
      : pct >= 40
        ? "text-amber-600"
        : "text-emerald-600"

  const size = 160
  const stroke = 12
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="stroke-muted fill-none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={`${ringColor} fill-none transition-all duration-700 ease-out`}
        />
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(90 ${size / 2} ${size / 2 - 4})`}
          className="fill-foreground text-3xl font-bold"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(pct)}%
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(90 ${size / 2} ${size / 2 + 18})`}
          className={`fill-current text-xs font-semibold uppercase tracking-widest ${statusColor}`}
        >
          {status}
        </text>
      </svg>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  )
}