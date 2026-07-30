import type { Metadata } from "next"

import { HomeClient } from "./home-client"

export const metadata: Metadata = {
  title: "স্মৃতিসৌধ · জুলাই ৩৬ মেমোরিয়াল মিউজিয়াম",
  description:
    "The July Mass Uprising Memorial Museum has been established to document the 16 years of Fascist Hasina's tyranny and to commemorate the July Uprising for generations to come.",
}

export default function HomePage() {
  return <HomeClient />
}
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background via-background to-card">
        <div className="absolute inset-x-0 top-0 -z-10 h-1 bg-bd-flag opacity-80" />
        <div className="container mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="flex flex-col items-center text-center">
            <Badge variant="outline" className="mb-4 gap-1.5">
              <Activity className="size-3" />
              July Uprising Memorial Hackathon · 2024 cohort
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Evidentiary Truth,
              <br />
              <span className="text-primary">Civic Dignity</span>,
              <br />
              Verified Memory.
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              JulyNexus turns the three cascading crises of the July Uprising
              into one trustworthy infrastructure: AI forensics to verify
              evidence, a content-addressed vault to preserve it, and an
              aid-disbursement ledger that respects dignity.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/verify">
                  Verify Media <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/memorial">
                  Visit the Memorial Wall <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-6 font-display text-sm text-muted-foreground">
              যাচাই করুন · সংরক্ষণ করুন · সেবা দিন
            </p>
          </div>
        </div>
      </section>

      {/* Three pillars */}
      <section className="container mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <Pillar
            icon={<ShieldCheck className="size-6" />}
            title="1. Verify"
            tagline="AI Forensics + C2PA Provenance"
            bullets={[
              "Deepfake-likelihood scoring on photo + video",
              "EXIF metadata extraction with tamper flags",
              "Perceptual-hash duplicate detection",
            ]}
            cta={{ href: "/verify", label: "Upload evidence" }}
          />
          <Pillar
            icon={<Archive className="size-6" />}
            title="2. Preserve"
            tagline="IPFS Vault + Append-only Ledger"
            bullets={[
              "SHA-256 content addressing",
              "Tamper-evident JSONL chain",
              "Public ledger explorer",
            ]}
            cta={{ href: "/vault", label: "Open the vault" }}
          />
          <Pillar
            icon={<HeartHandshake className="size-6" />}
            title="3. Serve"
            tagline="Aid Transparency + Civic Kiosk"
            bullets={[
              "Zero-Knowledge identity shield",
              "Public BDT disbursement ledger",
              "Offline-first ESP32 kiosk",
            ]}
            cta={{ href: "/aid", label: "Aid portal" }}
          />
        </div>
      </section>

      {/* Secondary CTAs */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <SecondaryLink
            href="/map"
            icon={<MapPin className="size-5" />}
            title="Civic Memorial Map"
            subtitle="Geo-tagged tributes across Bangladesh"
          />
          <SecondaryLink
            href="/kiosk"
            icon={<Cpu className="size-5" />}
            title="Kiosk Simulator"
            subtitle="Browser-based ESP32 + RFID + PIR"
          />
          <SecondaryLink
            href="/chatbot"
            icon={<Bot className="size-5" />}
            title="Constitution Chat"
            subtitle="Evidence-tagged Q&A (English + বাংলা)"
          />
          <SecondaryLink
            href="/dashboard"
            icon={<Activity className="size-5" />}
            title="Live Dashboard"
            subtitle="KPIs for verified media & aid"
          />
        </div>
      </section>
    </div>
  )
}

function Pillar({
  icon,
  title,
  tagline,
  bullets,
  cta,
}: {
  icon: React.ReactNode
  title: string
  tagline: string
  bullets: string[]
  cta: { href: string; label: string }
}) {
  return (
    <Card className="flex h-full flex-col border-border/70">
      <CardHeader>
        <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="font-medium">{tagline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-6">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant="outline" className="w-full">
          <Link href={cta.href}>
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function SecondaryLink({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/40 hover:shadow-sm"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </span>
      <div>
        <p className="font-semibold leading-tight">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  )
}