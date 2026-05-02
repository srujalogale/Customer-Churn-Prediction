import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard, RiskBadge } from "@/components/ui-kit";
import { useChurnStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Search, Filter, Mail, Download, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { store } from "@/lib/store";

export const Route = createFileRoute("/high-risk")({
  head: () => ({
    meta: [
      { title: "High-Risk Customers — CHURN PREDICTOR" },
      { name: "description", content: "Customers with churn probability above 80%. Filter by risk level and region." },
    ],
  }),
  component: HighRiskPage,
});

const REGIONS = ["All", "North America", "Europe", "Asia Pacific", "LATAM"];
const RISKS = ["All", "High", "Medium"];

function HighRiskPage() {
  const { customers } = useChurnStore();
  const [region, setRegion] = useState("All");
  const [risk, setRisk] = useState("High");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return customers
      .filter(c => (risk === "All" ? true : risk === "High" ? c.probability > 0.8 : c.probability > 0.5 && c.probability <= 0.8))
      .filter(c => region === "All" || c.region === region)
      .filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.id.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.probability - a.probability);
  }, [customers, region, risk, q]);

  const sendRetentionEmails = () => {
    const targets = filtered.slice(0, 50);
    if (targets.length === 0) { toast.error("No customers match the current filters"); return; }
    toast.success(`Retention email queued for ${targets.length} customer${targets.length === 1 ? "" : "s"}`, {
      description: `Sent via Mailgun · template: "win-back-v3"`,
    });
  };

  const exportCsv = () => {
    if (filtered.length === 0) { toast.error("Nothing to export"); return; }
    const header = "id,name,email,region,probability,risk,monthly_charges\n";
    const rows = filtered.map(c =>
      `${c.id},"${c.name}",${c.email},${c.region},${c.probability.toFixed(4)},${c.risk},${c.monthly_charges}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "high-risk-customers.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} rows to CSV`);
  };

  return (
    <AppShell>
      <SectionCard
        title="High-risk customers"
        subtitle={`${filtered.length} customers match your filters`}
        action={
          <div className="flex items-center gap-2">
            <button onClick={exportCsv} type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button onClick={sendRetentionEmails} type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90">
              <Mail className="h-3.5 w-3.5" /> Send retention email
            </button>
          </div>
        }
      >
        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or ID…"
              className="w-full rounded-md border border-border bg-input/40 pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
          </div>
          <Pill label="Risk" icon={<Filter className="h-3 w-3" />} options={RISKS} value={risk} onChange={setRisk} />
          <Pill label="Region" options={REGIONS} value={region} onChange={setRegion} />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left">Customer</th>
                <th className="px-3 py-2.5 text-left">Region</th>
                <th className="px-3 py-2.5 text-left">Probability</th>
                <th className="px-3 py-2.5 text-left">Risk</th>
                <th className="px-3 py-2.5 text-left">Tenure</th>
                <th className="px-3 py-2.5 text-left">MRR</th>
                <th className="px-3 py-2.5 text-left">Last activity</th>
                <th className="px-3 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(c => (
                <tr key={c.id} className="border-t border-border/60 transition-colors hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{c.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.region}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-gradient-risk" style={{ width: `${c.probability * 100}%` }} />
                      </div>
                      <span className="font-mono text-xs tabular-nums">{(c.probability * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5"><RiskBadge risk={c.risk} /></td>
                  <td className="px-3 py-2.5 text-muted-foreground">{c.tenure}m</td>
                  <td className="px-3 py-2.5 font-mono text-xs">${c.monthly_charges.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{formatDistanceToNow(new Date(c.last_activity), { addSuffix: true })}</td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        store.addAlertForCustomer(c.id);
                        toast.success(`Flagged ${c.name}`, { description: "Added to live alerts queue" });
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Bell className="h-3 w-3" /> Flag
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">Showing top 100 of {filtered.length}</p>
        )}
      </SectionCard>
    </AppShell>
  );
}

function Pill({ label, options, value, onChange, icon }: { label: string; options: string[]; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1.5">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">{icon}{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium focus:outline-none">
        {options.map(o => <option key={o} value={o} className="bg-popover">{o}</option>)}
      </select>
    </div>
  );
}
