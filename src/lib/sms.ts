/**
 * SMS Service
 *
 * Handles sending SMS notifications via Twilio.
 */

import { log } from './logger';

interface SMSOptions {
  to: string;
  body: string;
}

interface TwilioResponse {
  sid?: string;
  status?: string;
  error_code?: string;
  error_message?: string;
}

const FROM_PHONE = '+15125550100'; // Replace with actual Twilio number

export async function sendSMS(
  accountSid: string,
  authToken: string,
  options: SMSOptions
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!accountSid || !authToken) {
    log.debug('SMS not sent (no credentials)', { to: options.to });
    return { success: true, sid: 'dev-mode' };
  }

  // Normalize phone number
  const toNumber = normalizePhone(options.to);
  if (!toNumber) {
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: FROM_PHONE,
        To: toNumber,
        Body: options.body,
      }),
    });

    const data: TwilioResponse = await response.json();

    if (!response.ok || data.error_code) {
      log.error('SMS send failed', new Error(data.error_message || 'Unknown error'), { to: options.to });
      return { success: false, error: data.error_message || 'Failed to send SMS' };
    }

    return { success: true, sid: data.sid };
  } catch (error) {
    log.error('SMS error', error instanceof Error ? error : new Error(String(error)), { to: options.to });
    return { success: false, error: 'Failed to send SMS' };
  }
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(phone: string): string | null {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Handle US numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // Already has country code
  if (digits.length > 10 && !phone.startsWith('+')) {
    return `+${digits}`;
  }

  if (phone.startsWith('+') && digits.length >= 10) {
    return `+${digits}`;
  }

  return null;
}

// SMS Templates

export function rangeClosureAlert(rangeName: string, reason: string): string {
  return `ARC Alert: ${rangeName} is now CLOSED. ${reason}. Check austinrifleclub.org/range-status for updates.`;
}

export function rangeReopenAlert(rangeName: string): string {
  return `ARC Alert: ${rangeName} is now OPEN. See you at the range!`;
}

export function duesReminderSMS(firstName: string, daysRemaining: number): string {
  if (daysRemaining <= 7) {
    return `Hi ${firstName}, your ARC membership expires in ${daysRemaining} days! Renew at austinrifleclub.org/dashboard to avoid interruption.`;
  }
  return `Hi ${firstName}, your ARC membership expires in ${daysRemaining} days. Renew at austinrifleclub.org/dashboard`;
}

export function eventReminderSMS(firstName: string, eventTitle: string, eventDate: string): string {
  return `Hi ${firstName}, reminder: "${eventTitle}" is tomorrow (${eventDate}). See you there!`;
}

export function applicationApprovedSMS(firstName: string): string {
  return `Congrats ${firstName}! Your ARC membership application has been approved. Check your email for next steps. Welcome to the club!`;
}

export function safetyAlertSMS(message: string): string {
  return `ARC SAFETY ALERT: ${message}. Check austinrifleclub.org for details.`;
}

/**
 * Batch send SMS to multiple recipients
 */
export async function sendBulkSMS(
  accountSid: string,
  authToken: string,
  recipients: string[],
  body: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.all(
    recipients.map((to) => sendSMS(accountSid, authToken, { to, body }))
  );

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const errors = results.filter((r) => !r.success).map((r) => r.error || 'Unknown error');

  return { sent, failed, errors };
}

/**
 * Send SMS to members who have opted in for SMS alerts
 */
export async function sendAlertToOptedInMembers(
  db: any, // DrizzleDB
  accountSid: string,
  authToken: string,
  alertType: 'range_closure' | 'safety' | 'event',
  body: string
): Promise<{ sent: number; failed: number }> {
  // Get members who have opted in for this alert type
  const members = await db.query.notificationPreferences.findMany({
    where: (prefs: any, { eq, and }: any) =>
      and(
        eq(prefs.smsEnabled, true),
        eq(prefs[`sms${alertType.charAt(0).toUpperCase() + alertType.slice(1)}Alerts`], true)
      ),
  });

  if (members.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const phones = members.map((m: any) => m.phone).filter(Boolean);
  return sendBulkSMS(accountSid, authToken, phones, body);
}
