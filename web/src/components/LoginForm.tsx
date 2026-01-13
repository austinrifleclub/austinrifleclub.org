/**
 * Login Form Component
 *
 * Passwordless authentication showing all options: Passkey, Email Link, and Google.
 */

import { useState, useEffect } from 'react';
import { isWebAuthnSupported, authenticateWithPasskey } from '../lib/passkey';
import { API_BASE } from '../lib/api';

interface LoginFormProps {
  showPasskey?: boolean;
}

export default function LoginForm({ showPasskey = true }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<'passkey' | 'email' | 'google' | null>(null);
  const [passkeySupported, setPasskeySupported] = useState(false);

  useEffect(() => {
    setPasskeySupported(isWebAuthnSupported());
  }, []);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading('email');

    try {
      const callbackURL = `${window.location.origin}/dashboard`;
      const response = await fetch(`${API_BASE}/api/auth/sign-in/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, callbackURL }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage = typeof data?.error === 'string'
          ? data.error
          : typeof data?.message === 'string'
            ? data.message
            : `Failed to send magic link (${response.status})`;
        throw new Error(errorMessage);
      }

      setSuccess('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handlePasskeyLogin = async () => {
    setError(null);
    setSuccess(null);
    setLoading('passkey');

    try {
      const result = await authenticateWithPasskey();

      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        setError(result.error || 'Passkey login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Passkey login failed');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleLogin = () => {
    setLoading('google');
    window.location.href = `${API_BASE}/api/auth/sign-in/social/google`;
  };

  return (
    <div className="space-y-4">
      {/* Error/Success Messages */}
      {error && (
        <div className="alert alert-error text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success text-sm text-center">
          Check your email for a sign-in link.
          <br />
          It expires in 15 minutes.
        </div>
      )}

      {/* Passkey Option */}
      {showPasskey && passkeySupported && (
        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={loading !== null}
          className="btn btn-primary w-full py-3 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading === 'passkey' ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Sign in with Passkey
            </>
          )}
        </button>
      )}

      {/* Email Link Form */}
      <form onSubmit={handleMagicLinkLogin}>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="form-input has-inline-btn w-full"
            placeholder="you@example.com"
            disabled={loading !== null || !!success}
          />
          <button
            type="submit"
            disabled={loading !== null || !!success || !email}
            className="btn-inline"
          >
            {loading === 'email' ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
            Send Link
          </button>
        </div>
      </form>

      {/* Google Option */}
      <button
        type="button"
        className="btn btn-secondary w-full py-3 disabled:opacity-50 flex items-center justify-center gap-3"
        onClick={handleGoogleLogin}
        disabled={loading !== null}
      >
        {loading === 'google' ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Redirecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </>
        )}
      </button>
    </div>
  );
}
