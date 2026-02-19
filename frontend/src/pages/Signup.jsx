import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Magic } from 'magic-sdk';

const MAGIC_KEY = import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY;

export default function Signup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSent(false);
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
      const redirectURI = `${window.location.origin}/auth/verify`;
      await magic.auth.loginWithMagicLink({
        email: trimmed,
        redirectURI,
        showUI: false,
      });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <header className="border-b border-[var(--color-border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors">
            Mālama AI Carbon
          </Link>
          <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-[var(--color-text)] mb-2">
          Create account
        </h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          We'll send you a magic link. No password required.
        </p>

        {sent ? (
          <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-center">
            <p className="text-[var(--color-text)] font-medium">Check your email</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-2">
              Click the link we sent to {email} to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
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
              className="w-full py-3 px-4 bg-[var(--color-accent)] text-[var(--color-bg)] font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-[var(--color-text-muted)] text-center">
          <Link to="/estimate" className="text-[var(--color-accent)] hover:underline">
            Back to estimate
          </Link>
        </p>
      </main>
    </div>
  );
}
