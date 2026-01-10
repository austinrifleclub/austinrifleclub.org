/**
 * Security Middleware
 *
 * Adds security headers and performs input sanitization.
 */

import type { Context, Next } from 'hono';

/**
 * Security headers middleware
 * Adds common security headers to all responses
 */
export function securityHeaders() {
  return async (c: Context, next: Next) => {
    await next();

    // Prevent clickjacking
    c.header('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    c.header('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter (legacy browsers)
    c.header('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy
    c.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Content Security Policy for API responses
    c.header(
      'Content-Security-Policy',
      "default-src 'none'; frame-ancestors 'none'"
    );
  };
}

/**
 * Request ID middleware
 * Adds a unique request ID for tracing
 */
export function requestId() {
  return async (c: Context, next: Next) => {
    const id = crypto.randomUUID();
    c.set('requestId', id);
    c.header('X-Request-ID', id);
    await next();
  };
}

/**
 * Input sanitization utilities
 */
export const sanitize = {
  /**
   * Sanitize string input - remove potential XSS vectors
   */
  string(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Sanitize email - validate format and lowercase
   */
  email(input: string): string {
    const email = input.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : '';
  },

  /**
   * Sanitize phone - keep only digits and format characters
   */
  phone(input: string): string {
    return input.replace(/[^\d\s\-\(\)\+]/g, '').trim();
  },

  /**
   * Sanitize HTML - encode special characters
   */
  html(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
};

/**
 * Validate and sanitize common input fields
 */
export function sanitizeInput<T extends Record<string, unknown>>(
  data: T,
  rules: Partial<Record<keyof T, 'string' | 'email' | 'phone' | 'html'>>
): T {
  const sanitized = { ...data };

  for (const [key, rule] of Object.entries(rules)) {
    const value = sanitized[key as keyof T];
    if (typeof value === 'string' && rule) {
      (sanitized as Record<string, unknown>)[key] = sanitize[rule](value);
    }
  }

  return sanitized;
}

/**
 * Check for common attack patterns in request
 */
export function detectSuspiciousRequest(c: Context): boolean {
  const userAgent = c.req.header('user-agent') || '';
  const path = c.req.path;

  // Block common scanner user agents
  const blockedAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'zgrab',
    'gobuster',
  ];

  if (blockedAgents.some((agent) => userAgent.toLowerCase().includes(agent))) {
    return true;
  }

  // Block common attack paths
  const blockedPaths = [
    '/.env',
    '/wp-admin',
    '/wp-login',
    '/phpmyadmin',
    '/.git',
    '/actuator',
    '/config',
  ];

  if (blockedPaths.some((blocked) => path.toLowerCase().includes(blocked))) {
    return true;
  }

  return false;
}

/**
 * Honeypot field validation
 * If honeypot field is filled, it's likely a bot
 */
export function validateHoneypot(data: Record<string, unknown>): boolean {
  const honeypotFields = ['website', 'url', 'homepage', 'fax'];

  for (const field of honeypotFields) {
    if (data[field] && typeof data[field] === 'string' && data[field] !== '') {
      return false; // Bot detected
    }
  }

  return true; // Passed honeypot check
}
