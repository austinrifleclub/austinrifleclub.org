/**
 * Event Calendar Component
 *
 * Interactive calendar showing club events and matches.
 */

import { useState, useEffect } from 'react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string;
  location: string | null;
  maxParticipants: number | null;
  cost: number;
  isPublic: boolean;
  registrationCount: number;
  spotsRemaining: number | null;
}

interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
  };
}

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

const eventTypeColors: Record<string, { bg: string; text: string; border: string }> = {
  match: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  class: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  meeting: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  workday: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  social: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  default: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function EventCard({ event }: { event: Event }) {
  const colors = eventTypeColors[event.eventType] || eventTypeColors.default;
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const isSameDay = startDate.toDateString() === endDate.toDateString();

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`text-xs font-medium ${colors.text} uppercase tracking-wider`}>
            {event.eventType}
          </span>
          <h3 className="font-semibold text-gray-900">{event.title}</h3>
        </div>
        {event.cost > 0 && (
          <span className="text-sm font-medium text-gray-700">
            ${event.cost}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>
          {formatDate(event.startTime)}
          {!isSameDay && ` - ${formatDate(event.endTime)}`}
        </p>
        <p>
          {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </p>
        {event.location && (
          <p className="text-gray-500">{event.location}</p>
        )}
      </div>

      {event.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
        {event.maxParticipants ? (
          <span className="text-xs text-gray-500">
            {event.spotsRemaining !== null && event.spotsRemaining > 0
              ? `${event.spotsRemaining} spots left`
              : event.spotsRemaining === 0
                ? 'Full'
                : `${event.registrationCount} registered`}
          </span>
        ) : (
          <span className="text-xs text-gray-500">Open registration</span>
        )}
        <a
          href={`/events/${event.id}`}
          className={`text-sm font-medium ${colors.text} hover:underline`}
        >
          Details →
        </a>
      </div>
    </div>
  );
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date();
        const threeMonthsLater = new Date();
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

        const params = new URLSearchParams({
          start: now.toISOString(),
          end: threeMonthsLater.toISOString(),
        });

        const response = await fetch(`${API_BASE}/api/events?${params}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data: EventsResponse = await response.json();
        setEvents(data.events);
        setError(null);
      } catch (err) {
        setError('Unable to load events. Please try again.');
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = filter === 'all'
    ? events
    : events.filter((e) => e.eventType === filter);

  const eventTypes = [...new Set(events.map((e) => e.eventType))];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-green-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Events
        </button>
        {eventTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filter === type
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No upcoming events found.</p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-green-700 hover:text-green-800 text-sm font-medium"
            >
              View all events
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Calendar Subscription */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="font-semibold mb-2">Subscribe to Our Calendar</h3>
        <p className="text-gray-600 text-sm mb-4">
          Add club events directly to your calendar app.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`${API_BASE}/api/events/calendar.ics`}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <span>📅</span> Apple Calendar
          </a>
          <a
            href={`${API_BASE}/api/events/calendar.ics`}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <span>📅</span> Google Calendar
          </a>
        </div>
      </div>
    </div>
  );
}
