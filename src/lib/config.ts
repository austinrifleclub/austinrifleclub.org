/**
 * Centralized Configuration
 *
 * Single source of truth for URLs, emails, and other config values.
 * Prevents inconsistent defaults scattered across the codebase.
 */

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULTS = {
  PUBLIC_URL: 'https://austinrifleclub.org',
  ADMIN_EMAIL: 'membership@austinrifleclub.org',
  INFO_EMAIL: 'info@austinrifleclub.org',
  FROM_EMAIL: 'Austin Rifle Club <noreply@austinrifleclub.org>',
} as const;

// =============================================================================
// SITE URLS
// =============================================================================

/**
 * Get site URLs based on PUBLIC_URL environment variable.
 * Use this for dynamic URL construction in emails and redirects.
 */
export function getSiteUrls(publicUrl: string = DEFAULTS.PUBLIC_URL) {
  return {
    home: publicUrl,
    dashboard: `${publicUrl}/dashboard`,
    calendar: `${publicUrl}/calendar`,
    rangeStatus: `${publicUrl}/range-status`,
    rangeRules: `${publicUrl}/range-rules`,
    apply: `${publicUrl}/apply`,
    applyStatus: `${publicUrl}/apply/status`,
    login: `${publicUrl}/login`,
  } as const;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get PUBLIC_URL from environment with fallback to default.
 */
export function getPublicUrl(env: { PUBLIC_URL?: string }): string {
  return env.PUBLIC_URL || DEFAULTS.PUBLIC_URL;
}

/**
 * Get ADMIN_EMAIL from environment with fallback to default.
 */
export function getAdminEmail(env: { ADMIN_EMAIL?: string }): string {
  return env.ADMIN_EMAIL || DEFAULTS.ADMIN_EMAIL;
}

// =============================================================================
// VALIDATION LIMITS (Magic Numbers)
// =============================================================================

export const LIMITS = {
  /** Maximum pagination offset to prevent performance issues */
  MAX_PAGINATION_OFFSET: 10000,
  /** Default pagination limit */
  DEFAULT_PAGE_LIMIT: 20,
  /** Maximum pagination limit per request */
  MAX_PAGE_LIMIT: 100,
  /** Maximum expiresWithin days for member queries */
  MAX_EXPIRES_WITHIN_DAYS: 365,
  /** Session duration in seconds (1 day) */
  SESSION_DURATION: 60 * 60 * 24,
  /** Session refresh interval in seconds (1 hour) */
  SESSION_REFRESH: 60 * 60,
  /** Magic link expiration in minutes */
  MAGIC_LINK_EXPIRATION_MINUTES: 15,
  /** Maximum guest visits before "should join" status */
  GUEST_VISIT_LIMIT: 3,
  /** Grace period days after membership expiration */
  GRACE_PERIOD_DAYS: 30,
} as const;

// =============================================================================
// EVENT TYPES & STATUSES
// =============================================================================

export const EVENT_TYPE_LABELS: Record<string, string> = {
  match: 'Match',
  class: 'Class',
  arc_education: 'ARC Education',
  arc_event: 'ARC Event',
  arc_meeting: 'ARC Meeting',
  organized_practice: 'Organized Practice',
  work_day: 'Work Day',
  youth_event: 'Youth Event',
  range_unavailable: 'Range Unavailable',
} as const;
