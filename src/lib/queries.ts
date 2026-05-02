/**
 * React Query hooks for the FastAPI backend.
 * Drop these in place of the mock-data / store calls for real API data.
 *
 * Usage example:
 *   import { useAnalyticsOverview, useCustomers } from "@/lib/queries";
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, customersApi, mlApi, authApi, auth } from "./api";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const QK = {
  analytics: ["analytics", "overview"] as const,
  customers: (skip = 0, limit = 100) => ["customers", skip, limit] as const,
  customer: (id: string) => ["customer", id] as const,
  customerRisk: (id: string) => ["customer-risk", id] as const,
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: QK.analytics,
    queryFn: analyticsApi.overview,
    staleTime: 30_000,
    enabled: auth.isLoggedIn(),
  });
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function useCustomers(skip = 0, limit = 100) {
  return useQuery({
    queryKey: QK.customers(skip, limit),
    queryFn: () => customersApi.list(skip, limit),
    staleTime: 60_000,
    enabled: auth.isLoggedIn(),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: QK.customer(id),
    queryFn: () => customersApi.getById(id),
    enabled: !!id && auth.isLoggedIn(),
  });
}

// ─── ML / Risk ────────────────────────────────────────────────────────────────

export function useCustomerRisk(customerId: string) {
  return useQuery({
    queryKey: QK.customerRisk(customerId),
    queryFn: () => mlApi.customerRisk(customerId),
    enabled: !!customerId && auth.isLoggedIn(),
    staleTime: 120_000,
  });
}

export function useChurnPredict() {
  return useMutation({
    mutationFn: mlApi.predict,
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      auth.setToken(data.access_token);
      qc.invalidateQueries();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
  });
}
