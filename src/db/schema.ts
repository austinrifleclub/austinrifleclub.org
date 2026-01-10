import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// =============================================================================
// BETTER-AUTH TABLES (Core authentication - do not modify structure)
// =============================================================================

/**
 * User accounts - managed by better-auth
 * Links to member profile via members.userId
 */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/**
 * Active login sessions
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/**
 * OAuth provider accounts (Google, etc.)
 */
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/**
 * Email verification and password reset tokens
 */
export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// =============================================================================
// MEMBERSHIP TABLES
// =============================================================================

/**
 * Member profiles - the core member record
 *
 * Status values:
 * - prospect: Application in progress
 * - probationary: Approved, in 6-month probation
 * - active: Full member in good standing
 * - inactive: Dues expired, within 60-day grace
 * - suspended: Disciplinary action
 * - terminated: Removed or lapsed beyond grace
 *
 * Membership types:
 * - individual: Single person ($150/yr)
 * - family: Primary + spouse + juniors ($200/yr)
 * - veteran: With DD-214 ($125/yr)
 * - senior: 65+ ($125/yr)
 * - life: 25+ years or prepaid
 */
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Badge & Status
  badgeNumber: text("badge_number").unique(),           // Format: M#### (assigned on approval)
  membershipType: text("membership_type").notNull(),    // individual, family, veteran, senior, life
  status: text("status").notNull().default("prospect"), // prospect, probationary, active, inactive, suspended, terminated

  // Family membership
  primaryMemberId: text("primary_member_id")            // If dependent, points to primary
    .references((): any => members.id),
  familyRole: text("family_role"),                      // primary, spouse, junior

  // Dates
  joinDate: integer("join_date", { mode: "timestamp" }),           // When approved
  expirationDate: integer("expiration_date", { mode: "timestamp" }),// Current expiration (Mar 31)
  probationEndsAt: integer("probation_ends_at", { mode: "timestamp" }), // 6 months after join

  // Contact info
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),                       // E.164 format
  dateOfBirth: integer("date_of_birth", { mode: "timestamp" }),

  // Address
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull().default("TX"),
  zip: text("zip").notNull(),

  // Vehicle (required for gate access)
  vehicleDescription: text("vehicle_description"),      // Year/Color/Make/Model
  licensePlate: text("license_plate"),

  // Emergency contact
  emergencyContactName: text("emergency_contact_name").notNull(),
  emergencyContactPhone: text("emergency_contact_phone").notNull(),

  // Referral tracking
  referralCode: text("referral_code").unique(),         // Unique code for sharing
  referredBy: text("referred_by")                       // Member ID who referred
    .references((): any => members.id),

  // Texas LTC (for background check waiver)
  hasTexasLtc: integer("has_texas_ltc", { mode: "boolean" }).default(false),
  ltcNumber: text("ltc_number"),

  // Life membership tracking
  continuousYears: integer("continuous_years").default(0),  // For life eligibility
  joinedBefore2011: integer("joined_before_2011", { mode: "boolean" }).default(false),

  // Work day tracking (probation requirement)
  workDaysCompleted: integer("work_days_completed").default(0), // Need 3 during probation

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("members_user_id_idx").on(table.userId),
  statusIdx: index("members_status_idx").on(table.status),
  expirationIdx: index("members_expiration_idx").on(table.expirationDate),
}));

/**
 * Membership applications - tracks prospect through approval
 *
 * Status flow:
 * draft → submitted → documents_pending → documents_approved → paid →
 * safety_scheduled → safety_complete → orientation_scheduled →
 * orientation_complete → pending_vote → approved/rejected
 */
export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  status: text("status").notNull().default("draft"),
  membershipType: text("membership_type").notNull(),    // What they're applying for

  // How they found us (for marketing)
  howHeardAboutUs: text("how_heard_about_us"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),

  // Documents
  governmentIdUrl: text("government_id_url"),           // R2 path
  backgroundConsentUrl: text("background_consent_url"), // R2 path
  veteranDocUrl: text("veteran_doc_url"),               // DD-214 for veteran rate

  // Texas LTC (skips background check)
  hasTexasLtc: integer("has_texas_ltc", { mode: "boolean" }).default(false),
  ltcNumber: text("ltc_number"),
  ltcVerifiedAt: integer("ltc_verified_at", { mode: "timestamp" }),

  // Payment
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amountPaid: integer("amount_paid"),                   // Cents
  paidAt: integer("paid_at", { mode: "timestamp" }),

  // Safety evaluation
  safetyEvalEventId: text("safety_eval_event_id")
    .references(() => events.id),
  safetyEvalDate: integer("safety_eval_date", { mode: "timestamp" }),
  safetyEvalResult: text("safety_eval_result"),         // pass, fail
  safetyEvalNotes: text("safety_eval_notes"),
  safetyEvalBy: text("safety_eval_by")
    .references(() => members.id),

  // Orientation
  orientationEventId: text("orientation_event_id")
    .references(() => events.id),
  orientationDate: integer("orientation_date", { mode: "timestamp" }),
  orientationCompleted: integer("orientation_completed", { mode: "boolean" }).default(false),

  // BOD vote (3/4 majority required)
  voteMeetingDate: integer("vote_meeting_date", { mode: "timestamp" }),
  votesFor: integer("votes_for"),
  votesAgainst: integer("votes_against"),
  votesAbstain: integer("votes_abstain"),

  // Approval/rejection
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  approvedBy: text("approved_by")
    .references(() => members.id),
  rejectedAt: integer("rejected_at", { mode: "timestamp" }),
  rejectedBy: text("rejected_by")
    .references(() => members.id),
  rejectionReason: text("rejection_reason"),

  // Timeouts (180 days total from submission)
  expiresAt: integer("expires_at", { mode: "timestamp" }),

  // Resume token for email links
  resumeToken: text("resume_token").unique(),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  statusIdx: index("applications_status_idx").on(table.status),
  userIdIdx: index("applications_user_id_idx").on(table.userId),
}));

/**
 * Dues payments - tracks all membership fee transactions
 */
export const duesPayments = sqliteTable("dues_payments", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  amount: integer("amount").notNull(),                  // Cents
  paymentType: text("payment_type").notNull(),          // initiation, annual, prorated, reinstatement
  paymentMethod: text("payment_method").notNull(),      // stripe, check, cash
  stripePaymentId: text("stripe_payment_id"),
  checkNumber: text("check_number"),

  // What period this covers
  periodStart: integer("period_start", { mode: "timestamp" }),
  periodEnd: integer("period_end", { mode: "timestamp" }),

  // Volunteer credits applied
  creditsApplied: integer("credits_applied").default(0), // Cents

  status: text("status").notNull().default("completed"), // pending, completed, refunded
  refundedAt: integer("refunded_at", { mode: "timestamp" }),
  refundReason: text("refund_reason"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  memberIdIdx: index("dues_payments_member_id_idx").on(table.memberId),
}));

// =============================================================================
// EVENTS & CALENDAR TABLES
// =============================================================================

/**
 * Events - matches, classes, orientations, work days, etc.
 *
 * Event types (from current calendar):
 * - match: USPSA, Steel Challenge, etc.
 * - class: Training courses
 * - arc_education: NMSE, NMO, safety eval
 * - arc_event: Swap meet, annual meeting
 * - arc_meeting: BOD meetings
 * - organized_practice: Regular practice groups
 * - work_day: 2nd Saturday monthly
 * - youth_event: 4H, junior programs
 * - range_unavailable: Closures, construction
 */
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  description: text("description"),                     // Rich text/markdown
  eventType: text("event_type").notNull(),

  // Timing
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),

  // Location
  location: text("location"),                           // Range A-L, Education Bldg, etc.
  rangeIds: text("range_ids"),                          // JSON array of affected ranges

  // Registration
  maxParticipants: integer("max_participants"),         // 0 or null = unlimited
  registrationDeadline: integer("registration_deadline", { mode: "timestamp" }),
  cost: integer("cost").default(0),                     // Cents (0 = free)

  // Requirements
  requiresCertification: text("requires_certification"), // JSON array of cert type IDs
  membersOnly: integer("members_only", { mode: "boolean" }).default(true),

  // Recurrence
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false),
  recurrenceRule: text("recurrence_rule"),              // iCal RRULE format
  parentEventId: text("parent_event_id")
    .references((): any => events.id),

  // Management
  directorId: text("director_id")                       // Match director, instructor
    .references(() => members.id),
  contactEmail: text("contact_email"),

  // Status
  status: text("status").notNull().default("draft"),    // draft, published, cancelled
  cancelledAt: integer("cancelled_at", { mode: "timestamp" }),
  cancellationReason: text("cancellation_reason"),

  // Visibility
  isPublic: integer("is_public", { mode: "boolean" }).default(false),

  createdBy: text("created_by")
    .references(() => members.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  startTimeIdx: index("events_start_time_idx").on(table.startTime),
  eventTypeIdx: index("events_event_type_idx").on(table.eventType),
  statusIdx: index("events_status_idx").on(table.status),
}));

/**
 * Event registrations
 */
export const eventRegistrations = sqliteTable("event_registrations", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  status: text("status").notNull().default("registered"), // registered, waitlisted, cancelled, no_show
  waitlistPosition: integer("waitlist_position"),

  // For matches - division/classification
  division: text("division"),
  classification: text("classification"),

  // Payment
  stripePaymentId: text("stripe_payment_id"),
  amountPaid: integer("amount_paid"),                   // Cents
  creditsApplied: integer("credits_applied").default(0),
  refundedAt: integer("refunded_at", { mode: "timestamp" }),

  // Attendance
  checkedInAt: integer("checked_in_at", { mode: "timestamp" }),
  checkedInBy: text("checked_in_by")
    .references(() => members.id),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  eventMemberIdx: uniqueIndex("event_registrations_event_member_idx")
    .on(table.eventId, table.memberId),
}));

/**
 * Match results - imported from Practiscore or entered manually
 */
export const matchResults = sqliteTable("match_results", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  memberId: text("member_id")
    .references(() => members.id),                      // Null for non-member shooters

  // Shooter info (for non-members)
  shooterName: text("shooter_name"),

  // Classification
  division: text("division"),                           // Open, Limited, Production, etc.
  classification: text("classification"),               // D, C, B, A, M, GM

  // Results
  overallPlace: integer("overall_place"),
  divisionPlace: integer("division_place"),
  totalTime: real("total_time"),                        // Seconds
  totalPoints: real("total_points"),
  penaltyCount: integer("penalty_count"),

  // Stage breakdown (JSON)
  stageResults: text("stage_results"),                  // JSON array

  // Practiscore import
  practiscoreId: text("practiscore_id"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  eventIdIdx: index("match_results_event_id_idx").on(table.eventId),
  memberIdIdx: index("match_results_member_id_idx").on(table.memberId),
}));

// =============================================================================
// GUEST TABLES
// =============================================================================

/**
 * Guests - people who have visited with a member
 */
export const guests = sqliteTable("guests", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),

  // Who first added them
  createdByMemberId: text("created_by_member_id")
    .notNull()
    .references(() => members.id),

  // Visit tracking (per calendar year)
  visitCountCurrentYear: integer("visit_count_current_year").default(0),
  visitCountYear: integer("visit_count_year"),          // Which year the count is for
  lastVisitAt: integer("last_visit_at", { mode: "timestamp" }),

  // Conversion tracking
  convertedToMemberId: text("converted_to_member_id")
    .references(() => members.id),

  // Status
  status: text("status").notNull().default("active"),   // active, should_join, limit_reached, banned
  bannedAt: integer("banned_at", { mode: "timestamp" }),
  bannedReason: text("banned_reason"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  emailIdx: index("guests_email_idx").on(table.email),
}));

/**
 * Guest visits - individual sign-in records with waivers
 */
export const guestVisits = sqliteTable("guest_visits", {
  id: text("id").primaryKey(),
  guestId: text("guest_id")
    .notNull()
    .references(() => guests.id, { onDelete: "cascade" }),
  hostMemberId: text("host_member_id")
    .notNull()
    .references(() => members.id),

  // Waiver
  waiverSignatureUrl: text("waiver_signature_url"),     // R2 path to signature image
  waiverAgreedAt: integer("waiver_agreed_at", { mode: "timestamp" }).notNull(),
  waiverIpAddress: text("waiver_ip_address"),
  waiverUserAgent: text("waiver_user_agent"),

  // Timing
  signedInAt: integer("signed_in_at", { mode: "timestamp" }).notNull(),
  signedOutAt: integer("signed_out_at", { mode: "timestamp" }),

  // Offline sync support
  offlineId: text("offline_id"),                        // Client-generated ID
  syncedAt: integer("synced_at", { mode: "timestamp" }),

  notes: text("notes"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  guestIdIdx: index("guest_visits_guest_id_idx").on(table.guestId),
  hostMemberIdx: index("guest_visits_host_member_idx").on(table.hostMemberId),
  signedInAtIdx: index("guest_visits_signed_in_at_idx").on(table.signedInAt),
}));

// =============================================================================
// SHOP TABLES
// =============================================================================

/**
 * Products - items available for purchase
 */
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),                 // apparel, accessories, targets, gear

  memberPrice: integer("member_price").notNull(),       // Cents
  inventoryCount: integer("inventory_count").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").default(5),

  // Images (JSON array of R2 paths)
  images: text("images"),

  isActive: integer("is_active", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  categoryIdx: index("products_category_idx").on(table.category),
  isActiveIdx: index("products_is_active_idx").on(table.isActive),
}));

/**
 * Product variants - sizes, colors, etc.
 */
export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  name: text("name").notNull(),                         // "Large", "Navy Blue"
  sku: text("sku").unique(),
  priceAdjustment: integer("price_adjustment").default(0), // Cents (+/-)
  inventoryCount: integer("inventory_count").notNull().default(0),

  isActive: integer("is_active", { mode: "boolean" }).default(true),
  sortOrder: integer("sort_order").default(0),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  productIdIdx: index("product_variants_product_id_idx").on(table.productId),
}));

/**
 * Orders - shop purchases
 */
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").unique(),           // ARC-2025-0001 format
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),

  // Totals (all in cents)
  subtotal: integer("subtotal").notNull(),
  tax: integer("tax").notNull(),
  shipping: integer("shipping").notNull().default(0),
  creditsApplied: integer("credits_applied").default(0),
  total: integer("total").notNull(),

  // Payment
  stripePaymentId: text("stripe_payment_id"),

  // Fulfillment
  fulfillmentType: text("fulfillment_type").notNull(),  // pickup, shipping
  status: text("status").notNull().default("pending"),  // pending, paid, ready, shipped, completed, cancelled

  // Shipping (if applicable)
  shippingAddress: text("shipping_address"),            // JSON
  trackingNumber: text("tracking_number"),
  shippedAt: integer("shipped_at", { mode: "timestamp" }),

  // Pickup
  readyAt: integer("ready_at", { mode: "timestamp" }),
  pickedUpAt: integer("picked_up_at", { mode: "timestamp" }),

  notes: text("notes"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  memberIdIdx: index("orders_member_id_idx").on(table.memberId),
  statusIdx: index("orders_status_idx").on(table.status),
}));

/**
 * Order line items
 */
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  variantId: text("variant_id")
    .references(() => productVariants.id),

  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),           // Cents at time of purchase

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
}));

// =============================================================================
// CONTENT TABLES
// =============================================================================

/**
 * Announcements - news and updates
 */
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  body: text("body").notNull(),                         // Rich text/markdown
  announcementType: text("announcement_type").notNull(), // general, safety, event, board

  // Scheduling
  publishAt: integer("publish_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }),

  // Display
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),

  // Delivery
  sendEmail: integer("send_email", { mode: "boolean" }).default(false),
  sendSms: integer("send_sms", { mode: "boolean" }).default(false), // Safety only
  emailSentAt: integer("email_sent_at", { mode: "timestamp" }),
  smsSentAt: integer("sms_sent_at", { mode: "timestamp" }),

  createdBy: text("created_by")
    .references(() => members.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  publishAtIdx: index("announcements_publish_at_idx").on(table.publishAt),
}));

/**
 * Documents - PDFs, bylaws, rules, etc.
 */
export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),                 // rules, bylaws, forms, minutes

  fileUrl: text("file_url").notNull(),                  // R2 path
  fileType: text("file_type").notNull(),                // pdf, doc, etc.
  fileSize: integer("file_size"),                       // Bytes

  accessLevel: text("access_level").notNull(),          // public, member, board

  downloadCount: integer("download_count").default(0),

  createdBy: text("created_by")
    .references(() => members.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  categoryIdx: index("documents_category_idx").on(table.category),
  accessLevelIdx: index("documents_access_level_idx").on(table.accessLevel),
}));

// =============================================================================
// RANGE & FACILITY TABLES
// =============================================================================

/**
 * Range status - real-time status of each range
 *
 * Status values:
 * - open: Available for general use
 * - event: Reserved for scheduled event
 * - closed: Not available
 * - maintenance: Work in progress
 */
export const rangeStatus = sqliteTable("range_status", {
  id: text("id").primaryKey(),                          // 'A', 'B', etc.

  name: text("name").notNull(),                         // "Pistol 25/50yd"
  description: text("description"),

  status: text("status").notNull().default("open"),
  statusNote: text("status_note"),                      // "High Power Match until 2pm"

  // Auto-revert
  expiresAt: integer("expires_at", { mode: "timestamp" }),

  // Calendar sync
  calendarEventId: text("calendar_event_id")
    .references(() => events.id),

  updatedBy: text("updated_by")
    .references(() => members.id),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// =============================================================================
// VOLUNTEER & CERTIFICATION TABLES
// =============================================================================

/**
 * Volunteer hours - logged service time
 *
 * Credits: $10/hour, $25 for match director, $25 for RSO full day
 * Expire March 31 each year (no rollover)
 */
export const volunteerHours = sqliteTable("volunteer_hours", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  date: integer("date", { mode: "timestamp" }).notNull(),
  hours: real("hours").notNull(),
  activity: text("activity").notNull(),                 // work_day, match_director, rso, etc.
  eventId: text("event_id")
    .references(() => events.id),
  notes: text("notes"),

  // Verification
  verifiedBy: text("verified_by")
    .references(() => members.id),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),

  // Credit calculation
  creditAmount: integer("credit_amount").notNull(),     // Cents
  creditUsed: integer("credit_used").default(0),        // How much has been spent
  fiscalYear: integer("fiscal_year").notNull(),         // Year credits expire (e.g., 2026)

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  memberIdIdx: index("volunteer_hours_member_id_idx").on(table.memberId),
  fiscalYearIdx: index("volunteer_hours_fiscal_year_idx").on(table.fiscalYear),
}));

/**
 * Certification types - RSO, instructor, steel certified, etc.
 */
export const certificationTypes = sqliteTable("certification_types", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),                         // "RSO", "Steel Certified"
  description: text("description"),
  validityMonths: integer("validity_months"),           // Null = permanent

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/**
 * Member certifications - earned credentials
 */
export const certifications = sqliteTable("certifications", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  certificationTypeId: text("certification_type_id")
    .notNull()
    .references(() => certificationTypes.id),

  earnedDate: integer("earned_date", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),

  documentUrl: text("document_url"),                    // Supporting doc

  verifiedBy: text("verified_by")
    .references(() => members.id),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  memberCertIdx: index("certifications_member_cert_idx")
    .on(table.memberId, table.certificationTypeId),
}));

// =============================================================================
// GOVERNANCE TABLES
// =============================================================================

/**
 * Board positions - the 10 BOD roles
 */
export const boardPositions = sqliteTable("board_positions", {
  id: text("id").primaryKey(),

  title: text("title").notNull(),                       // "President", "Dir. of Facilities"
  description: text("description"),
  emailAlias: text("email_alias"),                      // president@, facilities@

  // Election schedule (even/odd years)
  electionYearParity: text("election_year_parity"),     // "even" or "odd"
  termYears: integer("term_years").default(2),

  sortOrder: integer("sort_order").default(0),
});

/**
 * Board members - who holds each position
 */
export const boardMembers = sqliteTable("board_members", {
  id: text("id").primaryKey(),
  positionId: text("position_id")
    .notNull()
    .references(() => boardPositions.id),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),

  termStart: integer("term_start", { mode: "timestamp" }).notNull(),
  termEnd: integer("term_end", { mode: "timestamp" }),

  isCurrent: integer("is_current", { mode: "boolean" }).default(true),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  currentIdx: index("board_members_current_idx").on(table.isCurrent),
}));

/**
 * Discipline cases - member violations
 *
 * Status flow:
 * filed → notified → hearing_scheduled → decided → (appeal_pending →) closed
 */
export const disciplineCases = sqliteTable("discipline_cases", {
  id: text("id").primaryKey(),
  memberId: text("member_id")
    .notNull()
    .references(() => members.id),

  status: text("status").notNull().default("filed"),
  charges: text("charges").notNull(),                   // Written charges
  evidence: text("evidence"),                           // JSON array of document URLs

  // Notification (required: certified mail)
  filedBy: text("filed_by")
    .references(() => members.id),
  filedAt: integer("filed_at", { mode: "timestamp" }).notNull(),
  certifiedMailSentAt: integer("certified_mail_sent_at", { mode: "timestamp" }),
  certifiedMailTracking: text("certified_mail_tracking"),

  // Hearing (7+ days after notification)
  hearingDate: integer("hearing_date", { mode: "timestamp" }),
  memberStatement: text("member_statement"),

  // Decision (2/3 of full BOD to expel)
  decision: text("decision"),                           // warning, suspension, expulsion
  votesFor: integer("votes_for"),
  votesAgainst: integer("votes_against"),
  decidedAt: integer("decided_at", { mode: "timestamp" }),

  // Appeal
  appealRequestedAt: integer("appeal_requested_at", { mode: "timestamp" }),
  appealHearingDate: integer("appeal_hearing_date", { mode: "timestamp" }),
  appealResult: text("appeal_result"),                  // upheld, overturned

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// =============================================================================
// SYSTEM TABLES
// =============================================================================

/**
 * Site settings - configurable values (Tier 1 support)
 *
 * This enables board members to change business rules without code changes.
 */
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),                       // JSON-encoded
  description: text("description"),
  category: text("category").notNull(),                 // membership, events, shop, etc.
  updatedBy: text("updated_by")
    .references(() => members.id),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

/**
 * Audit log - all admin actions
 */
export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),

  userId: text("user_id")
    .references(() => users.id),
  action: text("action").notNull(),                     // create, update, delete, login, etc.

  targetType: text("target_type"),                      // member, event, order, etc.
  targetId: text("target_id"),

  details: text("details"),                             // JSON with before/after values

  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdIdx: index("audit_log_user_id_idx").on(table.userId),
  targetIdx: index("audit_log_target_idx").on(table.targetType, table.targetId),
  createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
}));

/**
 * Notification preferences - per-member opt-in/out
 */
export const notificationPreferences = sqliteTable("notification_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Channels (JSON: { email: bool, sms: bool })
  generalAnnouncements: text("general_announcements").default('{"email":true}'),
  safetyAlerts: text("safety_alerts").default('{"email":true,"sms":true}'), // Required
  eventReminders: text("event_reminders").default('{"email":true,"sms":false}'),
  duesReminders: text("dues_reminders").default('{"email":true,"sms":true}'), // Required
  rangeStatus: text("range_status").default('{"email":false,"sms":true}'),
  newsletter: text("newsletter").default('{"email":true}'),
  matchResults: text("match_results").default('{"email":true}'),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Auth types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;

// Member types
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type DuesPayment = typeof duesPayments.$inferSelect;

// Event types
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type MatchResult = typeof matchResults.$inferSelect;

// Guest types
export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;
export type GuestVisit = typeof guestVisits.$inferSelect;
export type NewGuestVisit = typeof guestVisits.$inferInsert;

// Shop types
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

// Content types
export type Announcement = typeof announcements.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type RangeStatus = typeof rangeStatus.$inferSelect;

// Volunteer types
export type VolunteerHours = typeof volunteerHours.$inferSelect;
export type Certification = typeof certifications.$inferSelect;

// Governance types
export type BoardPosition = typeof boardPositions.$inferSelect;
export type BoardMember = typeof boardMembers.$inferSelect;
export type DisciplineCase = typeof disciplineCases.$inferSelect;

// System types
export type Setting = typeof settings.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;
