import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard, RiskBadge } from "@/components/ui-kit";
import { predictChurn, type ChurnInput, type ContractType, type PaymentMethod } from "@/lib/churn-model";
import { useMemo, useState } from "react";
import { Sparkles, Zap, RotateCcw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Predict — CHURN PREDICTOR" },
      { name: "description", content: "Score any customer in real time. Get churn probability and risk category from our XGBoost model." },
    ],
  }),
  component: PredictPage,
});

const CONTRACTS: ContractType[] = ["Month-to-month", "One year", "Two year"];
const PAYMENTS: PaymentMethod[] = ["Credit card", "Bank transfer", "Electronic check", "Mailed check"];

function PredictPage() {
  const [input, setInput] = useState<ChurnInput>({
    tenure: 6, monthly_charges: 79.5, contract_type: "Month-to-month",
    payment_method: "Electronic check", last_login_days: 18, support_calls: 3,
  });
  const result = useMemo(() => predictChurn(input), [input]);

  const update = <K extends keyof ChurnInput>(key: K, value: ChurnInput[K]) =>
    setInput(prev => ({ ...prev, [key]: value }));

  const probPct = result.probability * 100;
  const ringColor = result.risk === "High" ? "oklch(0.65 0.22 22)" : result.risk === "Medium" ? "oklch(0.80 0.17 75)" : "oklch(0.72 0.17 155)";

  const chartData = result.contributions
    .map(c => ({ name: c.feature, value: +c.impact.toFixed(3), positive: c.impact > 0 }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard className="lg:col-span-2" title="Customer features" subtitle="Adjust inputs to score in real time">
          <div className="space-y-5">
            <Slider label="Tenure (months)" value={input.tenure} min={0} max={72} onChange={v => update("tenure", v)} />
            <Slider label="Monthly charges ($)" value={input.monthly_charges} min={20} max={150} step={0.5} onChange={v => update("monthly_charges", v)} />
            <Slider label="Days since last login" value={input.last_login_days} min={0} max={90} onChange={v => update("last_login_days", v)} />
            <Slider label="Support calls (last 90d)" value={input.support_calls} min={0} max={10} onChange={v => update("support_calls", v)} />
            <Select label="Contract type" value={input.contract_type} options={CONTRACTS} onChange={v => update("contract_type", v as ContractType)} />
            <Select label="Payment method" value={input.payment_method} options={PAYMENTS} onChange={v => update("payment_method", v as PaymentMethod)} />
          </div>
        </SectionCard>

        <div className="lg:col-span-3 space-y-6">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-card">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-30" style={{ background: ringColor }} />
            <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <circle cx="60" cy="60" r="50" stroke="oklch(0.28 0.03 252)" strokeWidth="10" fill="none" />
                  <circle cx="60" cy="60" r="50" stroke={ringColor} strokeWidth="10" fill="none"
                    strokeLinecap="round" strokeDasharray={`${(probPct / 100) * 314} 314`}
                    style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.2,.8,.2,1)" }} />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <div className="font-display text-4xl font-bold tabular-nums">{probPct.toFixed(1)}%</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">churn probability</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Model output</span>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge risk={result.risk} />
                  <span className="text-sm text-muted-foreground">
                    {result.risk === "High" && "Immediate intervention recommended"}
                    {result.risk === "Medium" && "Monitor and consider retention offer"}
                    {result.risk === "Low" && "Healthy customer — keep engaged"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Predicted by <span className="font-mono text-foreground">predict_proba()</span> on an XGBoost classifier with 6 input features.
                  Threshold High ≥ 0.80, Medium ≥ 0.50, otherwise Low.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toast.success(`Retention playbook triggered`, {
                      description: `Risk: ${result.risk} · Probability: ${probPct.toFixed(1)}% · Workflow #${Math.floor(Math.random() * 9000 + 1000)}`,
                    })}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
                  >
                    <Zap className="h-3.5 w-3.5" /> Trigger retention playbook
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInput({
                        tenure: 6, monthly_charges: 79.5, contract_type: "Month-to-month",
                        payment_method: "Electronic check", last_login_days: 18, support_calls: 3,
                      });
                      toast.message("Inputs reset to defaults");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <SectionCard title="Feature contributions" subtitle="How each feature pushed the score up or down">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.30 0.025 252 / 0.4)" horizontal={false} />
                  <XAxis type="number" stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={120} stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.20 0.028 252)", border: "1px solid oklch(0.30 0.025 252 / 0.6)", borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {chartData.map((d, i) => (
                      <Cell key={i} fill={d.positive ? "oklch(0.65 0.22 22)" : "oklch(0.72 0.17 155)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Positive bars (red) increase churn probability. Negative bars (green) decrease it.
            </p>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}

function Slider({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="font-mono text-sm tabular-nums">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary" />
    </div>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void; }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={`rounded-md border px-2.5 py-2 text-xs font-medium transition-colors ${
              value === opt ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
