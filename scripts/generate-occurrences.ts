/**
 * Generate event occurrences for 2025-2026 from recurring templates
 *
 * Run with: npx tsx scripts/generate-occurrences.ts
 */

import rrule from 'rrule';
const { RRule } = rrule;
import { readFile, writeFile } from 'fs/promises';

interface EventTemplate {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  location: string | null;
  rangeIds: string | null;
  recurrenceRule: string;
  mecPostId: number;
  mecSourceUrl: string;
}

// Default event times by type (hour in 24h format)
const DEFAULT_TIMES: Record<string, { start: number; duration: number }> = {
  match: { start: 8, duration: 6 },           // 8am-2pm
  class: { start: 9, duration: 4 },           // 9am-1pm
  arc_education: { start: 14, duration: 2 },  // 2pm-4pm (NMSE/NMO afternoon)
  arc_meeting: { start: 18, duration: 2 },    // 6pm-8pm
  youth_event: { start: 17, duration: 3 },    // 5pm-8pm
  work_day: { start: 8, duration: 4 },        // 8am-12pm
  organized_practice: { start: 8, duration: 4 },
  arc_event: { start: 10, duration: 4 },
  range_unavailable: { start: 7, duration: 12 },
};

function generateId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
}

async function main() {
  // Read templates from JSON (faster than querying DB)
  const templatesData = await readFile('scripts/imported-templates.json', 'utf-8');
  const allTemplates = JSON.parse(templatesData);

  // Filter to only recurring templates
  const recurringTemplates = allTemplates.filter((t: any) => t.isRecurring && t.recurrenceRule);

  console.log(`Found ${recurringTemplates.length} recurring templates\n`);

  // Date range: Jan 1, 2025 to Dec 31, 2026
  const startDate = new Date('2025-01-01T00:00:00');
  const endDate = new Date('2026-12-31T23:59:59');

  const occurrences: any[] = [];
  const now = new Date();

  for (const template of recurringTemplates) {
    try {
      // Parse RRULE
      const rule = RRule.fromString(`DTSTART:20250101T080000Z\nRRULE:${template.recurrenceRule}`);

      // Generate occurrences
      const dates = rule.between(startDate, endDate, true);

      const times = DEFAULT_TIMES[template.eventType] || { start: 9, duration: 3 };

      console.log(`${template.title}: ${dates.length} occurrences`);

      for (const date of dates) {
        // Set proper start/end times
        const startTime = new Date(date);
        startTime.setHours(times.start, 0, 0, 0);

        const endTime = new Date(startTime);
        endTime.setHours(times.start + times.duration, 0, 0, 0);

        occurrences.push({
          id: generateId(),
          title: template.title,
          description: template.description,
          eventType: template.eventType,
          startTime: Math.floor(startTime.getTime() / 1000),
          endTime: Math.floor(endTime.getTime() / 1000),
          location: template.location,
          rangeIds: template.rangeIds,
          isRecurring: 0,
          recurrenceRule: null,
          parentEventId: template.id,
          occurrenceDate: Math.floor(date.getTime() / 1000),
          mecPostId: template.mecPostId,
          mecSourceUrl: template.mecSourceUrl,
          isPublic: 1,
          status: 'published',
          createdAt: Math.floor(now.getTime() / 1000),
          updatedAt: Math.floor(now.getTime() / 1000),
        });
      }
    } catch (error) {
      console.error(`Error processing ${template.title}:`, error);
    }
  }

  // Also add non-recurring templates as single events (with placeholder dates spread across 2025-2026)
  const nonRecurring = allTemplates.filter((t: any) => !t.isRecurring);
  console.log(`\nAdding ${nonRecurring.length} non-recurring events as templates...`);

  // For non-recurring, we'll create them as "draft" templates that can be scheduled later
  // They don't have specific dates, so we won't generate occurrences

  console.log(`\nTotal occurrences generated: ${occurrences.length}`);

  // Group by month for summary
  const byMonth: Record<string, number> = {};
  for (const occ of occurrences) {
    const date = new Date(occ.startTime * 1000);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + 1;
  }

  console.log('\nOccurrences by month:');
  for (const [month, count] of Object.entries(byMonth).sort()) {
    console.log(`  ${month}: ${count}`);
  }

  // Generate SQL
  const sqlLines: string[] = [
    '-- Generated Event Occurrences for 2025-2026',
    `-- Generated: ${now.toISOString()}`,
    `-- Total: ${occurrences.length} occurrences`,
    '',
    "-- Clear existing generated occurrences (keep templates)",
    "DELETE FROM events WHERE parent_event_id IS NOT NULL;",
    '',
  ];

  for (const occ of occurrences) {
    const values = [
      `'${occ.id}'`,
      `'${occ.title.replace(/'/g, "''")}'`,
      occ.description ? `'${occ.description.replace(/'/g, "''")}'` : 'NULL',
      `'${occ.eventType}'`,
      occ.startTime,
      occ.endTime,
      occ.location ? `'${occ.location.replace(/'/g, "''")}'` : 'NULL',
      occ.rangeIds ? `'${occ.rangeIds}'` : 'NULL',
      'NULL', // maxParticipants
      'NULL', // registrationDeadline
      0,      // cost
      'NULL', // requiresCertification
      0,      // membersOnly
      0,      // isRecurring
      'NULL', // recurrenceRule
      'NULL', // recurrenceEndDate
      'NULL', // excludeDates
      `'${occ.parentEventId}'`, // parentEventId
      occ.occurrenceDate, // occurrenceDate
      occ.mecPostId,
      `'${occ.mecSourceUrl}'`,
      'NULL', // directorId
      'NULL', // contactEmail
      `'${occ.status}'`,
      'NULL', // cancelledAt
      'NULL', // cancellationReason
      occ.isPublic,
      'NULL', // createdBy
      occ.createdAt,
      occ.updatedAt,
    ];

    sqlLines.push(`INSERT INTO events (id, title, description, event_type, start_time, end_time, location, range_ids, max_participants, registration_deadline, cost, requires_certification, members_only, is_recurring, recurrence_rule, recurrence_end_date, exclude_dates, parent_event_id, occurrence_date, mec_post_id, mec_source_url, director_id, contact_email, status, cancelled_at, cancellation_reason, is_public, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
  }

  await writeFile('scripts/generated-occurrences.sql', sqlLines.join('\n'));
  console.log('\nSQL written to: scripts/generated-occurrences.sql');
}

main().catch(console.error);
