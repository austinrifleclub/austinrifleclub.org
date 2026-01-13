/**
 * Passkey (WebAuthn) utility functions
 *
 * Uses @simplewebauthn/browser for browser WebAuthn API interactions.
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

export interface PasskeyInfo {
  id: string;
  name: string | null;
  deviceType: string | null;
  createdAt: string;
}

/**
 * Check if WebAuthn is supported in this browser
 */
export function isWebAuthnSupported(): boolean {
  return browserSupportsWebAuthn();
}

/**
 * Check if platform authenticator (Face ID, Touch ID, Windows Hello) is available
 */
export async function hasPlatformAuthenticator(): Promise<boolean> {
  return platformAuthenticatorIsAvailable();
}

/**
 * Register a new passkey for the current user
 */
export async function registerPasskey(
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Get registration options from server
    const optionsRes = await fetch(
      `${API_BASE}/api/auth/passkey/generate-registration-options`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!optionsRes.ok) {
      const error = await optionsRes.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get registration options');
    }

    const options = await optionsRes.json();

    // Step 2: Start WebAuthn registration ceremony
    const attestation = await startRegistration({ optionsJSON: options });

    // Step 3: Verify with server and store credential
    const verifyRes = await fetch(
      `${API_BASE}/api/auth/passkey/verify-registration`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...attestation,
          name: name || 'My Passkey',
        }),
      }
    );

    if (!verifyRes.ok) {
      const error = await verifyRes.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to verify registration');
    }

    return { success: true };
  } catch (error) {
    // Handle user cancellation
    if (error instanceof Error && error.name === 'NotAllowedError') {
      return { success: false, error: 'Registration was cancelled' };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Passkey registration failed',
    };
  }
}

/**
 * Authenticate with a passkey (login)
 */
export async function authenticateWithPasskey(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Step 1: Get authentication options from server
    const optionsRes = await fetch(
      `${API_BASE}/api/auth/passkey/generate-authentication-options`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!optionsRes.ok) {
      const error = await optionsRes.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to get authentication options');
    }

    const options = await optionsRes.json();

    // Step 2: Start WebAuthn authentication ceremony
    const assertion = await startAuthentication({ optionsJSON: options });

    // Step 3: Verify with server and create session
    const verifyRes = await fetch(
      `${API_BASE}/api/auth/passkey/verify-authentication`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assertion),
      }
    );

    if (!verifyRes.ok) {
      const error = await verifyRes.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to verify authentication');
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.name === 'NotAllowedError') {
      return { success: false, error: 'Authentication was cancelled' };
    }
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Passkey authentication failed',
    };
  }
}

/**
 * List user's registered passkeys
 */
export async function listPasskeys(): Promise<PasskeyInfo[]> {
  const res = await fetch(`${API_BASE}/api/auth/passkey/list-user-passkeys`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to list passkeys');
  }

  const data = await res.json();
  return data.passkeys || [];
}

/**
 * Delete a passkey
 */
export async function deletePasskey(passkeyId: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/auth/passkey/delete-passkey`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: passkeyId }),
  });

  return res.ok;
}
