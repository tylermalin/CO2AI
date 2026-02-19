const JWT_KEY = 'malama_jwt';
const PROVIDER_KEY = 'malama_provider_connected';
const ORG_ID_KEY = 'malama_org_id';

export function isAuthenticated() {
  return !!localStorage.getItem(JWT_KEY);
}

export function hasConnectedProvider() {
  return localStorage.getItem(PROVIDER_KEY) === 'true';
}

export function getStoredOrgId() {
  return localStorage.getItem(ORG_ID_KEY) || '';
}

export function setStoredOrgId(orgId) {
  if (orgId) {
    localStorage.setItem(ORG_ID_KEY, orgId);
  } else {
    localStorage.removeItem(ORG_ID_KEY);
  }
}

export function setToken(token) {
  localStorage.setItem(JWT_KEY, token);
}

export function setProviderConnected() {
  localStorage.setItem(PROVIDER_KEY, 'true');
}

export function clearAuth() {
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(PROVIDER_KEY);
  localStorage.removeItem(ORG_ID_KEY);
}
