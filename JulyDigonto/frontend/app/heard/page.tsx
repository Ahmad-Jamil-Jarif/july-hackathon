import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Heard · JulyDigonto",
  description:
    "Turn a personal grievance into political action — in one conversation. Heard's Claude-powered agents research the issue, find every official with jurisdiction, and hand you a complete advocacy toolkit.",
}

export default function HeardPage() {
  return (
    <div className="bg-mn-surface-deep min-h-screen text-mn-primary mx-auto max-w-4xl px-4 py-10 md:py-14">
      <header className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Civic Engagement</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Heard
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Heard closes the gap between personal grievances and political action. Speak or type what's wrong in your neighborhood and share your address. Heard's agents research the issue, find every official with jurisdiction, and give you a complete advocacy toolkit: root-cause analysis, drafted letters, a power map, and one-click delivery.
        </p>
      </header>
      <div className="rounded-md border border-border/60 p-6">
        <p className="text-sm text-muted-foreground">
          This is a placeholder for the Heard civic empowerment platform.
          The full platform would include a multi-agent workflow, civic map, grievance feed, and verified official dashboard.
        </p>
        <p className="mt-4">
          To experience the full Heard platform, please visit the original project:
          <a href="https://github.com/StevenWang-CY/Heard" target="_blank" rel="noopener noreferrer">
            github.com/StevenWang-CY/Heard
          </a>
        </p>
      </div>
    </div>
  )
}