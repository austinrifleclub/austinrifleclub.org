/**
 * Custom React Hooks for API Calls
 *
 * Centralized data fetching hooks to avoid duplication across components.
 */

import { useState, useEffect, useCallback } from 'react';
import { API_BASE } from './api';

// ============================================================================
// Types
// ============================================================================

export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  badgeNumber: string | null;
  membershipType: string;
  status: string;
  expirationDate: string | null;
  phone: string;
  email?: string;
  volunteerCreditBalance?: number;
  certifications?: Certification[];
  duesCurrent?: boolean;
  inGracePeriod?: boolean;
  boardPosition?: {
    positionId: string;
    title: string;
  } | null;
}

export interface Certification {
  id: string;
  certificationTypeId: string;
  earnedDate: string;
  expiresAt: string | null;
  typeName: string;
  typeDescription: string | null;
}

export interface RangeStatus {
  id: string;
  name: string;
  description: string | null;
  status: 'open' | 'event' | 'closed' | 'maintenance';
  statusNote: string | null;
  expiresAt: string | null;
  updatedAt: string;
  linkedEvent?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
  } | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: string;
  endTime: string;
  location: string | null;
  maxParticipants: number | null;
  cost: number | null;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetch current user session
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/get-session`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setError('Failed to load user session');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user, loading, error };
}

/**
 * Fetch current member profile
 */
export function useMemberProfile() {
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/members/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setMember(data);
      }
    } catch {
      setError('Failed to load member profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { member, loading, error, refetch };
}

/**
 * Fetch range status with auto-refresh
 */
export function useRangeStatus(refreshInterval = 60000) {
  const [ranges, setRanges] = useState<RangeStatus[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/range-status`);
      if (res.ok) {
        const data = await res.json();
        setRanges(data.ranges);
        const updated = new Date(data.lastUpdated);
        setLastUpdated(updated.getFullYear() > 2000 ? updated : new Date());
        setError(null);
      }
    } catch {
      setError('Unable to load range status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchStatus, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchStatus, refreshInterval]);

  return { ranges, lastUpdated, loading, error, refetch: fetchStatus };
}

/**
 * Fetch upcoming events
 */
export function useEvents(options?: { start?: Date; end?: Date; type?: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (options?.start) params.set('start', options.start.toISOString());
      if (options?.end) params.set('end', options.end.toISOString());
      if (options?.type) params.set('type', options.type);

      const res = await fetch(`${API_BASE}/api/events?${params}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [options?.start, options?.end, options?.type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, loading, error, refetch };
}

/**
 * Fetch member's event registrations
 */
export function useMyRegistrations() {
  const [registrations, setRegistrations] = useState<Array<{
    id: string;
    status: string;
    event: Event;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/my-registrations`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data || []);
      }
    } catch {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { registrations, loading, error, refetch };
}
