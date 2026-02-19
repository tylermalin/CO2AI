import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setProviderConnected } from '../../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const api = axios.create({ baseURL: API_BASE });

export default function ConnectProvider() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tested, setTested] = useState(false);

  const handleTest = async (e) => {
    e.preventDefault();
    setError(null);
    setTested(false);
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Enter your API key');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/validate-api-key', { api_key: trimmed });
      setTested(true);
    } catch (err) {
      if (err.response?.status === 404) {
        setTested(true);
        setError(null);
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to validate key');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    setProviderConnected();
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[var(--color-text)]">
        Connect Your OpenAI API
      </h2>
      <p className="text-sm text-[var(--color-text-muted)]">
        Paste your OpenAI API key. We'll validate it before storing.
      </p>

      <form onSubmit={handleTest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
            API key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setTested(false);
            }}
            placeholder="sk-..."
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono text-sm"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !apiKey.trim()}
          className="py-2 px-4 border border-[var(--color-border)] rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Testing…' : 'Test key'}
        </button>
      </form>

      {tested && (
        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-success)] mb-4">Key validated successfully.</p>
          <button
            type="button"
            onClick={handleContinue}
            className="py-3 px-6 bg-[var(--color-accent)] text-[var(--color-bg)] font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Continue to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
