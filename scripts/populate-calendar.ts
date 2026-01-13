/**
 * Populate full calendar for 2025-2026
 * - Uses recurring templates to generate occurrences
 * - Schedules regular events based on typical patterns
 *
 * Run with: npx tsx scripts/populate-calendar.ts
 */

import rrule from 'rrule';
const { RRule } = rrule;
import { writeFile } from 'fs/promises';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startTime: number;
  endTime: number;
  location: string;
  rangeIds: string | null;
  isRecurring: number;
  isPublic: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

interface ScheduleConfig {
  rule: string;
  type: string;
  ranges: string[] | null;
  start: number;
  duration: number;
}

// Common event schedules (what typically happens each month)
const MONTHLY_SCHEDULE: Record<string, ScheduleConfig> = {
  // Matches
  'USPSA Pistol Match': { rule: 'FREQ=MONTHLY;BYDAY=1SA,3SA', type: 'match', ranges: ['H','I','J','K','L'], start: 8, duration: 6 },
  'Steel Challenge Match': { rule: 'FREQ=MONTHLY;BYDAY=4SU', type: 'match', ranges: ['H','I','J','K','L'], start: 8, duration: 5 },
  'IDPA Match': { rule: 'FREQ=MONTHLY;BYDAY=3SU', type: 'match', ranges: ['H','I','J','K','L'], start: 8, duration: 6 },
  'High Power Rifle Match': { rule: 'FREQ=MONTHLY;BYDAY=1SA', type: 'match', ranges: ['C'], start: 8, duration: 6 },
  'Benchrest Match': { rule: 'FREQ=MONTHLY;BYDAY=4SA', type: 'match', ranges: ['C'], start: 8, duration: 5 },
  '2700 Pistol Match': { rule: 'FREQ=MONTHLY;BYDAY=3SA', type: 'match', ranges: ['A'], start: 8, duration: 8 },
  'Smallbore Silhouette Match': { rule: 'FREQ=MONTHLY;BYDAY=3SU', type: 'match', ranges: ['D','E'], start: 9, duration: 4 },
  'Hunter Pistol Silhouette': { rule: 'FREQ=MONTHLY;BYDAY=2SA', type: 'match', ranges: ['D','E'], start: 8, duration: 5 },

  // Regular club events
  'BOD Meeting': { rule: 'FREQ=MONTHLY;BYDAY=2MO', type: 'arc_meeting', ranges: null, start: 18, duration: 2 },
  'Work Day': { rule: 'FREQ=MONTHLY;BYDAY=2SA', type: 'work_day', ranges: ['A','B','C','D','E','F','G','H','I','J','K','L'], start: 8, duration: 4 },
  'New Member Safety Eval': { rule: 'FREQ=MONTHLY;BYDAY=2SA', type: 'arc_education', ranges: ['G','H'], start: 14, duration: 2 },
  'New Member Orientation': { rule: 'FREQ=MONTHLY;BYDAY=2SA', type: 'arc_education', ranges: ['F'], start: 16, duration: 2 },

  // Youth programs
  '4-H Air Pistol Practice': { rule: 'FREQ=WEEKLY;BYDAY=TH', type: 'youth_event', ranges: null, start: 17, duration: 2 },

  // Organized practice
  'Advanced Tactical Practice': { rule: 'FREQ=MONTHLY;BYDAY=3TH', type: 'organized_practice', ranges: ['I','J'], start: 8, duration: 7 },
  'Ben Hur Pistol Practice': { rule: 'FREQ=MONTHLY;BYDAY=3TU', type: 'organized_practice', ranges: ['A'], start: 9, duration: 4 },
  'Austin Girl and a Gun': { rule: 'FREQ=MONTHLY;BYDAY=1SA,3SA', type: 'organized_practice', ranges: ['H'], start: 14, duration: 3 },
};

function generateId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

async function main() {
  const startDate = new Date('2025-01-01T00:00:00');
  const endDate = new Date('2026-12-31T23:59:59');
  const now = new Date();

  const events: CalendarEvent[] = [];

  console.log('Generating calendar events for 2025-2026...\n');

  for (const [name, config] of Object.entries(MONTHLY_SCHEDULE)) {
    try {
      const rule = RRule.fromString(`DTSTART:20250101T${String(config.start).padStart(2,'0')}0000Z\nRRULE:${config.rule}`);
      const dates = rule.between(startDate, endDate, true);

      console.log(`${name}: ${dates.length} occurrences`);

      for (const date of dates) {
        const startTime = new Date(date);
        startTime.setHours(config.start, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(config.start + config.duration, 0, 0, 0);

        events.push({
          id: generateId(),
          title: name,
          description: `${name} at Austin Rifle Club`,
          eventType: config.type,
          startTime: Math.floor(startTime.getTime() / 1000),
          endTime: Math.floor(endTime.getTime() / 1000),
          location: config.ranges ? `Range${config.ranges.length > 1 ? 's' : ''} ${config.ranges.join(', ')}` : 'Education Building',
          rangeIds: config.ranges ? JSON.stringify(config.ranges) : null,
          isRecurring: 0,
          isPublic: 1,
          status: 'published',
          createdAt: Math.floor(now.getTime() / 1000),
          updatedAt: Math.floor(now.getTime() / 1000),
        });
      }
    } catch (error) {
      console.error(`Error with ${name}:`, error);
    }
  }

  // Add some one-off annual events
  const annualEvents = [
    { title: 'Annual Meeting & Election', month: 1, day: 18, type: 'arc_meeting', start: 14, duration: 4 },
    { title: 'Annual Picnic', month: 4, day: 19, type: 'arc_event', start: 11, duration: 5 },
    { title: 'Independence Day - Club Closed', month: 7, day: 4, type: 'range_unavailable', start: 0, duration: 24 },
    { title: 'Labor Day - Club Closed', month: 9, day: 1, type: 'range_unavailable', start: 0, duration: 24 },
    { title: 'Thanksgiving - Club Closed', month: 11, day: 27, type: 'range_unavailable', start: 0, duration: 24 },
    { title: 'Christmas - Club Closed', month: 12, day: 25, type: 'range_unavailable', start: 0, duration: 24 },
    { title: 'Members Swap Meet', month: 3, day: 15, type: 'arc_event', start: 9, duration: 4 },
    { title: 'TSRA Lever Action Championship', month: 10, day: 11, type: 'match', start: 8, duration: 8 },
  ];

  for (const year of [2025, 2026]) {
    for (const evt of annualEvents) {
      const date = new Date(year, evt.month - 1, evt.day, evt.start);
      const endDate = new Date(date);
      endDate.setHours(evt.start + evt.duration);

      events.push({
        id: generateId(),
        title: evt.title,
        description: evt.title,
        eventType: evt.type,
        startTime: Math.floor(date.getTime() / 1000),
        endTime: Math.floor(endDate.getTime() / 1000),
        location: evt.type === 'range_unavailable' ? 'All Ranges' : 'Education Building',
        rangeIds: null,
        isRecurring: 0,
        isPublic: 1,
        status: 'published',
        createdAt: Math.floor(now.getTime() / 1000),
        updatedAt: Math.floor(now.getTime() / 1000),
      });
    }
  }

  console.log(`\nTotal events: ${events.length}`);

  // Count by type
  const byType: Record<string, number> = {};
  for (const e of events) {
    byType[e.eventType] = (byType[e.eventType] || 0) + 1;
  }
  console.log('\nBy type:');
  for (const [type, count] of Object.entries(byType).sort((a,b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }

  // Count by month
  const byMonth: Record<string, number> = {};
  for (const e of events) {
    const d = new Date(e.startTime * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
  }
  console.log('\nBy month:');
  for (const [month, count] of Object.entries(byMonth).sort()) {
    console.log(`  ${month}: ${count}`);
  }

  // Generate SQL
  const sqlLines: string[] = [
    '-- Full Calendar Population for 2025-2026',
    `-- Generated: ${now.toISOString()}`,
    `-- Total: ${events.length} events`,
    '',
    "-- Clear all events and start fresh",
    "DELETE FROM events;",
    '',
  ];

  for (const evt of events) {
    const values = [
      `'${evt.id}'`,
      `'${evt.title.replace(/'/g, "''")}'`,
      evt.description ? `'${evt.description.replace(/'/g, "''")}'` : 'NULL',
      `'${evt.eventType}'`,
      evt.startTime,
      evt.endTime,
      evt.location ? `'${evt.location.replace(/'/g, "''")}'` : 'NULL',
      evt.rangeIds ? `'${evt.rangeIds}'` : 'NULL',
      'NULL', // maxParticipants
      'NULL', // registrationDeadline
      0,      // cost
      'NULL', // requiresCertification
      0,      // membersOnly
      0,      // isRecurring
      'NULL', // recurrenceRule
      'NULL', // recurrenceEndDate
      'NULL', // excludeDates
      'NULL', // parentEventId
      'NULL', // occurrenceDate
      'NULL', // mecPostId
      'NULL', // mecSourceUrl
      'NULL', // directorId
      'NULL', // contactEmail
      `'${evt.status}'`,
      'NULL', // cancelledAt
      'NULL', // cancellationReason
      evt.isPublic,
      'NULL', // createdBy
      evt.createdAt,
      evt.updatedAt,
    ];

    sqlLines.push(`INSERT INTO events (id, title, description, event_type, start_time, end_time, location, range_ids, max_participants, registration_deadline, cost, requires_certification, members_only, is_recurring, recurrence_rule, recurrence_end_date, exclude_dates, parent_event_id, occurrence_date, mec_post_id, mec_source_url, director_id, contact_email, status, cancelled_at, cancellation_reason, is_public, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
  }

  await writeFile('scripts/full-calendar.sql', sqlLines.join('\n'));
  console.log('\nSQL written to: scripts/full-calendar.sql');
}

main().catch(console.error);
