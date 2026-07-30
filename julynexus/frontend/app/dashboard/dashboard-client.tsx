"use client"

export function DashboardClient() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Civic operations dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitor trust signals, verification activity, and response readiness.
        </p>
      </div>
    </div>
  )
}
