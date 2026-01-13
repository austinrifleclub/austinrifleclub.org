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
import MembershipGate, { type MemberStatus } from '../ui/MembershipGate';
import { API_BASE } from '../../lib/api';

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
  const [memberStatus, setMemberStatus] = useState<MemberStatus>(null);
  const [duesCurrent, setDuesCurrent] = useState(false);

  // New guest form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [waiverAgreed, setWaiverAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch member status first
        const memberRes = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });
        if (memberRes.ok) {
          const memberData = await memberRes.json();
          setMemberStatus(memberData.status as MemberStatus);
          setDuesCurrent(memberData.duesCurrent);
        }

        // Fetch guests
        const res = await fetch(`${API_BASE}/api/guests`, {
          credentials: 'include',
        });
        if (res.ok) {
          setGuests(await res.json());
        }
      } catch (err) {
        console.error('Failed to load guests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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
        } catch {
          // silent
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
      <MembershipGate feature="guests" memberStatus={memberStatus} duesCurrent={duesCurrent}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary">Guest Sign-In</h1>
              <p className="text-secondary">Sign in up to 4 guests per visit</p>
            </div>
            <button onClick={() => setShowNewGuestForm(true)} className="btn btn-primary">
              + New Guest
            </button>
          </div>

        {/* Offline indicator */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="alert alert-warning mb-6">
            <p className="text-sm">
              <strong>Offline Mode:</strong> Guest sign-ins will be saved locally and synced when
              you're back online.
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-6 alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        {/* Today's Sign-Ins */}
        {todaySignIns.length > 0 && (
          <div className="dashboard-section mb-6">
            <h2 className="dashboard-section-title mb-4">Today's Sign-Ins ({todaySignIns.length})</h2>
            <div className="space-y-2">
              {todaySignIns.map((signIn) => (
                <div key={signIn.id} className="list-item py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium text-primary">{signIn.name}</span>
                    <span className="text-muted text-sm ml-2">
                      {new Date(signIn.signedInAt).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className={`status-badge status-badge-sm ${signIn.synced ? 'status-badge-active' : 'status-badge-grace'}`}>
                    {signIn.synced ? 'Synced' : 'Pending sync'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Guest Form */}
        {showNewGuestForm && (
          <div className="dashboard-section mb-6">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Sign In New Guest</h2>
              <button onClick={() => setShowNewGuestForm(false)} className="text-muted hover:text-primary">
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickSignIn} className="space-y-4">
              <div>
                <label className="form-label">Guest Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="form-input w-full"
                  placeholder="John Doe"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="form-input w-full"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="form-label">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="form-input w-full"
                    placeholder="(512) 555-1234"
                  />
                </div>
              </div>

              {/* Waiver */}
              <div className="section-card p-4">
                <h3 className="font-medium mb-2 text-primary">Range Safety Waiver</h3>
                <div className="text-sm text-secondary max-h-32 overflow-y-auto mb-3 p-2 section-highlight rounded">
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
                    className="form-checkbox"
                  />
                  <span className="text-sm text-secondary">Guest has read and agrees to the waiver</span>
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowNewGuestForm(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !waiverAgreed} className="btn btn-primary">
                  {submitting ? 'Signing In...' : 'Sign In Guest'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Previous Guests */}
        <div className="dashboard-section">
          <h2 className="dashboard-section-title mb-4">Previous Guests</h2>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full"
            />
          </div>

          {loading ? (
            <div className="loading-container py-8">
              <div className="loading-spinner" />
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-muted">
              {searchTerm ? 'No guests found matching your search.' : 'No previous guests found.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGuests.map((guest) => (
                <div key={guest.id} className="quick-action justify-between">
                  <div>
                    <p className="font-medium text-primary">{guest.name}</p>
                    <p className="text-sm text-muted">
                      {guest.visitCountCurrentYear} visit
                      {guest.visitCountCurrentYear !== 1 ? 's' : ''} this year
                      {guest.lastVisitAt && (
                        <> · Last: {new Date(guest.lastVisitAt).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <button onClick={() => handleReturningGuestSignIn(guest)} className="btn btn-secondary btn-sm">
                    Sign In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Guest Policy */}
          <div className="mt-6 section-card p-4 text-sm text-secondary">
            <h3 className="font-medium text-primary mb-2">Guest Policy</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Members may bring up to 4 guests per visit</li>
              <li>Guests must complete waiver on each visit</li>
              <li>Guest must remain with member at all times</li>
              <li>Same guest may visit up to 3 times per year before requiring membership</li>
            </ul>
          </div>
        </div>
      </MembershipGate>
    </DashboardLayout>
  );
}
