/**
 * Reset Password Form Component
 *
 * Handles setting a new password with a reset token.
 */

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get token from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain a number';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <svg
            className="w-12 h-12 text-green-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-lg font-semibold text-green-800 mb-2">Password Reset Complete</h2>
          <p className="text-green-700 text-sm mb-4">
            Your password has been successfully reset.
          </p>
          <a
            href="/login"
            className="inline-block bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
          placeholder="••••••••"
        />
        <p className="text-xs text-gray-500 mt-1">
          Must be 8+ characters with uppercase, lowercase, and number
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !token}
        className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
