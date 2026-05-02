import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export function StatCard({
  label, value, delta, deltaLabel, icon: Icon, accent = "primary", sub,
}: {
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
  sub?: string;
}) {
  const accentMap = {
    primary: "from-primary/30 to-primary/5 text-primary",
    success: "from-success/30 to-success/5 text-success",
    warning: "from-warning/30 to-warning/5 text-warning",
    destructive: "from-destructive/30 to-destructive/5 text-destructive",
  };
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-card transition-all hover:border-border">
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl opacity-60", accentMap[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
          {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
        </div>
        <div className={cn("rounded-lg border border-border/60 bg-card/80 p-2", accentMap[accent].split(" ").pop())}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {delta !== undefined && (
        <div className="relative mt-4 flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
            positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive")}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
          {deltaLabel && <span className="text-muted-foreground">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

export function RiskBadge({ risk }: { risk: "Low" | "Medium" | "High" }) {
  const styles = {
    Low: "bg-success/12 text-success ring-success/30",
    Medium: "bg-warning/12 text-warning ring-warning/30",
    High: "bg-destructive/12 text-destructive ring-destructive/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1", styles[risk])}>
      <span className={cn("h-1.5 w-1.5 rounded-full",
        risk === "Low" ? "bg-success" : risk === "Medium" ? "bg-warning" : "bg-destructive animate-pulse")} />
      {risk}
    </span>
  );
}

export function SectionCard({ title, subtitle, action, children, className }: {
  title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-card", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
