const JWT_KEY = 'malama_jwt';
const PROVIDER_KEY = 'malama_provider_connected';

export function isAuthenticated() {
  return !!localStorage.getItem(JWT_KEY);
}

export function hasConnectedProvider() {
  return localStorage.getItem(PROVIDER_KEY) === 'true';
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
}
