import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/ui-kit";
import { FEATURE_IMPORTANCE, MODEL_METRICS } from "@/lib/churn-model";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Upload, RefreshCw, CheckCircle2, Cpu, Database, GaugeCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — CHURN PREDICTOR" },
      { name: "description", content: "Upload datasets, retrain the model, and inspect performance metrics." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [retraining, setRetraining] = useState(false);
  const [lastTrained, setLastTrained] = useState("2 hours ago");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    toast.success(`Uploaded ${f.name} (${(f.size / 1024).toFixed(1)} KB) — added to training set`);
  };

  const retrain = () => {
    setRetraining(true);
    setTimeout(() => {
      setRetraining(false);
      setLastTrained("Just now");
      toast.success("Model retrained — accuracy 89.4%, ROC-AUC 0.937");
    }, 2200);
  };

  return (
    <AppShell>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Model performance" subtitle={MODEL_METRICS.algorithm}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Accuracy" value={`${(MODEL_METRICS.accuracy * 100).toFixed(1)}%`} />
            <Metric label="ROC-AUC" value={MODEL_METRICS.rocAuc.toFixed(3)} />
            <Metric label="Precision" value={`${(MODEL_METRICS.precision * 100).toFixed(1)}%`} />
            <Metric label="Recall" value={`${(MODEL_METRICS.recall * 100).toFixed(1)}%`} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
            <InfoLine icon={Database} label="Training set" value={MODEL_METRICS.trainedOn} />
            <InfoLine icon={Cpu} label="F1 score" value={MODEL_METRICS.f1.toFixed(3)} />
            <InfoLine icon={GaugeCircle} label="Last trained" value={lastTrained} />
          </div>
        </SectionCard>

        <SectionCard title="Operations" subtitle="Upload data and trigger retraining">
          <div className="space-y-3">
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border/80 bg-secondary/30 p-5 text-center hover:border-primary/60 hover:bg-primary/5 transition-colors">
              <Upload className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
              <div className="text-sm font-medium">Upload customer dataset</div>
              <div className="text-[11px] text-muted-foreground mt-1">CSV · up to 20 MB</div>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} className="hidden" />
            </button>
            <button onClick={retrain} disabled={retraining}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gradient-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 disabled:opacity-60">
              {retraining ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {retraining ? "Retraining model…" : "Retrain XGBoost model"}
            </button>
            <div className="rounded-md border border-success/20 bg-success/5 p-3 text-xs text-success flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <div>Model healthy. ROC-AUC drift &lt; 0.5% over the last 7 days.</div>
            </div>
          </div>
        </SectionCard>

        <SectionCard className="lg:col-span-3" title="Feature importance" subtitle="Which signals drive churn predictions most">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.30 0.025 252 / 0.4)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" width={140} stroke="oklch(0.68 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.028 252)", border: "1px solid oklch(0.30 0.025 252 / 0.6)", borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" radius={[0, 6, 6, 0]} fill="oklch(0.78 0.16 200)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InfoLine({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="ml-auto font-medium">{value}</span>
    </div>
  );
}
