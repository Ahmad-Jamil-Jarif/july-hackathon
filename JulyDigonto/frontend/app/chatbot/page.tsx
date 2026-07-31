import { ChatbotPanel } from "@/components/chatbot-panel"

export default function ChatbotPage() {
  return (
    <div className="bg-mn-surface-deep min-h-screen text-mn-primary mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary">Chatbot</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Civic guidance assistant
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Ask about rights, evidence, memorial submission, and aid transparency.
        </p>
      </div>
      <ChatbotPanel />
    </div>
  )
}
