/**
 * Passkey Settings Component
 *
 * Allows users to register and manage passkeys from their dashboard.
 */

import { useState, useEffect } from 'react';
import {
  isWebAuthnSupported,
  hasPlatformAuthenticator,
  registerPasskey,
  listPasskeys,
  deletePasskey,
  type PasskeyInfo,
} from '../../lib/passkey';

export default function PasskeySettings() {
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [supported, setSupported] = useState(false);
  const [hasPlatform, setHasPlatform] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passkeyName, setPasskeyName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);

  useEffect(() => {
    const init = async () => {
      const webauthnSupported = isWebAuthnSupported();
      setSupported(webauthnSupported);

      if (webauthnSupported) {
        setHasPlatform(await hasPlatformAuthenticator());
        await loadPasskeys();
      }
      setLoading(false);
    };
    init();
  }, []);

  const loadPasskeys = async () => {
    try {
      const list = await listPasskeys();
      setPasskeys(list);
    } catch {
      // silent
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    setError(null);
    setSuccess(null);

    const result = await registerPasskey(passkeyName || 'My Passkey');

    if (result.success) {
      setSuccess('Passkey registered successfully!');
      setShowNameDialog(false);
      setPasskeyName('');
      await loadPasskeys();
    } else {
      setError(result.error || 'Failed to register passkey');
    }

    setRegistering(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this passkey?')) return;

    const success = await deletePasskey(id);
    if (success) {
      setSuccess('Passkey removed successfully');
      await loadPasskeys();
    } else {
      setError('Failed to delete passkey');
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface rounded w-1/4"></div>
          <div className="h-4 bg-surface rounded w-1/2"></div>
          <div className="h-20 bg-surface rounded"></div>
        </div>
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="card p-6 bg-surface">
        <div className="flex items-start gap-4">
          <div className="icon-circle-sm icon-circle-muted flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-primary mb-1">
              Passkeys
            </h3>
            <p className="text-sm text-secondary">
              Your browser does not support passkeys. Please use a modern browser
              like Chrome, Safari, or Edge to set up passkey authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="icon-circle-sm icon-circle-primary flex-shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-primary">
              Passkeys
            </h3>
            <p className="text-sm text-secondary mt-1">
              Sign in faster using your device's biometrics or security key.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNameDialog(true)}
          disabled={registering}
          className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Passkey
        </button>
      </div>

      {error && (
        <div className="alert alert-error mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4 text-sm">
          {success}
        </div>
      )}

      {/* Passkey Name Dialog */}
      {showNameDialog && (
        <div className="form-section mb-4 p-4">
          <label className="form-label mb-2">
            Name this passkey (optional)
          </label>
          <input
            type="text"
            value={passkeyName}
            onChange={(e) => setPasskeyName(e.target.value)}
            placeholder="e.g., MacBook Pro, iPhone, YubiKey"
            className="form-input w-full mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleRegister}
              disabled={registering}
              className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50 flex items-center gap-2"
            >
              {registering ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Registering...
                </>
              ) : (
                'Continue'
              )}
            </button>
            <button
              onClick={() => {
                setShowNameDialog(false);
                setPasskeyName('');
              }}
              className="btn btn-ghost text-sm px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Passkey List */}
      {passkeys.length > 0 ? (
        <div className="space-y-3">
          {passkeys.map((pk) => (
            <div key={pk.id} className="list-item">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {pk.deviceType === 'platform' ? '🔐' : '🔑'}
                </span>
                <div>
                  <p className="font-medium text-primary">
                    {pk.name || 'Passkey'}
                  </p>
                  <p className="text-xs text-muted">
                    Added {new Date(pk.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(pk.id)}
                className="text-danger-accent text-sm font-medium hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="icon-circle-sm icon-circle-muted mx-auto mb-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted">
            No passkeys registered yet.
          </p>
          <p className="text-sm text-muted">
            Add one to enable passwordless sign-in.
          </p>
        </div>
      )}

      {hasPlatform && passkeys.length === 0 && !showNameDialog && (
        <div className="alert alert-info mt-4 text-sm flex items-start gap-2">
          <svg
            className="w-5 h-5 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Tip:</strong> Your device supports built-in biometrics.
            Register a passkey to sign in with Face ID, Touch ID, or Windows Hello.
          </span>
        </div>
      )}
    </div>
  );
}
