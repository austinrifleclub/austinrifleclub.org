/**
 * Zod validation schemas for API requests
 *
 * All validation rules match technical.md Section 3
 *
 * @see technical.md Section 3 for validation rules
 */

import { z } from "zod";

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * E.164 phone number format
 * Accepts: "512-555-1234", "(512) 555-1234", "5125551234", "+15125551234"
 */
export const phoneSchema = z
  .string()
  .min(10, "Phone number required")
  .max(15)
  .transform((val) => {
    const digits = val.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return `+${digits}`;
  });

/**
 * Email schema - RFC 5322, max 254 chars, lowercase
 */
export const emailSchema = z
  .string()
  .email("Invalid email address")
  .max(254)
  .transform((val) => val.toLowerCase().trim());

/**
 * US ZIP code - 5 digits or 5+4 format
 */
export const zipSchema = z
  .string()
  .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code");

/**
 * US state abbreviation
 */
export const stateSchema = z
  .string()
  .length(2)
  .transform((val) => val.toUpperCase());

/**
 * Address schema
 */
export const addressSchema = z.object({
  addressLine1: z.string().min(1).max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1).max(50),
  state: stateSchema,
  zip: zipSchema,
});

/**
 * Pagination params
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Events list query params
 */
export const eventsQuerySchema = paginationSchema.extend({
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  type: z.enum([
    "match",
    "class",
    "arc_education",
    "arc_event",
    "arc_meeting",
    "organized_practice",
    "work_day",
    "youth_event",
    "range_unavailable",
  ]).optional(),
});

// =============================================================================
// MEMBER SCHEMAS
// =============================================================================

export const membershipTypes = [
  "individual",
  "family",
  "veteran",
  "senior",
  "life",
] as const;

export const memberStatuses = [
  "prospect",
  "probationary",
  "active",
  "inactive",
  "suspended",
  "terminated",
] as const;

export const familyRoles = ["primary", "spouse", "junior"] as const;

/**
 * Create member profile schema (for approved applications)
 */
export const createMemberSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: phoneSchema,
  dateOfBirth: z.coerce.date().optional(),
  addressLine1: z.string().min(1).max(100),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1).max(50),
  state: stateSchema.default("TX"),
  zip: zipSchema,
  emergencyContactName: z.string().min(1).max(100),
  emergencyContactPhone: phoneSchema,
  membershipType: z.enum(membershipTypes),
  vehicleDescription: z.string().max(100).optional(),
  licensePlate: z.string().max(20).optional(),
});

/**
 * Update member profile schema (self-service)
 */
export const updateMemberSchema = z.object({
  phone: phoneSchema.optional(),
  addressLine1: z.string().min(1).max(100).optional(),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1).max(50).optional(),
  state: stateSchema.optional(),
  zip: zipSchema.optional(),
  emergencyContactName: z.string().min(1).max(100).optional(),
  emergencyContactPhone: phoneSchema.optional(),
  vehicleDescription: z.string().max(100).optional(),
  licensePlate: z.string().max(20).optional(),
});

/**
 * Admin update member schema (more fields allowed)
 */
export const adminUpdateMemberSchema = updateMemberSchema.extend({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  membershipType: z.enum(membershipTypes).optional(),
  status: z.enum(memberStatuses).optional(),
  badgeNumber: z.string().max(10).optional(),
  expirationDate: z.coerce.date().optional(),
});

// =============================================================================
// APPLICATION SCHEMAS
// =============================================================================

export const applicationStatuses = [
  "draft",
  "submitted",
  "documents_pending",
  "documents_approved",
  "paid",
  "safety_scheduled",
  "safety_complete",
  "orientation_scheduled",
  "orientation_complete",
  "pending_vote",
  "approved",
  "rejected",
  "expired",
] as const;

/**
 * Start application schema
 */
export const startApplicationSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: phoneSchema,
  membershipType: z.enum(membershipTypes),
  howHeardAboutUs: z.string().max(255).optional(),
  // UTM tracking (set automatically from query params)
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

/**
 * Update application schema (as prospect fills it out)
 */
export const updateApplicationSchema = z.object({
  // Personal info
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: phoneSchema.optional(),
  dateOfBirth: z.coerce.date().optional(),
  addressLine1: z.string().min(1).max(100).optional(),
  addressLine2: z.string().max(100).optional(),
  city: z.string().min(1).max(50).optional(),
  state: stateSchema.optional(),
  zip: zipSchema.optional(),
  emergencyContactName: z.string().min(1).max(100).optional(),
  emergencyContactPhone: phoneSchema.optional(),
  // Membership type can be changed before payment
  membershipType: z.enum(membershipTypes).optional(),
  // Texas LTC (skips background check)
  hasTexasLtc: z.boolean().optional(),
  ltcNumber: z.string().max(20).optional(),
});

/**
 * Admin update application schema
 */
export const adminUpdateApplicationSchema = z.object({
  status: z.enum(applicationStatuses).optional(),
  safetyEvalDate: z.coerce.date().optional(),
  safetyEvalResult: z.enum(["pass", "fail"]).optional(),
  safetyEvalNotes: z.string().max(1000).optional(),
  orientationDate: z.coerce.date().optional(),
  orientationCompleted: z.boolean().optional(),
  // BOD vote (3/4 majority required)
  voteMeetingDate: z.coerce.date().optional(),
  votesFor: z.number().int().min(0).optional(),
  votesAgainst: z.number().int().min(0).optional(),
  votesAbstain: z.number().int().min(0).optional(),
  rejectionReason: z.string().max(1000).optional(),
});

// =============================================================================
// EVENT SCHEMAS
// =============================================================================

export const eventTypes = [
  "match",
  "class",
  "arc_education",
  "arc_event",
  "arc_meeting",
  "organized_practice",
  "work_day",
  "youth_event",
  "range_unavailable",
] as const;

export const eventStatuses = ["draft", "published", "cancelled"] as const;

/**
 * Create event schema
 */
export const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  eventType: z.enum(eventTypes),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  location: z.string().max(255).optional(),
  rangeIds: z.array(z.string()).optional(), // Affected ranges
  maxParticipants: z.number().int().min(0).optional(),
  registrationDeadline: z.coerce.date().optional(),
  cost: z.number().int().min(0).default(0), // Cents
  membersOnly: z.boolean().default(true),
  isPublic: z.boolean().default(false),
  boardOnly: z.boolean().default(false),
  requiresCertification: z.array(z.string()).optional(),
  contactEmail: emailSchema.optional(),
});

/**
 * Update event schema
 */
export const updateEventSchema = createEventSchema.partial().extend({
  status: z.enum(eventStatuses).optional(),
  cancellationReason: z.string().max(1000).optional(),
});

/**
 * Event registration schema
 */
export const eventRegistrationSchema = z.object({
  eventId: z.string().uuid(),
  // For matches - optional division/class
  division: z.string().max(50).optional(),
  classification: z.string().max(10).optional(),
});

// =============================================================================
// GUEST SCHEMAS
// =============================================================================

export const guestStatuses = [
  "active",
  "should_join",
  "limit_reached",
  "banned",
] as const;

/**
 * Create guest schema
 */
export const createGuestSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
});

/**
 * Sign in guest schema
 */
export const signInGuestSchema = z.object({
  guestId: z.string().uuid(),
  // Waiver agreement - must be true
  waiverAgreed: z.boolean().refine((val) => val === true, {
    message: "Waiver must be agreed to",
  }),
  waiverSignatureUrl: z.string().url().optional(), // R2 path if signature captured
  // For offline sync
  offlineId: z.string().uuid().optional(),
});

/**
 * Quick guest sign-in (new guest + sign-in in one step)
 */
export const quickGuestSignInSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  waiverAgreed: z.boolean().refine((val) => val === true, {
    message: "Waiver must be agreed to",
  }),
  waiverSignatureUrl: z.string().url().optional(),
  offlineId: z.string().uuid().optional(),
});

// =============================================================================
// RANGE STATUS SCHEMAS
// =============================================================================

export const rangeStatuses = [
  "open",
  "event",
  "closed",
  "maintenance",
] as const;

/**
 * Update range status schema
 */
export const updateRangeStatusSchema = z.object({
  status: z.enum(rangeStatuses),
  statusNote: z.string().max(255).optional(),
  expiresAt: z.coerce.date().optional(), // Auto-revert time
  calendarEventId: z.string().uuid().optional(), // Link to event
});

// =============================================================================
// SHOP SCHEMAS
// =============================================================================

/**
 * Create order schema
 */
export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
  fulfillmentType: z.enum(["pickup", "shipping"]),
  shippingAddress: addressSchema.optional(),
  applyCredits: z.boolean().default(false), // Apply volunteer credits
});

// =============================================================================
// SETTINGS SCHEMA
// =============================================================================

/**
 * Update setting schema
 * Value is JSON-encoded string
 */
export const updateSettingSchema = z.object({
  value: z.string(),
  description: z.string().max(500).optional(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type MembershipType = (typeof membershipTypes)[number];
export type MemberStatus = (typeof memberStatuses)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];
export type EventType = (typeof eventTypes)[number];
export type EventStatus = (typeof eventStatuses)[number];
export type GuestStatus = (typeof guestStatuses)[number];
export type RangeStatus = (typeof rangeStatuses)[number];
