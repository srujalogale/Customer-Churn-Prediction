import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, SectionCard, RiskBadge } from "@/components/ui-kit";
import { useChurnStore } from "@/lib/store";
import { aggregateByContract, aggregateByPayment, activityVsChurn, churnTrend } from "@/lib/mock-data";
import { Users, TrendingDown, AlertTriangle, DollarSign, Bell, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "@tanstack/react-router";
import { store } from "@/lib/store";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CHURN PREDICTOR — Real-Time Customer Churn Prediction" },
      { name: "description", content: "AI-powered churn prediction dashboard. Spot at-risk customers, track revenue at risk, and act before they leave." },
      { property: "og:title", content: "CHURN PREDICTOR — Real-Time Customer Churn Prediction" },
      { property: "og:description", content: "Live churn predictions powered by an XGBoost model. Built for SaaS retention teams." },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  contentStyle: {
    background: "oklch(0.20 0.028 252)",
    border: "1px solid oklch(0.30 0.025 252 / 0.6)",
    borderRadius: 10,
    fontSize: 12,
    color: "oklch(0.96 0.01 250)",
  },
  labelStyle: { color: "oklch(0.68 0.02 250)", fontSize: 11 },
  cursor: { fill: "oklch(0.78 0.16 200 / 0.08)" },
} as const;

function Dashboard() {
  const { customers, alerts } = useChurnStore();

  const stats = useMemo(() => {
    const total = customers.length;
    const high = customers.filter(c => c.probability > 0.8).length;
    const churnRate = +(customers.filter(c => c.probability > 0.5).length / total * 100).toFixed(1);
    const revenueAtRisk = customers
      .filter(c => c.probability > 0.5)
      .reduce((s, c) => s + c.monthly_charges * c.probability * 12, 0);
    return { total, high, churnRate, revenueAtRisk };
  }, [customers]);

  const trend = useMemo(() => churnTrend(30), []);
  const byContract = useMemo(() => aggregateByContract(customers), [customers]);
  const byPayment = useMemo(() => aggregateByPayment(customers), [customers]);
  const activity = useMemo(() => activityVsChurn(customers), [customers]);

  const PIE_COLORS = ["oklch(0.78 0.16 200)", "oklch(0.72 0.17 155)", "oklch(0.80 0.17 75)", "oklch(0.65 0.22 22)"];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Hero KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total customers" value={stats.total.toLocaleString()} icon={Users}
            delta={2.4} deltaLabel="vs last week" sub="Live customer base" accent="primary" />
          <StatCard label="Churn rate" value={`${stats.churnRate}%`} icon={TrendingDown}
            delta={-1.2} deltaLabel="vs last week" sub="Predicted next 30 days" accent="warning" />
          <StatCard label="High-risk customers" value={stats.high.toLocaleString()} icon={AlertTriangle}
            delta={5.8} deltaLabel="probability > 0.8" sub="Immediate attention" accent="destructive" />
          <StatCard label="Revenue at risk" value={`$${(stats.revenueAtRisk / 1000).toFixed(1)}k`} icon={DollarSign}
            delta={3.1} deltaLabel="ARR exposure" sub="Annualized MRR weighted by P(churn)" accent="success" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SectionCard className="lg:col-span-2" title="Churn trend" subtitle="Predicted churn rate over the last 30 days"
            action={<span className="text-[11px] rounded-md border border-border bg-card px-2 py-1 text-muted-foreground">30D</span>}>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={trend} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.78 0.16 200)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.30 0.025 252 / 0.5)" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 250)" fontSize={11} interval={4} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 250)" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="churnRate" stroke="oklch(0.78 0.16 200)" strokeWidth={2.2} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Live alerts" subtitle="Customers crossing the 0.8 churn threshold"
            action={<span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive">{alerts.length}</span>}>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {alerts.length === 0 && (
                <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                  <Bell className="mx-auto h-5 w-5 mb-2 opacity-50" />
                  No alerts yet. Watching the stream…
                </div>
              )}
              {alerts.map(a => (
                <div key={a.id} className="group flex items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.customerId} · P {(a.probability * 100).toFixed(0)}%</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link to="/high-risk" className="rounded-md bg-destructive/15 px-2 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/25">Review</Link>
                    <button onClick={() => store.dismissAlert(a.id)} className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Churn by contract" subtitle="Month-to-month churns most">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={byContract} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.30 0.025 252 / 0.5)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 250)" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 250)" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="atRisk" radius={[6, 6, 0, 0]} fill="oklch(0.78 0.16 200)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Churn by payment method" subtitle="Distribution of at-risk customers">
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byPayment} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {byPayment.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "oklch(0.68 0.02 250)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard title="Activity vs churn" subtitle="Lower activity → higher churn probability">
            <div className="h-64">
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.30 0.025 252 / 0.5)" />
                  <XAxis type="number" dataKey="activity" name="Activity" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 250)" fontSize={11} />
                  <YAxis type="number" dataKey="probability" name="Churn %" tickLine={false} axisLine={false} stroke="oklch(0.68 0.02 250)" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Scatter data={activity}>
                    {activity.map((d, i) => (
                      <Cell key={i} fill={d.risk === "High" ? "oklch(0.65 0.22 22)" : d.risk === "Medium" ? "oklch(0.80 0.17 75)" : "oklch(0.72 0.17 155)"} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* Recent high risk preview */}
        <SectionCard title="Recently flagged" subtitle="Top high-risk customers from the live stream"
          action={<Link to="/high-risk" className="text-xs text-primary hover:underline">View all →</Link>}>
          <div className="overflow-hidden rounded-xl border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Region</th>
                  <th className="px-3 py-2 text-left">Probability</th>
                  <th className="px-3 py-2 text-left">Risk</th>
                  <th className="px-3 py-2 text-left hidden md:table-cell">MRR</th>
                </tr>
              </thead>
              <tbody>
                {customers.filter(c => c.probability > 0.8).slice(0, 6).map(c => (
                  <tr key={c.id} className="border-t border-border/60 hover:bg-secondary/30">
                    <td className="px-3 py-2.5">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.id}</div>
                    </td>
                    <td className="px-3 py-2.5 hidden sm:table-cell text-muted-foreground">{c.region}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full bg-gradient-risk" style={{ width: `${c.probability * 100}%` }} />
                        </div>
                        <span className="font-mono text-xs">{(c.probability * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><RiskBadge risk={c.risk} /></td>
                    <td className="px-3 py-2.5 hidden md:table-cell font-mono text-xs">${c.monthly_charges.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
