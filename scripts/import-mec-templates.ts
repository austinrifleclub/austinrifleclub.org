/**
 * Import MEC events as recurring templates
 *
 * Run with: npx tsx scripts/import-mec-templates.ts
 */

import { readFile, writeFile } from 'fs/promises';

interface ScannedEvent {
  postId: number;
  url: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  description: string;
}

interface EventTemplate {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: number;
  endTime: number;
  location: string | null;
  rangeIds: string | null;
  isRecurring: number;
  recurrenceRule: string | null;
  mecPostId: number;
  mecSourceUrl: string;
  isPublic: number;
  status: string;
  createdAt: number;
  updatedAt: number;
}

// Map MEC categories/patterns to our event types
function mapEventType(title: string, category: string): string {
  const titleLower = title.toLowerCase();
  const catLower = category.toLowerCase();

  if (titleLower.includes('uspsa') || titleLower.includes('idpa') ||
      titleLower.includes('steel challenge') || titleLower.includes('silhouette') ||
      titleLower.includes('benchrest') || titleLower.includes('high power') ||
      titleLower.includes('pistol match') || titleLower.includes('rifle match') ||
      catLower.includes('match')) {
    return 'match';
  }
  if (titleLower.includes('nmse') || titleLower.includes('nmo') ||
      titleLower.includes('new member') || titleLower.includes('orientation') ||
      titleLower.includes('safety eval')) {
    return 'arc_education';
  }
  if (titleLower.includes('ltc') || titleLower.includes('pistol class') ||
      titleLower.includes('basic pistol') || titleLower.includes('nra ') ||
      titleLower.includes('intro to') || titleLower.includes('hunter ed') ||
      titleLower.includes('skills class') || titleLower.includes('reloading')) {
    return 'class';
  }
  if (titleLower.includes('bod') || titleLower.includes('board') ||
      titleLower.includes('meeting') || titleLower.includes('annual meeting')) {
    return 'arc_meeting';
  }
  if (titleLower.includes('4-h') || titleLower.includes('4h') ||
      titleLower.includes('youth') || titleLower.includes('junior')) {
    return 'youth_event';
  }
  if (titleLower.includes('work day') || titleLower.includes('workday')) {
    return 'work_day';
  }
  if (titleLower.includes('practice') || titleLower.includes('tactical')) {
    return 'organized_practice';
  }
  if (titleLower.includes('construction') || titleLower.includes('closed') ||
      titleLower.includes('maintenance') || titleLower.includes('mowing')) {
    return 'range_unavailable';
  }
  if (titleLower.includes('swap meet') || titleLower.includes('picnic')) {
    return 'arc_event';
  }
  return 'arc_event';
}

// Infer recurrence rule from title patterns
function inferRecurrenceRule(title: string): string | null {
  const titleLower = title.toLowerCase();

  // "1/3sa" or "1st and 3rd Saturday"
  if (titleLower.includes('1/3sa') || titleLower.includes('1st and 3rd')) {
    return 'FREQ=MONTHLY;BYDAY=1SA,3SA';
  }
  // "2nd Saturday"
  if (titleLower.includes('2nd saturday') || titleLower.includes('2sa')) {
    return 'FREQ=MONTHLY;BYDAY=2SA';
  }
  // "3rd Sunday"
  if (titleLower.includes('3rd sunday') || titleLower.includes('3su')) {
    return 'FREQ=MONTHLY;BYDAY=3SU';
  }
  // "4th Saturday"
  if (titleLower.includes('4th saturday') || titleLower.includes('4sa') || titleLower.includes('4su')) {
    return 'FREQ=MONTHLY;BYDAY=4SA';
  }
  // "5th Sat" (rare months with 5 Saturdays)
  if (titleLower.includes('5th sat') || titleLower.includes('5sa')) {
    return 'FREQ=MONTHLY;BYDAY=5SA';
  }
  // "2nd Monday" (BOD meetings)
  if (titleLower.includes('2nd monday') || titleLower.includes('second monday')) {
    return 'FREQ=MONTHLY;BYDAY=2MO';
  }
  // Monthly patterns
  if (titleLower.includes('monthly') || titleLower.includes('each month')) {
    return 'FREQ=MONTHLY';
  }
  return null;
}

// Extract range IDs from location/title
function extractRangeIds(location: string, title: string): string[] | null {
  const combined = `${location} ${title}`;
  const rangeIds: string[] = [];

  // Match patterns like "Range A", "Ranges H-L", "Ranges G, H, I"
  const letterMatches = combined.match(/Range[s]?\s*['\"]?([A-L](?:\s*[-,&through]+\s*[A-L])*)['\"]?/gi);

  if (letterMatches) {
    for (const match of letterMatches) {
      const letters = match.match(/[A-L]/g);
      if (letters) {
        rangeIds.push(...letters);
      }
    }
  }

  // Also check for standalone letters after "Range"
  const standaloneMatch = combined.match(/[Rr]ange\s+([A-L])/g);
  if (standaloneMatch) {
    for (const match of standaloneMatch) {
      const letter = match.match(/[A-L]/);
      if (letter) rangeIds.push(letter[0]);
    }
  }

  const unique = [...new Set(rangeIds)];
  return unique.length > 0 ? unique : null;
}

// Decode HTML entities
function decodeEntities(str: string): string {
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  // Read scanned events
  const scannedData = await readFile('scripts/scanned-events.json', 'utf-8');
  const scannedEvents: ScannedEvent[] = JSON.parse(scannedData);

  console.log(`Processing ${scannedEvents.length} scanned events...\n`);

  const now = new Date();
  const templates: EventTemplate[] = [];

  for (const event of scannedEvents) {
    const title = decodeEntities(event.title);
    const description = decodeEntities(event.description || '');
    const location = decodeEntities(event.location || '');

    const eventType = mapEventType(title, event.category);
    const recurrenceRule = inferRecurrenceRule(title);
    const rangeIds = extractRangeIds(location, title);

    // Generate ID
    const id = `mec-${event.postId}`;

    templates.push({
      id,
      title,
      description: description || null,
      eventType,
      // Default times (8am-5pm) - actual times would come from JSON-LD fetch
      startTime: Math.floor(now.getTime() / 1000),
      endTime: Math.floor(now.getTime() / 1000) + 3600 * 9,
      location: location || null,
      rangeIds: rangeIds ? JSON.stringify(rangeIds) : null,
      isRecurring: recurrenceRule ? 1 : 0,
      recurrenceRule: recurrenceRule,
      mecPostId: event.postId,
      mecSourceUrl: event.url,
      isPublic: 1,
      status: 'published',
      createdAt: Math.floor(now.getTime() / 1000),
      updatedAt: Math.floor(now.getTime() / 1000),
    });
  }

  // Group by event type
  const byType: Record<string, number> = {};
  const recurring: number = templates.filter(t => t.isRecurring).length;

  for (const t of templates) {
    byType[t.eventType] = (byType[t.eventType] || 0) + 1;
  }

  console.log('Event templates by type:');
  for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
  console.log(`\nRecurring events: ${recurring}`);
  console.log(`One-time events: ${templates.length - recurring}`);

  // Generate SQL
  const sqlLines: string[] = [
    '-- MEC Event Templates Import',
    `-- Generated: ${now.toISOString()}`,
    `-- Total: ${templates.length} events`,
    '',
    "-- Clear existing MEC imports",
    "DELETE FROM events WHERE id LIKE 'mec-%';",
    '',
  ];

  for (const t of templates) {
    const values = [
      `'${t.id}'`,
      `'${t.title.replace(/'/g, "''")}'`,
      t.description ? `'${t.description.replace(/'/g, "''")}'` : 'NULL',
      `'${t.eventType}'`,
      t.startTime,
      t.endTime,
      t.location ? `'${t.location.replace(/'/g, "''")}'` : 'NULL',
      t.rangeIds ? `'${t.rangeIds}'` : 'NULL',
      'NULL', // maxParticipants
      'NULL', // registrationDeadline
      0,      // cost
      'NULL', // requiresCertification
      0,      // membersOnly
      t.isRecurring,
      t.recurrenceRule ? `'${t.recurrenceRule}'` : 'NULL',
      'NULL', // recurrenceEndDate
      'NULL', // excludeDates
      'NULL', // parentEventId
      'NULL', // occurrenceDate
      t.mecPostId,
      `'${t.mecSourceUrl}'`,
      'NULL', // directorId
      'NULL', // contactEmail
      `'${t.status}'`,
      'NULL', // cancelledAt
      'NULL', // cancellationReason
      t.isPublic,
      'NULL', // createdBy
      t.createdAt,
      t.updatedAt,
    ];

    sqlLines.push(`INSERT INTO events (id, title, description, event_type, start_time, end_time, location, range_ids, max_participants, registration_deadline, cost, requires_certification, members_only, is_recurring, recurrence_rule, recurrence_end_date, exclude_dates, parent_event_id, occurrence_date, mec_post_id, mec_source_url, director_id, contact_email, status, cancelled_at, cancellation_reason, is_public, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
  }

  // Write SQL file
  await writeFile('scripts/imported-templates.sql', sqlLines.join('\n'));
  console.log('\nSQL written to: scripts/imported-templates.sql');

  // Write JSON for reference
  await writeFile('scripts/imported-templates.json', JSON.stringify(templates, null, 2));
  console.log('JSON written to: scripts/imported-templates.json');
}

main().catch(console.error);
