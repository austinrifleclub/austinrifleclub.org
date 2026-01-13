/**
 * Dashboard Home Component
 *
 * Main dashboard landing page showing:
 * - Account status summary
 * - Dues status with renewal action
 * - Upcoming registered events
 * - Recent activity
 * - Quick actions
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';
import { API_BASE } from '../../lib/api';

interface MemberProfile {
  id: string;
  badgeNumber: string | null;
  membershipType: string;
  status: string;
  firstName: string;
  lastName: string;
  expirationDate: string | null;
  volunteerCreditBalance: number;
  duesCurrent: boolean;
  inGracePeriod: boolean;
}

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string | null;
  eventType: string;
}

interface RangeStatus {
  id: string;
  name: string;
  status: 'open' | 'event' | 'closed' | 'maintenance';
}

export default function DashboardHome() {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [rangeStatus, setRangeStatus] = useState<RangeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch member profile
        const memberRes = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
          signal: abortController.signal,
        });
        if (memberRes.ok) {
          setMember(await memberRes.json());
        }

        // Fetch range status
        const rangeRes = await fetch(`${API_BASE}/api/range-status`, {
          signal: abortController.signal,
        });
        if (rangeRes.ok) {
          const data = await rangeRes.json();
          setRangeStatus(data.ranges || []);
        }

        // Fetch member's registered events
        const eventsRes = await fetch(`${API_BASE}/api/events/my-registrations`, {
          credentials: 'include',
          signal: abortController.signal,
        });
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          // Filter to upcoming events only
          const upcoming = (data || [])
            .filter((reg: { event: Event }) => new Date(reg.event.startTime) > new Date())
            .slice(0, 5)
            .map((reg: { event: Event }) => reg.event);
          setUpcomingEvents(upcoming);
        }
      } catch (err) {
        // Ignore abort errors (component unmounted)
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Dashboard data fetch failed:', err);
        setError('Unable to load dashboard data. Please try again.');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  const daysUntilExpiration = member?.expirationDate
    ? Math.ceil((new Date(member.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const openRanges = rangeStatus.filter((r) => r.status === 'open').length;
  const totalRanges = rangeStatus.length;

  return (
    <DashboardLayout activeTab="home">
      <div className="max-w-6xl mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="alert alert-error mb-6">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm underline hover:no-underline ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Welcome back{member ? `, ${member.firstName}` : ''}!
          </h1>
          <p className="text-secondary">
            Here's what's happening at Austin Rifle Club today.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Membership Status */}
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="stat-card-label">Membership</span>
              <span
                className={`status-badge status-badge-sm status-badge-${
                  member?.duesCurrent ? 'active' : member?.inGracePeriod ? 'grace' : 'expired'
                }`}
              >
                {member?.duesCurrent
                  ? 'Active'
                  : member?.inGracePeriod
                    ? 'Grace Period'
                    : 'Expired'}
              </span>
            </div>
            <p className="stat-card-value">
              {loading ? 'Loading...' : member?.membershipType || '—'}
            </p>
            {daysUntilExpiration !== null && daysUntilExpiration <= 60 && daysUntilExpiration > 0 && (
              <p className="text-sm text-warning-accent mt-1">
                Expires in {daysUntilExpiration} days
              </p>
            )}
          </div>

          {/* Range Status */}
          <div className="stat-card">
            <span className="stat-card-label">Range Status</span>
            <p className="stat-card-value">
              {openRanges} / {totalRanges} Open
            </p>
            <a href="/ranges" className="text-sm link-accent mt-1 inline-block">
              View all →
            </a>
          </div>

          {/* Volunteer Credits */}
          <div className="stat-card">
            <span className="stat-card-label">Volunteer Credits</span>
            <p className="stat-card-value">
              ${member?.volunteerCreditBalance?.toFixed(2) || '0.00'}
            </p>
            <a href="/dashboard/volunteer" className="text-sm link-accent mt-1 inline-block">
              Log hours →
            </a>
          </div>

          {/* Badge Number */}
          <div className="stat-card">
            <span className="stat-card-label">Badge Number</span>
            <p className="stat-card-value">
              {member?.badgeNumber || 'Pending'}
            </p>
            {!member?.badgeNumber && (
              <p className="text-sm text-muted mt-1">Complete orientation</p>
            )}
          </div>
        </div>

        {/* Renewal Alert */}
        {member && (daysUntilExpiration !== null && daysUntilExpiration <= 30 || !member.duesCurrent) && (
          <div className={`alert-banner mb-8 ${member.duesCurrent ? 'alert-banner-warning' : 'alert-banner-danger'}`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="alert-banner-title">
                  {member.duesCurrent ? 'Renewal Reminder' : 'Membership Expired'}
                </h3>
                <p className="alert-banner-text">
                  {member.duesCurrent
                    ? `Your membership expires on ${new Date(member.expirationDate!).toLocaleDateString()}. Renew early to maintain uninterrupted access.`
                    : member.inGracePeriod
                      ? 'You are in a 60-day grace period. Renew now to avoid losing access.'
                      : 'Your membership has expired. Renew to restore access.'}
                </p>
                {member.volunteerCreditBalance > 0 && (
                  <p className="text-sm mt-1 text-secondary">
                    You have ${member.volunteerCreditBalance.toFixed(2)} in volunteer credits to apply.
                  </p>
                )}
              </div>
              <a
                href="/dashboard/payments/renew"
                className={member.duesCurrent ? 'btn btn-warning' : 'btn btn-danger'}
              >
                Renew Now
              </a>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2 className="dashboard-section-title mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href="/dashboard/guests" className="quick-action">
                <span className="text-2xl">🎫</span>
                <div>
                  <p className="quick-action-title">Sign In Guest</p>
                  <p className="quick-action-subtitle">Bring a visitor</p>
                </div>
              </a>
              <a href="/calendar" className="quick-action">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="quick-action-title">View Events</p>
                  <p className="quick-action-subtitle">Matches & classes</p>
                </div>
              </a>
              <a href="/dashboard/profile" className="quick-action">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="quick-action-title">Update Profile</p>
                  <p className="quick-action-subtitle">Contact info</p>
                </div>
              </a>
              <a href="/dashboard/referrals" className="quick-action">
                <span className="text-2xl">🔗</span>
                <div>
                  <p className="quick-action-title">Refer a Friend</p>
                  <p className="quick-action-subtitle">Get $25 credit</p>
                </div>
              </a>
            </div>
          </div>

          {/* Range Status Summary */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Range Status</h2>
              <a href="/ranges" className="text-sm link-accent">View all →</a>
            </div>
            {rangeStatus.length === 0 ? (
              <p className="text-muted text-sm">Loading range status...</p>
            ) : (
              <div className="space-y-2">
                {rangeStatus.slice(0, 6).map((range) => (
                  <div key={range.id} className="list-item">
                    <span className="list-item-label">
                      <span className="font-medium">{range.id}</span> - {range.name}
                    </span>
                    <span className={`status-badge status-badge-sm status-${range.status}`}>
                      {range.status.charAt(0).toUpperCase() + range.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">My Upcoming Events</h2>
              <a href="/dashboard/events" className="text-sm link-accent">View all →</a>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted text-sm mb-3">No upcoming events registered</p>
                <a href="/calendar" className="text-sm link-accent font-medium">
                  Browse events →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="timeline-item timeline-accent py-1">
                    <p className="timeline-item-title">{event.title}</p>
                    <p className="timeline-item-text">
                      {new Date(event.startTime).toLocaleDateString()} at{' '}
                      {new Date(event.startTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Club News */}
          <div className="dashboard-section">
            <h2 className="dashboard-section-title mb-4">Club News</h2>
            <div className="space-y-4">
              <div className="timeline-item">
                <p className="timeline-item-title">Range C Improvements</p>
                <p className="timeline-item-text">New target stands installed at 200yd line</p>
                <span className="timeline-item-meta">2 days ago</span>
              </div>
              <div className="timeline-item">
                <p className="timeline-item-title">Spring Cleanup Day</p>
                <p className="timeline-item-text">Join us March 15th for our annual work day</p>
                <span className="timeline-item-meta">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
