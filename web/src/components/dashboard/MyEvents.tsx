/**
 * My Events Component
 *
 * Displays member's event registrations and history.
 */

import { useState, useEffect } from 'react';
import DashboardLayout from './DashboardLayout';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  status: 'registered' | 'waitlisted' | 'cancelled';
  registeredAt: string;
}

export default function MyEvents() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events/my-registrations`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data.registrations || []);
        } else if (res.status !== 404) {
          setError('Failed to load registrations');
        }
      } catch {
        // silent
        setError('Failed to load registrations');
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const upcomingEvents = registrations.filter(
    (r) => new Date(r.eventDate) >= new Date() && r.status !== 'cancelled'
  );
  const pastEvents = registrations.filter(
    (r) => new Date(r.eventDate) < new Date() || r.status === 'cancelled'
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Registered</span>;
      case 'waitlisted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Waitlisted</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="events">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="events">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Events</h1>
            <p className="text-gray-600 dark:text-gray-400">
              View your event registrations and history
            </p>
          </div>
          <a
            href="/calendar"
            className="btn btn-primary"
          >
            Browse Events
          </a>
        </div>

        {error && (
          <div className="alert alert-error mb-6">{error}</div>
        )}

        {/* Upcoming Events */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Events
          </h2>
          {upcomingEvents.length === 0 ? (
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-8 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No upcoming events registered
              </p>
              <a href="/calendar" className="text-navy-700 dark:text-blue-400 hover:underline">
                Browse available events
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {reg.eventTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(reg.eventDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(reg.status)}
                    <a
                      href={`/events/${reg.eventId}`}
                      className="text-navy-700 dark:text-blue-400 hover:underline text-sm"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Past Events
          </h2>
          {pastEvents.length === 0 ? (
            <div className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No past event registrations
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pastEvents.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border dark:border-stone-700 p-4 flex items-center justify-between opacity-75"
                >
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {reg.eventTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(reg.eventDate)}
                    </p>
                  </div>
                  {getStatusBadge(reg.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
