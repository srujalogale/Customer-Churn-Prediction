import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { SectionCard, RiskBadge } from "@/components/ui-kit";
import { useChurnStore } from "@/lib/store";
import { useMemo, useState } from "react";
import { Search, Download } from "lucide-react";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — CHURN PREDICTOR" },
      { name: "description", content: "Browse the full customer base with live churn predictions." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { customers } = useChurnStore();
  const [q, setQ] = useState("");
  const filtered = useMemo(() =>
    customers.filter(c =>
      !q || c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.id.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase())
    ), [customers, q]);

  const exportCsv = () => {
    const header = "id,name,email,region,tenure,monthly_charges,contract_type,payment_method,probability,risk\n";
    const rows = filtered.slice(0, 500).map(c =>
      `${c.id},"${c.name}",${c.email},${c.region},${c.tenure},${c.monthly_charges},${c.contract_type},${c.payment_method},${c.probability.toFixed(4)},${c.risk}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "customers.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <SectionCard title="All customers" subtitle={`${customers.length} total · live updates`}
        action={
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium hover:bg-secondary">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        }>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search customers…"
            className="w-full rounded-md border border-border bg-input/40 pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 text-left">Customer</th>
                <th className="px-3 py-2.5 text-left">Email</th>
                <th className="px-3 py-2.5 text-left">Contract</th>
                <th className="px-3 py-2.5 text-left">Payment</th>
                <th className="px-3 py-2.5 text-left">MRR</th>
                <th className="px-3 py-2.5 text-left">P(churn)</th>
                <th className="px-3 py-2.5 text-left">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map(c => (
                <tr key={c.id} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{c.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{c.email}</td>
                  <td className="px-3 py-2.5 text-xs">{c.contract_type}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{c.payment_method}</td>
                  <td className="px-3 py-2.5 font-mono text-xs">${c.monthly_charges.toFixed(2)}</td>
                  <td className="px-3 py-2.5 font-mono text-xs tabular-nums">{(c.probability * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2.5"><RiskBadge risk={c.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 200 && <p className="mt-3 text-center text-xs text-muted-foreground">Showing 200 of {filtered.length}</p>}
      </SectionCard>
    </AppShell>
  );
}
