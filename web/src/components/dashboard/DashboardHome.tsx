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

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch member profile
        const memberRes = await fetch(`${API_BASE}/api/members/me`, {
          credentials: 'include',
        });
        if (memberRes.ok) {
          setMember(await memberRes.json());
        }

        // Fetch range status
        const rangeRes = await fetch(`${API_BASE}/api/range-status`);
        if (rangeRes.ok) {
          const data = await rangeRes.json();
          setRangeStatus(data.ranges || []);
        }

        // TODO: Fetch registered events when endpoint exists
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const daysUntilExpiration = member?.expirationDate
    ? Math.ceil((new Date(member.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const openRanges = rangeStatus.filter((r) => r.status === 'open').length;
  const totalRanges = rangeStatus.length;

  return (
    <DashboardLayout activeTab="home">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back{member ? `, ${member.firstName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening at Austin Rifle Club today.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Membership Status */}
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Membership</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  member?.duesCurrent
                    ? 'bg-green-100 text-green-700'
                    : member?.inGracePeriod
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                }`}
              >
                {member?.duesCurrent
                  ? 'Active'
                  : member?.inGracePeriod
                    ? 'Grace Period'
                    : 'Expired'}
              </span>
            </div>
            <p className="text-xl font-semibold">{member?.membershipType || 'Loading...'}</p>
            {daysUntilExpiration !== null && daysUntilExpiration <= 60 && daysUntilExpiration > 0 && (
              <p className="text-sm text-yellow-600 mt-1">
                Expires in {daysUntilExpiration} days
              </p>
            )}
          </div>

          {/* Range Status */}
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <span className="text-gray-500 text-sm">Range Status</span>
            <p className="text-xl font-semibold mt-2">
              {openRanges} / {totalRanges} Open
            </p>
            <a
              href="/range-status"
              className="text-sm text-green-700 hover:text-green-800 mt-1 inline-block"
            >
              View all →
            </a>
          </div>

          {/* Volunteer Credits */}
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <span className="text-gray-500 text-sm">Volunteer Credits</span>
            <p className="text-xl font-semibold mt-2">
              ${member?.volunteerCreditBalance?.toFixed(2) || '0.00'}
            </p>
            <a
              href="/dashboard/volunteer"
              className="text-sm text-green-700 hover:text-green-800 mt-1 inline-block"
            >
              Log hours →
            </a>
          </div>

          {/* Badge Number */}
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <span className="text-gray-500 text-sm">Badge Number</span>
            <p className="text-xl font-semibold mt-2">
              {member?.badgeNumber || 'Pending'}
            </p>
            {!member?.badgeNumber && (
              <p className="text-sm text-gray-500 mt-1">Complete orientation</p>
            )}
          </div>
        </div>

        {/* Renewal Alert */}
        {member && (daysUntilExpiration !== null && daysUntilExpiration <= 30 || !member.duesCurrent) && (
          <div
            className={`mb-8 p-4 rounded-lg border ${
              member.duesCurrent
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className={`font-semibold ${
                    member.duesCurrent ? 'text-yellow-800' : 'text-red-800'
                  }`}
                >
                  {member.duesCurrent ? 'Renewal Reminder' : 'Membership Expired'}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    member.duesCurrent ? 'text-yellow-700' : 'text-red-700'
                  }`}
                >
                  {member.duesCurrent
                    ? `Your membership expires on ${new Date(member.expirationDate!).toLocaleDateString()}. Renew early to maintain uninterrupted access.`
                    : member.inGracePeriod
                      ? 'You are in a 30-day grace period. Renew now to avoid losing access.'
                      : 'Your membership has expired. Renew to restore access.'}
                </p>
                {member.volunteerCreditBalance > 0 && (
                  <p className="text-sm mt-1 text-gray-600">
                    You have ${member.volunteerCreditBalance.toFixed(2)} in volunteer credits to apply.
                  </p>
                )}
              </div>
              <a
                href="/dashboard/payments/renew"
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  member.duesCurrent
                    ? 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Renew Now
              </a>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/dashboard/guests"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">🎫</span>
                <div>
                  <p className="font-medium text-sm">Sign In Guest</p>
                  <p className="text-xs text-gray-500">Bring a visitor</p>
                </div>
              </a>
              <a
                href="/calendar"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">📅</span>
                <div>
                  <p className="font-medium text-sm">View Events</p>
                  <p className="text-xs text-gray-500">Matches & classes</p>
                </div>
              </a>
              <a
                href="/dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium text-sm">Update Profile</p>
                  <p className="text-xs text-gray-500">Contact info</p>
                </div>
              </a>
              <a
                href="/dashboard/referrals"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">🔗</span>
                <div>
                  <p className="font-medium text-sm">Refer a Friend</p>
                  <p className="text-xs text-gray-500">Get $25 credit</p>
                </div>
              </a>
            </div>
          </div>

          {/* Range Status Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Range Status</h2>
              <a href="/range-status" className="text-sm text-green-700 hover:text-green-800">
                View all →
              </a>
            </div>
            {rangeStatus.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading range status...</p>
            ) : (
              <div className="space-y-2">
                {rangeStatus.slice(0, 6).map((range) => (
                  <div key={range.id} className="flex items-center justify-between py-1">
                    <span className="text-sm">
                      <span className="font-medium">{range.id}</span> - {range.name}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        range.status === 'open'
                          ? 'bg-green-100 text-green-700'
                          : range.status === 'event'
                            ? 'bg-blue-100 text-blue-700'
                            : range.status === 'maintenance'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {range.status.charAt(0).toUpperCase() + range.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">My Upcoming Events</h2>
              <a href="/dashboard/events" className="text-sm text-green-700 hover:text-green-800">
                View all →
              </a>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">No upcoming events registered</p>
                <a
                  href="/calendar"
                  className="text-sm text-green-700 hover:text-green-800 font-medium"
                >
                  Browse events →
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="border-l-2 border-green-500 pl-3 py-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-gray-500">
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
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="font-semibold text-lg mb-4">Club News</h2>
            <div className="space-y-4">
              <div className="border-l-2 border-gray-200 pl-3">
                <p className="font-medium text-sm">Range C Improvements</p>
                <p className="text-xs text-gray-500">
                  New target stands installed at 200yd line
                </p>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              <div className="border-l-2 border-gray-200 pl-3">
                <p className="font-medium text-sm">Spring Cleanup Day</p>
                <p className="text-xs text-gray-500">
                  Join us March 15th for our annual work day
                </p>
                <span className="text-xs text-gray-400">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
