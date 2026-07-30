"use client"

import { useState } from "react"
import {
  HandHeart,
  ShieldCheck,
  CircleAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { bdt } from "@/lib/utils"
import { api, type AidRegisterResponse, type AidDisburseResponse } from "@/lib/api"

type Step = "register" | "review" | "disbursed"

type Form = {
  family_id: string
  district: string
  upazila: string
  head_name: string
  beneficiaries: number
  contact: string
  notes: string
  amount_bdt: number
  purpose: string
  cid_proof: string
}

const INITIAL: Form = {
  family_id: "",
  district: "",
  upazila: "",
  head_name: "",
  beneficiaries: 1,
  contact: "",
  notes: "",
  amount_bdt: 15000,
  purpose: "",
  cid_proof: "",
}

export function AidDisburser() {
  const [step, setStep] = useState<Step>("register")
  const [form, setForm] = useState<Form>(INITIAL)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registerResult, setRegisterResult] = useState<AidRegisterResponse | null>(null)
  const [disburseResult, setDisburseResult] = useState<AidDisburseResponse | null>(null)

  function update<K extends keyof Form>(k: K, v: Form[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function register() {
    setError(null)
    if (!form.family_id || !form.head_name || !form.district) {
      setError("Family ID, head name, and district are required.")
      return
    }
    setBusy(true)
    try {
      const { data } = await api.post<AidRegisterResponse>("/api/v1/aid/register", form)
      setRegisterResult(data)
      setStep("review")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Registration failed"
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  async function disburse() {
    if (!registerResult) return
    setError(null)
    setBusy(true)
    try {
      const { data } = await api.post<AidDisburseResponse>(
        `/api/v1/aid/disburse/${registerResult.id}`,
        { approver_notes: "Approved per committee minutes." },
      )
      setDisburseResult(data)
      setStep("disbursed")
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Disbursement failed"
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setForm(INITIAL)
    setRegisterResult(null)
    setDisburseResult(null)
    setStep("register")
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HandHeart className="size-5 text-primary" />
          Aid Disbursement
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Register a beneficiary family, verify on chain, then disburse. Every
          action is appended to the public ledger.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <ol className="flex items-center gap-2 text-xs">
          <StepDot active={step !== "register"} done={step !== "register"} label="1. Register" />
          <Connector />
          <StepDot active={step === "disbursed"} done={step === "disbursed"} label="2. Review" />
          <Connector />
          <StepDot active={step === "disbursed"} done={step === "disbursed"} label="3. Disburse" />
        </ol>

        {step === "register" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Family ID">
              <Input value={form.family_id} onChange={(e) => update("family_id", e.target.value)} />
            </Field>
            <Field label="Head of Household">
              <Input value={form.head_name} onChange={(e) => update("head_name", e.target.value)} />
            </Field>
            <Field label="District">
              <Input value={form.district} onChange={(e) => update("district", e.target.value)} placeholder="e.g. Dhaka" />
            </Field>
            <Field label="Upazila">
              <Input value={form.upazila} onChange={(e) => update("upazila", e.target.value)} />
            </Field>
            <Field label="Beneficiaries">
              <Input
                type="number"
                min={1}
                value={form.beneficiaries}
                onChange={(e) => update("beneficiaries", Number(e.target.value))}
              />
            </Field>
            <Field label="Contact">
              <Input value={form.contact} onChange={(e) => update("contact", e.target.value)} placeholder="01XXX-XXXXXX" />
            </Field>
            <Field label="Purpose">
              <Input value={form.purpose} onChange={(e) => update("purpose", e.target.value)} placeholder="Livelihood / Medical / Education" />
            </Field>
            <Field label="Proof CID (optional)">
              <Input value={form.cid_proof} onChange={(e) => update("cid_proof", e.target.value)} placeholder="bafy…" className="font-mono" />
            </Field>
            <Field label="Amount (BDT)" full>
              <Input
                type="number"
                min={500}
                step={500}
                value={form.amount_bdt}
                onChange={(e) => update("amount_bdt", Number(e.target.value))}
              />
            </Field>
            <Field label="Notes" full>
              <Textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Background, vulnerability indicators, references…"
                rows={3}
              />
            </Field>

            {error && (
              <p className="md:col-span-2 flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <CircleAlert className="size-4" /> {error}
              </p>
            )}

            <div className="md:col-span-2 flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
              <Button onClick={() => void register()} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Register family"}
              </Button>
            </div>
          </div>
        )}

        {step === "review" && registerResult && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="size-4" /> Registration accepted · pending review
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                <Item label="Family ID" value={registerResult.family_id} />
                <Item label="Status" value={registerResult.status} />
                <Item label="Amount" value={bdt(registerResult.amount_bdt)} />
                <Item label="Hash" value={registerResult.hash.slice(0, 16) + "…"} mono />
                <Item label="Created" value={new Date(registerResult.created_at).toLocaleString()} />
              </dl>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <CircleAlert className="size-4" /> {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button onClick={() => void disburse()} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : "Disburse funds"}
              </Button>
            </div>
          </div>
        )}

        {step === "disbursed" && disburseResult && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="size-4" /> Disbursed on public ledger
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground md:grid-cols-3">
              <Item label="Tx Hash" value={disburseResult.tx_hash.slice(0, 16) + "…"} mono />
              <Item label="Amount" value={bdt(disburseResult.amount_bdt)} />
              <Item label="Block" value={String(disburseResult.block_height)} mono />
              <Item label="Verifier" value={disburseResult.verifier ?? "—"} />
              <Item label="Signed" value={new Date(disburseResult.signed_at).toLocaleString()} />
            </dl>
            <div className="mt-4 flex justify-end">
              <Button onClick={reset}>Register another family</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  children,
  full,
}: {
  label: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  )
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider">{label}</dt>
      <dd className={mono ? "font-mono text-foreground" : "text-foreground"}>{value}</dd>
    </div>
  )
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-2 rounded-full px-2 py-1 text-[11px] font-semibold ${
        done
          ? "bg-emerald-500/10 text-emerald-600"
          : active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground"
      }`}
    >
      <span
        className={`flex size-4 items-center justify-center rounded-full ${
          done ? "bg-emerald-500" : active ? "bg-primary" : "bg-muted"
        } text-white`}
      >
        ✓
      </span>
      {label}
    </li>
  )
}

function Connector() {
  return <span className="h-px flex-1 bg-border" aria-hidden />
}