import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, AlertTriangle, Sparkles, Settings, Activity, Moon, Sun, Pause, Play, Search, Command } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useChurnStore, store } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV = [
  { to: "/" as const, label: "Dashboard", icon: LayoutDashboard },
  { to: "/predict" as const, label: "Predict", icon: Sparkles },
  { to: "/high-risk" as const, label: "High-Risk", icon: AlertTriangle },
  { to: "/customers" as const, label: "Customers", icon: Users },
  { to: "/admin" as const, label: "Admin", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const { alerts, streamPaused } = useChurnStore();
  const location = useLocation();
  const currentNav = NAV.find(n => n.to === location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[460px] bg-glow opacity-60" />
      <div className="relative flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/60 bg-card/30 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-2.5 px-5 border-b border-border/60">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Activity className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-[15px] font-semibold leading-none tracking-tight">CHURN PREDICTOR</div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-1">Retention OS</div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-5">
            <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">Workspace</div>
            <div className="space-y-0.5">
              {NAV.map(item => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                      active
                        ? "bg-secondary/80 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-primary" />}
                    <Icon className={cn("h-4 w-4 transition-colors", active && "text-primary")} />
                    <span>{item.label}</span>
                    {item.to === "/high-risk" && alerts.length > 0 && (
                      <span className="ml-auto rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive tabular-nums">
                        {alerts.length}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="m-3 rounded-xl border border-border/60 bg-card/60 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {!streamPaused && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />}
                  <span className={cn("relative inline-flex h-2 w-2 rounded-full", streamPaused ? "bg-warning" : "bg-success")} />
                </span>
                <span className="text-[11px] font-medium">{streamPaused ? "Stream paused" : "Streaming live"}</span>
              </div>
              <button
                type="button"
                onClick={() => store.togglePause()}
                aria-label={streamPaused ? "Resume stream" : "Pause stream"}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                {streamPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground leading-relaxed">Simulated event stream · 6s interval</div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border/60 bg-background/75 px-5 backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <Activity className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">CHURN PREDICTOR</div>
                <div className="font-display text-[15px] font-semibold leading-tight truncate">
                  {currentNav?.label ?? "Overview"}
                </div>
              </div>
            </div>



            <div className="flex items-center gap-2">
              <Link
                to="/predict"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-3.5 w-3.5" /> New prediction
              </Link>
              <button
                type="button"
                onClick={toggle}
                aria-label="Toggle theme"
                className="rounded-md border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
                <div className="h-7 w-7 rounded-full bg-gradient-primary grid place-items-center text-[11px] font-bold text-primary-foreground">AD</div>
                <div className="text-xs leading-tight">
                  <div className="font-medium">Admin</div>
                  <div className="text-[10px] text-muted-foreground">admin@churnpredictor.io</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 pb-20 md:pb-8">{children}</main>

          {/* Mobile bottom nav */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
