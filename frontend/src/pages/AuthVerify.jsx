import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Magic } from 'magic-sdk';
import { setToken } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const MAGIC_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY;
const api = axios.create({ baseURL: API_BASE });

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const queryString = searchParams.toString();
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const credentialOrQuery = queryString ? `?${queryString}` : hash || null;
    if (!credentialOrQuery) {
      setError('Invalid or missing magic link');
      return;
    }
    if (!MAGIC_KEY) {
      setError('Magic is not configured.');
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const magic = new Magic(MAGIC_KEY);
        const didToken = await magic.auth.loginWithCredential({
          credentialOrQueryString: credentialOrQuery,
        });
        if (!didToken || cancelled) return;

        const { data } = await api.post('/auth/verify', { did_token: didToken });
        const accessToken = data.access_token ?? data.token;
        if (accessToken && !cancelled) {
          setToken(accessToken);
          navigate('/onboarding/connect-provider', { replace: true });
        } else if (!cancelled) {
          setError('Invalid response from server');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.detail || err.message || 'Verification failed');
        }
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-danger mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/signup', { replace: true })}
            className="text-sm text-accent hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center">
      <p className="text-text-muted">Verifying…</p>
    </div>
  );
}
