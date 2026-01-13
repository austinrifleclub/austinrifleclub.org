/**
 * API client for Austin Rifle Club backend
 *
 * Handles authentication, request formatting, and error handling.
 */

/**
 * Base URL for API requests.
 * Uses PUBLIC_API_URL from environment, falls back to localhost for development.
 */
export const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

interface ApiError {
  error: string;
  details?: unknown;
  status?: number;
}

/**
 * Make an API request
 */
async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // Include cookies for auth
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'Request failed',
      status: response.status,
    }));
    throw error;
  }

  return response.json();
}

// =============================================================================
// RANGE STATUS
// =============================================================================

export interface RangeStatusData {
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

export interface RangeStatusResponse {
  ranges: RangeStatusData[];
  lastUpdated: string;
  weather?: {
    temp: number | null;
    conditions: string | null;
    windSpeed: number | null;
  };
}

export const rangeStatus = {
  getAll: () => request<RangeStatusResponse>('/api/range-status'),
  get: (id: string) => request<RangeStatusData>(`/api/range-status/${id}`),
};

// =============================================================================
// EVENTS
// =============================================================================

export interface EventData {
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

export interface EventsResponse {
  events: EventData[];
  pagination: {
    page: number;
    limit: number;
  };
}

export const events = {
  getAll: (params?: { start?: string; end?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.start) query.set('start', params.start);
    if (params?.end) query.set('end', params.end);
    if (params?.type) query.set('type', params.type);
    const qs = query.toString();
    return request<EventsResponse>(`/api/events${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<EventData>(`/api/events/${id}`),
  register: (id: string, data?: { division?: string; classification?: string }) =>
    request(`/api/events/${id}/register`, { method: 'POST', body: data }),
  cancelRegistration: (id: string) =>
    request(`/api/events/${id}/register`, { method: 'DELETE' }),
};

// =============================================================================
// AUTH
// =============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export interface Session {
  user: User;
}

export const auth = {
  getSession: () => request<Session | null>('/api/auth/get-session').catch(() => null),
  signOut: () => request('/api/auth/sign-out', { method: 'POST' }),
  sendMagicLink: (email: string, callbackURL = '/dashboard') =>
    request('/api/auth/sign-in/magic-link', {
      method: 'POST',
      body: { email, callbackURL },
    }),
};

// =============================================================================
// MEMBERS
// =============================================================================

export interface MemberProfile {
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

export const members = {
  getProfile: () => request<MemberProfile>('/api/members/me'),
  updateProfile: (data: Partial<MemberProfile>) =>
    request('/api/members/me', { method: 'PATCH', body: data }),
  getReferralCode: () =>
    request<{ code: string; referralCount: number; referralUrl: string }>(
      '/api/members/me/referral-code'
    ),
  getPayments: () => request('/api/members/me/payments'),
  getVolunteerHours: () => request('/api/members/me/volunteer-hours'),
};

// =============================================================================
// APPLICATIONS
// =============================================================================

export interface ApplicationData {
  id: string;
  status: string;
  membershipType: string;
  resumeToken: string;
  expiresAt: string | null;
}

export const applications = {
  start: (data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    membershipType: string;
    howHeardAboutUs?: string;
  }) => request<ApplicationData>('/api/applications', { method: 'POST', body: data }),
  resume: (token: string) => request<ApplicationData>(`/api/applications/resume/${token}`),
  getMine: () => request<ApplicationData>('/api/applications/mine'),
  updateMine: (data: Partial<ApplicationData>) =>
    request('/api/applications/mine', { method: 'PATCH', body: data }),
  submit: () => request('/api/applications/mine/submit', { method: 'POST' }),
};

// =============================================================================
// GUESTS
// =============================================================================

export interface GuestData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  visitCountCurrentYear: number;
  lastVisitAt: string | null;
  status: string;
}

export const guests = {
  getAll: () => request<GuestData[]>('/api/guests'),
  signIn: (guestId: string, waiverAgreed: boolean, waiverSignatureUrl?: string) =>
    request(`/api/guests/${guestId}/sign-in`, {
      method: 'POST',
      body: { waiverAgreed, waiverSignatureUrl },
    }),
  quickSignIn: (data: {
    name: string;
    email?: string;
    phone?: string;
    waiverAgreed: boolean;
    waiverSignatureUrl?: string;
  }) => request('/api/guests/quick-sign-in', { method: 'POST', body: data }),
};

export default {
  rangeStatus,
  events,
  auth,
  members,
  applications,
  guests,
};
