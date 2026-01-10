/**
 * Event Detail Component
 *
 * Shows full event details with registration functionality.
 */

import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string;
  location: string | null;
  maxParticipants: number | null;
  cost: number | null;
  isPublic: boolean;
  registrationCount: number;
  spotsRemaining: number | null;
  registrationDeadline: string | null;
}

interface Props {
  eventId: string;
}

const eventTypeLabels: Record<string, string> = {
  match: 'Competition',
  class: 'Training Class',
  meeting: 'Meeting',
  workday: 'Work Day',
  social: 'Social Event',
};

export default function EventDetail({ eventId }: Props) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regMessage, setRegMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`${API_BASE}/api/events/${eventId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Event not found');
          } else {
            throw new Error('Failed to fetch event');
          }
          return;
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError('Unable to load event details');
        console.error('Failed to fetch event:', err);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleRegister = async () => {
    setRegistering(true);
    setRegMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setIsRegistered(true);
        setRegMessage({
          type: 'success',
          text: data.waitlisted
            ? `You've been added to the waitlist at position ${data.registration.waitlistPosition}`
            : 'Registration confirmed! Check your email for details.',
        });
        // Refresh event data
        const refreshRes = await fetch(`${API_BASE}/api/events/${eventId}`);
        if (refreshRes.ok) {
          setEvent(await refreshRes.json());
        }
      } else if (response.status === 401) {
        setRegMessage({
          type: 'error',
          text: 'Please log in to register for events.',
        });
      } else if (response.status === 409) {
        setIsRegistered(true);
        setRegMessage({
          type: 'error',
          text: 'You are already registered for this event.',
        });
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      setRegMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Registration failed. Please try again.',
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;

    setRegistering(true);
    setRegMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/events/${eventId}/register`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setIsRegistered(false);
        const data = await response.json();
        setRegMessage({
          type: 'success',
          text: data.refundPercent > 0
            ? `Registration cancelled. ${data.refundPercent}% refund will be processed.`
            : 'Registration cancelled.',
        });
        // Refresh event data
        const refreshRes = await fetch(`${API_BASE}/api/events/${eventId}`);
        if (refreshRes.ok) {
          setEvent(await refreshRes.json());
        }
      } else {
        throw new Error('Cancellation failed');
      }
    } catch (err) {
      setRegMessage({
        type: 'error',
        text: 'Failed to cancel registration. Please try again.',
      });
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-700">{error || 'Event not found'}</p>
          <a
            href="/calendar"
            className="mt-4 inline-block text-green-700 hover:text-green-800 font-medium"
          >
            ← Back to Calendar
          </a>
        </div>
      </div>
    );
  }

  const isFull = event.spotsRemaining !== null && event.spotsRemaining <= 0;
  const isPast = new Date(event.endTime) < new Date();
  const registrationClosed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();

  return (
    <div>
      <a href="/calendar" className="text-green-700 hover:text-green-800 text-sm font-medium mb-4 inline-block">
        ← Back to Calendar
      </a>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 text-white p-6">
          <span className="text-sm font-medium bg-green-600 px-3 py-1 rounded-full">
            {eventTypeLabels[event.eventType] || event.eventType}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold mt-3">{event.title}</h1>
        </div>

        <div className="p-6">
          {/* Event Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date & Time</h3>
                <p className="mt-1 text-gray-900">{formatDate(event.startTime)}</p>
                <p className="text-gray-600">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </p>
              </div>

              {event.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Location</h3>
                  <p className="mt-1 text-gray-900">{event.location}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {event.cost !== null && event.cost > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Cost</h3>
                  <p className="mt-1 text-2xl font-bold text-gray-900">${event.cost}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Registration</h3>
                {event.maxParticipants ? (
                  <p className="mt-1 text-gray-900">
                    {event.registrationCount} / {event.maxParticipants} registered
                    {event.spotsRemaining !== null && event.spotsRemaining > 0 && (
                      <span className="text-green-600 ml-2">({event.spotsRemaining} spots left)</span>
                    )}
                    {isFull && <span className="text-red-600 ml-2">(Full - Waitlist available)</span>}
                  </p>
                ) : (
                  <p className="mt-1 text-gray-900">{event.registrationCount} registered</p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">About This Event</h3>
              <div className="prose prose-green max-w-none text-gray-700">
                <p>{event.description}</p>
              </div>
            </div>
          )}

          {/* Registration Section */}
          {!isPast && (
            <div className="border-t pt-6">
              {regMessage && (
                <div className={`mb-4 p-4 rounded-lg ${regMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {regMessage.text}
                </div>
              )}

              {registrationClosed ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Registration for this event has closed.</p>
                </div>
              ) : isRegistered ? (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-green-50 p-4 rounded-lg">
                  <div>
                    <span className="text-green-800 font-medium">You're registered for this event</span>
                    <p className="text-sm text-green-600 mt-1">Check your email for event details</p>
                  </div>
                  <button
                    onClick={handleCancel}
                    disabled={registering}
                    className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    {isFull ? (
                      <p className="text-gray-600">This event is full, but you can join the waitlist.</p>
                    ) : (
                      <p className="text-gray-600">Secure your spot for this event.</p>
                    )}
                  </div>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {registering ? 'Processing...' : isFull ? 'Join Waitlist' : 'Register Now'}
                  </button>
                </div>
              )}
            </div>
          )}

          {isPast && (
            <div className="border-t pt-6 text-center">
              <p className="text-gray-500">This event has ended.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
