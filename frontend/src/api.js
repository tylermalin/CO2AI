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

export async function getRecentRequests(limit = 50, orgId = null) {
  const headers = orgId ? { 'X-Organization-Id': orgId } : {};
  const { data } = await api.get(`/emissions/recent?limit=${limit}`, { headers });
  return data.records;
}

export async function getBudget(orgId) {
  if (!orgId) return null;
  const { data } = await api.get('/carbon-budgets', {
    headers: { 'X-Organization-Id': orgId },
  });
  return data;
}
