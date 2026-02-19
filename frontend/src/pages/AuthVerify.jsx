import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { setToken } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL: API_BASE });

export default function AuthVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Invalid or missing token');
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const { data } = await api.post('/auth/verify', { token });
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
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center">
          <p className="text-[var(--color-danger)] mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/signup', { replace: true })}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
      <p className="text-[var(--color-text-muted)]">Verifying…</p>
    </div>
  );
}
