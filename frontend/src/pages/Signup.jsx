import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import axios from 'axios';
import { Magic } from 'magic-sdk';
import { setToken } from '../utils/auth';

const MAGIC_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY;
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL: API_BASE });

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Enter your email');
      return;
    }
    if (!MAGIC_KEY) {
      setError('Magic is not configured. Set VITE_MAGIC_PUBLISHABLE_KEY.');
      return;
    }
    setLoading(true);
    try {
      const magic = new Magic(MAGIC_KEY);
      const didToken = await magic.auth.loginWithEmailOTP({
        email: trimmed,
        showUI: true,
      });
      if (didToken && typeof didToken === 'string') {
        const { data } = await api.post('/auth/verify', { did_token: didToken });
        const accessToken = data.access_token ?? data.token;
        if (accessToken) {
          setToken(accessToken);
          navigate('/onboarding/connect-provider', { replace: true });
          return;
        }
      }
      setError('Verification failed');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-(--color-border) px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-text hover:text-accent transition-colors flex items-center">
            <Logo className="h-7 text-text-heading" />
          </Link>
          <Link to="/" className="text-sm text-text-muted hover:text-text">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-text mb-2">
          Create account
        </h2>
        <p className="text-text-muted mb-8">
          We'll send you a one-time code to sign in. No password required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface border border-(--color-border) rounded-lg px-4 py-3 text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-accent text-bg font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Sending…' : 'Send Code'}
            </button>
          </form>

        <p className="mt-4 text-sm text-text-muted text-center">
          <Link to="/estimate" className="text-accent hover:underline">
            Back to estimate
          </Link>
        </p>
      </main>
    </div>
  );
}
