/**
 * Utility functions for the Austin Rifle Club API
 *
 * @see technical.md Section 6.2 for naming conventions
 */

/**
 * Generate a unique ID using crypto.randomUUID()
 * Format: Standard UUID v4
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Safely parse a full name into first and last name parts.
 * Handles empty strings, whitespace-only strings, and single names.
 *
 * @param fullName - The full name to parse
 * @param defaultFirst - Default first name if parsing fails (default: "Member")
 * @param defaultLast - Default last name if parsing fails (default: "")
 */
export function parseFullName(
  fullName: string | null | undefined,
  defaultFirst = "Member",
  defaultLast = ""
): { firstName: string; lastName: string } {
  if (!fullName || typeof fullName !== "string") {
    return { firstName: defaultFirst, lastName: defaultLast };
  }

  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: defaultFirst, lastName: defaultLast };
  }

  const parts = trimmed.split(/\s+/);
  const firstName = parts[0] || defaultFirst;
  const lastName = parts.slice(1).join(" ") || defaultLast;

  return { firstName, lastName };
}

/**
 * Generate a badge number for new members
 * Format: M followed by 4-5 digits (e.g., M1234, M12345)
 *
 * @param lastBadgeNumber - The last assigned badge number (e.g., "M1234")
 */
export function generateBadgeNumber(lastBadgeNumber: string | null): string {
  if (!lastBadgeNumber) {
    return "M1001"; // Start at 1001
  }

  const num = parseInt(lastBadgeNumber.slice(1), 10);
  return `M${num + 1}`;
}

/**
 * Generate a referral code for members
 * Format: 8 alphanumeric characters
 * Uses cryptographically secure random generation
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1 to avoid confusion
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(randomBytes[i] % chars.length);
  }
  return code;
}

/**
 * Generate an order number
 * Format: ARC-YYYY-NNNN (e.g., ARC-2025-0042)
 */
export function generateOrderNumber(lastOrderNumber: string | null): string {
  const year = new Date().getFullYear();
  const prefix = `ARC-${year}-`;

  if (!lastOrderNumber || !lastOrderNumber.startsWith(prefix)) {
    return `${prefix}0001`;
  }

  const num = parseInt(lastOrderNumber.slice(-4), 10);
  return `${prefix}${String(num + 1).padStart(4, "0")}`;
}

/**
 * Get the current fiscal year
 * Fiscal year runs April 1 - March 31
 * Example: March 2025 = FY2025, April 2025 = FY2026
 */
export function getCurrentFiscalYear(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-indexed
  const year = now.getFullYear();

  // Before April = previous fiscal year
  return month < 4 ? year : year + 1;
}

/**
 * Get the fiscal year end date (March 31)
 */
export function getFiscalYearEndDate(fiscalYear: number): Date {
  // FY2026 ends March 31, 2026
  return new Date(fiscalYear, 2, 31, 23, 59, 59); // Month is 0-indexed
}

/**
 * Calculate prorated dues for new members
 *
 * Fiscal year runs April 1 - March 31.
 * Minimum dues is $25 regardless of join date.
 * Initiation fee ($200) is never prorated.
 *
 * @param annualDues - Annual dues in cents (e.g., 15000 = $150)
 * @param joinDate - Date member is joining
 * @returns Prorated dues in cents
 *
 * @see Bylaws Section 4.2 for proration rules
 */
export function calculateProratedDues(
  annualDues: number,
  joinDate: Date = new Date()
): number {
  const fiscalYearStart = 4; // April
  const currentMonth = joinDate.getMonth() + 1; // 1-indexed

  // Months remaining in fiscal year
  const monthsRemaining =
    12 - ((currentMonth - fiscalYearStart + 12) % 12);

  // Prorate, but minimum $25 (2500 cents)
  const prorated = Math.round((annualDues * monthsRemaining) / 12);
  const minimum = 2500;

  return Math.max(prorated, minimum);
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age--;
  }

  return age;
}

/**
 * Check if a member is within the 60-day grace period
 */
export function isInGracePeriod(expirationDate: Date): boolean {
  const now = new Date();
  const gracePeriodEnd = new Date(expirationDate);
  gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 60);

  return now > expirationDate && now <= gracePeriodEnd;
}

/**
 * Check if a member's dues are current
 */
export function isDuesCurrent(expirationDate: Date): boolean {
  return new Date() <= expirationDate;
}

/**
 * Format phone number to E.164 format
 * Input: "512-555-1234" or "(512) 555-1234" or "5125551234"
 * Output: "+15125551234"
 */
export function formatPhoneE164(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, "");

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  // Otherwise return as-is with + prefix
  return digits.startsWith("+") ? digits : `+${digits}`;
}

/**
 * Sanitize a filename for storage
 * Removes special characters, replaces spaces with hyphens
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate a resume token for application email links
 * Format: 32 character hex string
 */
export function generateResumeToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Calculate volunteer credit amount based on activity
 *
 * @see features.md Section 2.6 for credit rates
 */
export function calculateVolunteerCredit(
  activity: string,
  hours: number
): number {
  // Credits in cents
  const rates: Record<string, number> = {
    work_day: 1000, // $10/hour
    general: 1000, // $10/hour
    match_director: 2500, // $25 flat
    rso_full_day: 2500, // $25 flat
    major_project: 5000, // $50 flat (admin discretion)
  };

  const rate = rates[activity] || rates.general;

  // Flat rate activities
  if (["match_director", "rso_full_day", "major_project"].includes(activity)) {
    return rate;
  }

  // Hourly activities
  return Math.round(rate * hours);
}
