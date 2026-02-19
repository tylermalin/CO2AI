import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export async function getMonthlyTotal(orgId = null) {
  const headers = orgId ? { 'X-Organization-Id': orgId } : {};
  const { data } = await api.get('/emissions/monthly', { headers });
  return data.total_kg_co2eq;
}

export async function getDailyTotals(days = 30, orgId = null) {
  const headers = orgId ? { 'X-Organization-Id': orgId } : {};
  const { data } = await api.get(`/emissions/daily?days=${days}`, { headers });
  return data.daily_totals;
}

export async function getRecentRequests(limit = 50, offset = 0, orgId = null) {
  const headers = orgId ? { 'X-Organization-Id': orgId } : {};
  const { data } = await api.get(`/emissions/recent?limit=${limit}&offset=${offset}`, { headers });
  return { records: data.records || [], totalCount: data.total_count ?? data.records?.length ?? 0 };
}

export async function getBudget(orgId) {
  if (!orgId) return null;
  const { data } = await api.get('/carbon-budgets', {
    headers: { 'X-Organization-Id': orgId },
  });
  return data;
}

export async function getOptimizationInsights(orgId = null, days = 30) {
  const headers = orgId ? { 'X-Organization-Id': orgId } : {};
  const { data } = await api.get(`/optimization-insights?days=${days}`, { headers });
  return data.insights || [];
}

export async function runDemoRequest() {
  const { data } = await api.post('/demo/request');
  return data;
}
