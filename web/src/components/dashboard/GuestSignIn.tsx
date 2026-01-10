/**
 * Guest Sign-In Component
 *
 * Allows members to sign in guests at the range.
 * Features:
 * - Quick sign-in for new guests
 * - Search for returning guests
 * - Waiver agreement
 * - Offline support with sync
 *
 * @see features.md Section 3.4 for requirements
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  visitCountCurrentYear: number;
  lastVisitAt: string | null;
  status: string;
}

interface PendingSignIn {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  signedInAt: string;
  synced: boolean;
}

export default function GuestSignIn() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewGuestForm, setShowNewGuestForm] = useState(false);
  const [pendingSignIns, setPendingSignIns] = useState<PendingSignIn[]>([]);

  // New guest form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/guests`, {
          credentials: 'include',
        });
        if (res.ok) {
          setGuests(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch guests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();

    // Load pending sign-ins from localStorage
    const stored = localStorage.getItem('arc_pending_guest_signins');
    if (stored) {
      setPendingSignIns(JSON.parse(stored));
    }
  }, []);

  // Sync pending sign-ins when online
  useEffect(() => {
    const syncPending = async () => {
      if (!navigator.onLine) return;

      const unsynced = pendingSignIns.filter((p) => !p.synced);
      if (unsynced.length === 0) return;

      for (const signIn of unsynced) {
        try {
          await fetch(`${API_BASE}/api/guests/quick-sign-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              name: signIn.name,
              email: signIn.email,
              phone: signIn.phone,
              waiverAgreed: true,
            }),
          });

          setPendingSignIns((prev) => {
            const updated = prev.map((p) =>
              p.id === signIn.id ? { ...p, synced: true } : p
            );
            localStorage.setItem('arc_pending_guest_signins', JSON.stringify(updated));
            return updated;
          });
        } catch (err) {
          console.error('Failed to sync sign-in:', err);
        }
      }
    };

    syncPending();
    window.addEventListener('online', syncPending);
    return () => window.removeEventListener('online', syncPending);
  }, [pendingSignIns]);

  const handleQuickSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waiverAgreed) {
      setMessage({ type: 'error', text: 'Guest must agree to the waiver.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const signInData: PendingSignIn = {
      id: crypto.randomUUID(),
      name: newName,
      email: newEmail || undefined,
      phone: newPhone || undefined,
      signedInAt: new Date().toISOString(),
      synced: false,
    };

    try {
      if (navigator.onLine) {
        const res = await fetch(`${API_BASE}/api/guests/quick-sign-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            name: newName,
            email: newEmail || undefined,
            phone: newPhone || undefined,
            waiverAgreed: true,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to sign in guest');
        }

        signInData.synced = true;
        setMessage({ type: 'success', text: `${newName} signed in successfully!` });
      } else {
        setMessage({
          type: 'success',
          text: `${newName} signed in offline. Will sync when connected.`,
        });
      }

      // Add to pending list for tracking
      setPendingSignIns((prev) => {
        const updated = [signInData, ...prev];
        localStorage.setItem('arc_pending_guest_signins', JSON.stringify(updated));
        return updated;
      });

      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setWaiverAgreed(false);
      setShowNewGuestForm(false);

      // Refresh guest list
      if (navigator.onLine) {
        const res = await fetch(`${API_BASE}/api/guests`, { credentials: 'include' });
        if (res.ok) setGuests(await res.json());
      }
    } catch (err) {
      // Save offline if online request failed
      setPendingSignIns((prev) => {
        const updated = [signInData, ...prev];
        localStorage.setItem('arc_pending_guest_signins', JSON.stringify(updated));
        return updated;
      });
      setMessage({
        type: 'success',
        text: `${newName} signed in offline. Will sync when connected.`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturningGuestSignIn = async (guest: Guest) => {
    if (!confirm(`Sign in ${guest.name}? They will need to agree to the waiver.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/guests/${guest.id}/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ waiverAgreed: true }),
      });

      if (!res.ok) throw new Error('Failed to sign in guest');

      setMessage({ type: 'success', text: `${guest.name} signed in successfully!` });

      // Refresh guest list
      const refreshRes = await fetch(`${API_BASE}/api/guests`, { credentials: 'include' });
      if (refreshRes.ok) setGuests(await refreshRes.json());
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to sign in guest. Please try again.' });
    }
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySignIns = pendingSignIns.filter((p) => {
    const signInDate = new Date(p.signedInAt).toDateString();
    const today = new Date().toDateString();
    return signInDate === today;
  });

  return (
    <DashboardLayout activeTab="guests">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Guest Sign-In</h1>
            <p className="text-gray-600">Sign in up to 4 guests per visit</p>
          </div>
          <button
            onClick={() => setShowNewGuestForm(true)}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + New Guest
          </button>
        </div>

        {/* Offline indicator */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Offline Mode:</strong> Guest sign-ins will be saved locally and synced when
              you're back online.
            </p>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Today's Sign-Ins */}
        {todaySignIns.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="font-semibold text-lg mb-4">Today's Sign-Ins ({todaySignIns.length})</h2>
            <div className="space-y-2">
              {todaySignIns.map((signIn) => (
                <div
                  key={signIn.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <span className="font-medium">{signIn.name}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(signIn.signedInAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      signIn.synced ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {signIn.synced ? 'Synced' : 'Pending sync'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Guest Form */}
        {showNewGuestForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Sign In New Guest</h2>
              <button
                onClick={() => setShowNewGuestForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guest Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="(512) 555-1234"
                  />
                </div>
              </div>

              {/* Waiver */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium mb-2">Range Safety Waiver</h3>
                <div className="text-sm text-gray-600 max-h-32 overflow-y-auto mb-3 p-2 bg-white rounded border">
                  <p className="mb-2">
                    By signing below, guest acknowledges and agrees to the following:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      I understand that shooting activities involve inherent risks and I voluntarily
                      assume those risks.
                    </li>
                    <li>
                      I agree to follow all range rules and safety procedures as posted or instructed
                      by range officers.
                    </li>
                    <li>
                      I will remain with my sponsoring member at all times while on club property.
                    </li>
                    <li>
                      I release Austin Rifle Club, its officers, directors, and members from any
                      liability for injuries or damages.
                    </li>
                    <li>
                      I am not prohibited by law from possessing firearms and am at least 18 years
                      of age (or accompanied by parent/guardian).
                    </li>
                  </ul>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={waiverAgreed}
                    onChange={(e) => setWaiverAgreed(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">Guest has read and agrees to the waiver</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewGuestForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !waiverAgreed}
                  className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Signing In...' : 'Sign In Guest'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Previous Guests */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="font-semibold text-lg mb-4">Previous Guests</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700 mx-auto"></div>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No guests found matching your search.' : 'No previous guests found.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{guest.name}</p>
                    <p className="text-sm text-gray-500">
                      {guest.visitCountCurrentYear} visit
                      {guest.visitCountCurrentYear !== 1 ? 's' : ''} this year
                      {guest.lastVisitAt && (
                        <> · Last: {new Date(guest.lastVisitAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReturningGuestSignIn(guest)}
                    className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guest Policy */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <h3 className="font-medium text-gray-800 mb-2">Guest Policy</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Members may bring up to 4 guests per visit</li>
            <li>Guests must complete waiver on each visit</li>
            <li>Guest must remain with member at all times</li>
            <li>Same guest may visit up to 3 times per year before requiring membership</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
