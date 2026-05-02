// Lightweight global store using a tiny pub/sub — no extra deps.
// Holds the live customer list + simulated streaming updates.

import { useEffect, useSyncExternalStore } from "react";
import { generateCustomer, generateCustomers, type Customer } from "./mock-data";

type Listener = () => void;

interface Snapshot {
  customers: Customer[];
  alerts: { id: string; customerId: string; name: string; probability: number; at: string }[];
  streamPaused: boolean;
}

class ChurnStore {
  private customers: Customer[] = generateCustomers(280);
  private alerts: Snapshot["alerts"] = [];
  private streamPaused = false;
  private listeners = new Set<Listener>();
  private nextId = this.customers.length + 1;
  private interval: ReturnType<typeof setInterval> | null = null;
  private snapshot: Snapshot;

  constructor() {
    this.customers
      .filter(c => c.probability > 0.85)
      .slice(0, 4)
      .forEach(c => this.alerts.push({
        id: Math.random().toString(36).slice(2),
        customerId: c.id, name: c.name,
        probability: c.probability, at: new Date().toISOString(),
      }));
    this.snapshot = this.buildSnapshot();
  }

  private buildSnapshot(): Snapshot {
    return { customers: this.customers, alerts: this.alerts, streamPaused: this.streamPaused };
  }

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => { this.listeners.delete(l); };
  };

  private emit() {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach(l => l());
  }

  startStream() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      if (this.streamPaused) return;
      const n = Math.random() > 0.5 ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const c = generateCustomer(this.nextId++);
        this.customers = [c, ...this.customers].slice(0, 600);
        if (c.probability > 0.8) {
          this.alerts = [{
            id: Math.random().toString(36).slice(2),
            customerId: c.id, name: c.name,
            probability: c.probability, at: new Date().toISOString(),
          }, ...this.alerts].slice(0, 25);
        }
      }
      this.emit();
    }, 6000);
  }
  stopStream() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }
  togglePause() { this.streamPaused = !this.streamPaused; this.emit(); }

  ingestCustomers(rows: Customer[]) {
    this.customers = [...rows, ...this.customers].slice(0, 1000);
    this.emit();
  }

  dismissAlert(id: string) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.emit();
  }
  clearAlerts() {
    this.alerts = [];
    this.emit();
  }

  addAlertForCustomer(customerId: string) {
    const c = this.customers.find(x => x.id === customerId);
    if (!c) return;
    this.alerts = [{
      id: Math.random().toString(36).slice(2),
      customerId: c.id, name: c.name,
      probability: c.probability, at: new Date().toISOString(),
    }, ...this.alerts].slice(0, 25);
    this.emit();
  }

  getSnapshot = (): Snapshot => this.snapshot;
}

export const store = new ChurnStore();

export function useChurnStore() {
  const snap = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => {
    store.startStream();
  }, []);
  return snap;
}

