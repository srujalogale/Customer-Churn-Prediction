/**
 * Centralized API client for the FastAPI backend.
 * All components should import from here — never fetch() directly.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

// ─── Token helpers ────────────────────────────────────────────────────────────

export const auth = {
  getToken: () => localStorage.getItem("churn_token"),
  setToken: (token: string) => localStorage.setItem("churn_token", token),
  clearToken: () => localStorage.removeItem("churn_token"),
  isLoggedIn: () => !!localStorage.getItem("churn_token"),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  authRequired = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authRequired) {
    const token = auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }

  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiCustomer {
  id: string;
  name: string;
  email: string;
  signup_date: string;
  last_active: string | null;
  total_transactions: number;
  usage_frequency: number;
}

export interface CustomerListResponse {
  total: number;
  items: ApiCustomer[];
}

export interface ChurnPredictionResponse {
  churn_probability: number;
  risk_level: "low" | "medium" | "high";
}

export interface AnalyticsOverview {
  churn_rate: number;
  total_customers: number;
  high_risk_customers: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  created_at: string;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> => {
    const body = new URLSearchParams({ username: email, password });
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    }, false);
  },

  register: (email: string, password: string): Promise<RegisterResponse> =>
    request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, false),
};

// ─── Customer endpoints ───────────────────────────────────────────────────────

export const customersApi = {
  list: (skip = 0, limit = 100): Promise<CustomerListResponse> =>
    request<CustomerListResponse>(`/customers/?skip=${skip}&limit=${limit}`),

  getById: (id: string): Promise<ApiCustomer> =>
    request<ApiCustomer>(`/customers/${id}`),

  create: (data: Omit<ApiCustomer, "id" | "signup_date" | "last_active">): Promise<ApiCustomer> =>
    request<ApiCustomer>("/customers/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── ML / Prediction endpoints ────────────────────────────────────────────────

export const mlApi = {
  predict: (data: {
    inactivity_days: number;
    total_transactions: number;
    usage_frequency: number;
  }): Promise<ChurnPredictionResponse> =>
    request<ChurnPredictionResponse>("/predict-churn", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  customerRisk: (customerId: string): Promise<ChurnPredictionResponse> =>
    request<ChurnPredictionResponse>(`/customer-risk/${customerId}`),
};

// ─── Analytics endpoints ──────────────────────────────────────────────────────

export const analyticsApi = {
  overview: (): Promise<AnalyticsOverview> =>
    request<AnalyticsOverview>("/analytics/overview"),
};
