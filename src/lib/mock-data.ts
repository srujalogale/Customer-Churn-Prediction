import { predictChurn, type ChurnInput, type ContractType, type PaymentMethod } from "./churn-model";

export interface Customer {
  id: string;
  name: string;
  email: string;
  region: "North America" | "Europe" | "Asia Pacific" | "LATAM";
  tenure: number;
  monthly_charges: number;
  contract_type: ContractType;
  payment_method: PaymentMethod;
  last_login_days: number;
  support_calls: number;
  last_activity: string; // ISO
  probability: number;
  risk: "Low" | "Medium" | "High";
}

const FIRST = ["Alex","Jordan","Taylor","Morgan","Casey","Riley","Sam","Jamie","Avery","Quinn","Drew","Reese","Skyler","Rowan","Hayden","Emerson","Finley","Sage","Blake","Cameron"];
const LAST = ["Chen","Patel","Garcia","Müller","Tanaka","Silva","Kim","Novak","Andersen","Okafor","Rossi","Dubois","Hernández","Schmidt","Yamamoto","Petrov","Singh","Nguyen","Brown","Costa"];
const REGIONS: Customer["region"][] = ["North America","Europe","Asia Pacific","LATAM"];
const CONTRACTS: ContractType[] = ["Month-to-month","One year","Two year"];
const PAYMENTS: PaymentMethod[] = ["Credit card","Bank transfer","Electronic check","Mailed check"];

let seed = 42;
const rand = () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const range = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

export function generateCustomer(idNum: number): Customer {
  const tenure = range(1, 72);
  const monthly_charges = +(rand() * 90 + 25).toFixed(2);
  const contract_type = pick(CONTRACTS);
  const payment_method = pick(PAYMENTS);
  const last_login_days = range(0, 60);
  const support_calls = range(0, 9);
  const input: ChurnInput = { tenure, monthly_charges, contract_type, payment_method, last_login_days, support_calls };
  const out = predictChurn(input);
  const first = pick(FIRST);
  const last = pick(LAST);
  return {
    id: `CUS-${String(idNum).padStart(5, "0")}`,
    name: `${first} ${last}`,
    email: `${first}.${last}@example.com`.toLowerCase(),
    region: pick(REGIONS),
    tenure, monthly_charges, contract_type, payment_method,
    last_login_days, support_calls,
    last_activity: new Date(Date.now() - last_login_days * 86400000 - range(0, 86400000)).toISOString(),
    probability: out.probability,
    risk: out.risk,
  };
}

export function generateCustomers(n: number): Customer[] {
  seed = 42;
  return Array.from({ length: n }, (_, i) => generateCustomer(i + 1));
}

export function churnTrend(days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const base = 18 + Math.sin(i / 4) * 4 + (i / days) * 6;
    return {
      date: new Date(Date.now() - (days - i - 1) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      churnRate: +(base + Math.random() * 2).toFixed(2),
      retained: +(100 - base - Math.random() * 2).toFixed(2),
    };
  });
}

export function aggregateByContract(customers: Customer[]) {
  const groups: Record<string, { total: number; churned: number }> = {};
  CONTRACTS.forEach(c => groups[c] = { total: 0, churned: 0 });
  customers.forEach(c => {
    groups[c.contract_type].total++;
    if (c.probability > 0.5) groups[c.contract_type].churned++;
  });
  return Object.entries(groups).map(([name, v]) => ({
    name, total: v.total, atRisk: v.churned, rate: v.total ? +(v.churned / v.total * 100).toFixed(1) : 0,
  }));
}

export function aggregateByPayment(customers: Customer[]) {
  const groups: Record<string, number> = {};
  customers.forEach(c => {
    if (c.probability > 0.5) groups[c.payment_method] = (groups[c.payment_method] || 0) + 1;
  });
  return Object.entries(groups).map(([name, value]) => ({ name, value }));
}

export function activityVsChurn(customers: Customer[]) {
  return customers.slice(0, 120).map(c => ({
    activity: 60 - c.last_login_days,
    probability: +(c.probability * 100).toFixed(1),
    risk: c.risk,
  }));
}
