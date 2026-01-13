/**
 * Event Calendar Component
 *
 * Interactive calendar with sections for:
 * - New Members (orientation/safety eval)
 * - This Week compact strip
 * - Browse by category with match discipline filter
 */

import { useState, useEffect, useMemo } from 'react';

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

// Friendly display names for event types
const eventTypeLabels: Record<string, string> = {
  match: 'Match',
  class: 'Class',
  arc_meeting: 'Meeting',
  arc_education: 'Education',
  arc_event: 'Club Event',
  work_day: 'Work Day',
  youth_event: 'Youth',
  organized_practice: 'Practice',
  range_unavailable: 'Range Closed',
};

// Map event types to CSS class names
const eventTypeClasses: Record<string, string> = {
  match: 'event-match',
  class: 'event-class',
  arc_meeting: 'event-meeting',
  arc_education: 'event-education',
  arc_event: 'event-club',
  work_day: 'event-workday',
  youth_event: 'event-youth',
  organized_practice: 'event-practice',
  range_unavailable: 'event-closed',
};

// Match discipline detection from title
const matchDisciplines: { pattern: RegExp; label: string; key: string }[] = [
  { pattern: /uspsa/i, label: 'USPSA', key: 'uspsa' },
  { pattern: /idpa/i, label: 'IDPA', key: 'idpa' },
  { pattern: /steel challenge/i, label: 'Steel Challenge', key: 'steel' },
  { pattern: /high power|highpower/i, label: 'High Power Rifle', key: 'highpower' },
  { pattern: /benchrest/i, label: 'Benchrest', key: 'benchrest' },
  { pattern: /silhouette/i, label: 'Silhouette', key: 'silhouette' },
  { pattern: /2700|bullseye/i, label: '2700 Bullseye', key: '2700' },
];

function getMatchDiscipline(title: string): string | null {
  for (const disc of matchDisciplines) {
    if (disc.pattern.test(title)) return disc.key;
  }
  return null;
}

function getEventClass(eventType: string): string {
  return eventTypeClasses[eventType] || 'event-default';
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Get start of week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get end of week (Saturday)
function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

// New Members Section
function NewMembersSection({ events }: { events: Event[] }) {
  const newMemberEvents = events.filter(
    (e) => e.eventType === 'arc_education' ||
           e.title.toLowerCase().includes('orientation') ||
           e.title.toLowerCase().includes('safety eval') ||
           e.title.toLowerCase().includes('nmse') ||
           e.title.toLowerCase().includes('nmo')
  ).slice(0, 2);

  if (newMemberEvents.length === 0) return null;

  return (
    <div className="section-highlight mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎯</span>
        <h2 className="font-semibold text-primary">New Members Start Here</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {newMemberEvents.map((event) => (
          <a
            key={event.id}
            href={`/events/${event.id}`}
            className="card p-3 hover:shadow-md transition-shadow"
          >
            <div className="font-medium text-primary">{event.title}</div>
            <div className="text-sm text-secondary mt-1">
              {formatFullDate(event.startTime)} @ {formatTime(event.startTime)}
            </div>
            {event.location && (
              <div className="text-xs text-muted mt-1">{event.location}</div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}

// This Week Compact Strip
function ThisWeekStrip({ events }: { events: Event[] }) {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);

  // Group events by day of week
  const eventsByDay: Record<number, Event[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

  events.forEach((event) => {
    const eventDate = new Date(event.startTime);
    if (eventDate >= weekStart && eventDate <= weekEnd) {
      const dayOfWeek = eventDate.getDay();
      eventsByDay[dayOfWeek].push(event);
    }
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = now.getDay();

  // Format week range for header
  const weekRangeStr = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  return (
    <div className="section-card mb-6">
      <h2 className="font-semibold text-primary mb-3">
        This Week <span className="font-normal text-sm text-muted">({weekRangeStr})</span>
      </h2>
      <div className="grid grid-cols-7 gap-1 text-center">
        {dayNames.map((day, idx) => {
          const dayEvents = eventsByDay[idx];
          const isToday = idx === today;
          const dayDate = new Date(weekStart);
          dayDate.setDate(dayDate.getDate() + idx);
          const isPast = dayDate < now && !isToday;

          return (
            <div key={day} className={`${isPast ? 'opacity-50' : ''}`}>
              <div className={`text-xs font-medium mb-1 ${isToday ? 'text-accent' : 'text-muted'}`}>
                {day}
              </div>
              <div className={`text-xs mb-1 ${isToday ? 'text-accent font-medium' : 'text-muted'}`}>
                {dayDate.getDate()}
              </div>
              <div className="min-h-[60px] space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const eventClass = getEventClass(event.eventType);
                  const shortTitle = event.title.length > 12
                    ? event.title.substring(0, 11) + '…'
                    : event.title;
                  return (
                    <a
                      key={event.id}
                      href={`/events/${event.id}`}
                      className={`event-badge-compact ${eventClass}`}
                      title={event.title}
                    >
                      {shortTitle}
                    </a>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper to build calendar URL based on filter
function buildCalendarUrl(categoryFilter: string, matchFilter: string, apiBase: string) {
  const params = new URLSearchParams();
  if (categoryFilter !== 'all') {
    params.set('type', categoryFilter);
  }
  if (categoryFilter === 'match' && matchFilter !== 'all') {
    params.set('discipline', matchFilter);
  }
  const queryString = params.toString();
  return `${apiBase}/api/events/calendar.ics${queryString ? '?' + queryString : ''}`;
}

// Get friendly name for current filter
function getFilterName(categoryFilter: string, matchFilter: string) {
  if (categoryFilter === 'match' && matchFilter !== 'all') {
    const names: Record<string, string> = {
      uspsa: 'USPSA', idpa: 'IDPA', steel: 'Steel Challenge',
      highpower: 'High Power', benchrest: 'Benchrest',
      silhouette: 'Silhouette', '2700': '2700 Bullseye',
    };
    return names[matchFilter] || matchFilter;
  }
  if (categoryFilter !== 'all') {
    return eventTypeLabels[categoryFilter] || categoryFilter;
  }
  return 'All Events';
}

// Event Card (compact version)
function EventCard({ event }: { event: Event }) {
  const eventClass = getEventClass(event.eventType);

  return (
    <a
      href={`/events/${event.id}`}
      className={`event-card ${eventClass}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`event-type-label ${eventClass}`}>
            {eventTypeLabels[event.eventType] || event.eventType}
          </span>
          <h3 className="font-semibold text-primary text-sm line-clamp-1 mt-1">{event.title}</h3>
          <div className="text-xs text-muted mt-0.5">{event.location || 'TBD'}</div>
        </div>
        <div className="text-right text-xs shrink-0">
          <div className="text-secondary">{formatFullDate(event.startTime)}</div>
          <div className="text-muted">{formatTime(event.startTime)}</div>
        </div>
      </div>
    </a>
  );
}

// Main Component
export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [matchFilter, setMatchFilter] = useState<string>('all');
  const [showMatchDropdown, setShowMatchDropdown] = useState(false);

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

  // Get available match disciplines from current events
  const availableDisciplines = useMemo(() => {
    const matches = events.filter((e) => e.eventType === 'match');
    const disciplines = new Set<string>();
    matches.forEach((m) => {
      const disc = getMatchDiscipline(m.title);
      if (disc) disciplines.add(disc);
    });
    return matchDisciplines.filter((d) => disciplines.has(d.key));
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Category filter
    if (categoryFilter === 'match') {
      filtered = filtered.filter((e) => e.eventType === 'match');
      // Apply match discipline sub-filter
      if (matchFilter !== 'all') {
        filtered = filtered.filter((e) => getMatchDiscipline(e.title) === matchFilter);
      }
    } else if (categoryFilter !== 'all') {
      filtered = filtered.filter((e) => e.eventType === categoryFilter);
    }

    return filtered;
  }, [events, categoryFilter, matchFilter]);

  // Category buttons config
  const categories = [
    { key: 'all', label: 'All' },
    { key: 'match', label: 'Matches', hasDropdown: true },
    { key: 'organized_practice', label: 'Practice' },
    { key: 'youth_event', label: 'Youth' },
    { key: 'arc_meeting', label: 'Club' },
    { key: 'work_day', label: 'Work Days' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner lg" />
        <p className="mt-4 text-secondary">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-container">
        <div className="alert alert-error max-w-md">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 btn btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* New Members Section */}
      <NewMembersSection events={events} />

      {/* This Week Strip */}
      <ThisWeekStrip events={events} />

      {/* Browse Events */}
      <div className="mb-6">
        <h2 className="font-semibold text-primary mb-3 text-center">Browse Events</h2>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {categories.map((cat) => (
            <div key={cat.key} className="relative">
              <button
                onClick={() => {
                  if (cat.key === 'match') {
                    setShowMatchDropdown(!showMatchDropdown);
                  } else {
                    setCategoryFilter(cat.key);
                    setMatchFilter('all');
                    setShowMatchDropdown(false);
                  }
                }}
                className={`filter-button ${categoryFilter === cat.key ? 'active' : ''} ${cat.hasDropdown ? 'inline-flex items-center gap-1' : ''}`}
              >
                {cat.label}
                {cat.hasDropdown && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Match Discipline Dropdown */}
              {cat.key === 'match' && showMatchDropdown && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      setCategoryFilter('match');
                      setMatchFilter('all');
                      setShowMatchDropdown(false);
                    }}
                    className={`dropdown-item ${matchFilter === 'all' && categoryFilter === 'match' ? 'active' : ''}`}
                  >
                    All Matches
                  </button>
                  {availableDisciplines.map((disc) => (
                    <button
                      key={disc.key}
                      onClick={() => {
                        setCategoryFilter('match');
                        setMatchFilter(disc.key);
                        setShowMatchDropdown(false);
                      }}
                      className={`dropdown-item ${matchFilter === disc.key ? 'active' : ''}`}
                    >
                      {disc.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Filter indicator with subscribe buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-sm section-highlight px-3 py-2">
          <span className="text-muted">Showing:</span>
          <span className="font-medium text-accent">
            {categoryFilter === 'all'
              ? 'All Events'
              : categoryFilter === 'match' && matchFilter !== 'all'
                ? matchDisciplines.find((d) => d.key === matchFilter)?.label
                : eventTypeLabels[categoryFilter] || 'All Events'}
          </span>
          <span className="text-muted hidden sm:inline">•</span>
          <a
            href={buildCalendarUrl(categoryFilter, matchFilter, API_BASE)}
            className="cal-button"
            title={`Subscribe to ${getFilterName(categoryFilter, matchFilter)} via iCal`}
          >
            <span>📅</span> Subscribe (iCal)
          </a>
          <a
            href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(buildCalendarUrl(categoryFilter, matchFilter, API_BASE).replace('http://', 'https://').replace('localhost:8787', 'austinrifleclub.org'))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cal-button"
            title={`Add ${getFilterName(categoryFilter, matchFilter)} to Google Calendar`}
          >
            <span>📅</span> Google
          </a>
          {categoryFilter !== 'all' && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setMatchFilter('all');
              }}
              className="text-muted hover:text-secondary"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 section-card">
            <p className="text-secondary">No upcoming events in this category.</p>
            <button
              onClick={() => {
                setCategoryFilter('all');
                setMatchFilter('all');
              }}
              className="mt-2 link-accent text-sm font-medium"
            >
              View all events
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
