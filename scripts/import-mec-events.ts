/**
 * Import events from ARC's Modern Events Calendar RSS feed
 *
 * Run with: npx tsx scripts/import-mec-events.ts
 */

import { parseStringPromise } from 'xml2js';

const RSS_FEED_URL = 'https://austinrifleclub.org/events/feed/';
const MAX_PAGES = 15; // Fetch up to 15 pages of events

// Map MEC categories to our event types
const CATEGORY_MAP: Record<string, string> = {
  'match': 'match',
  'arc meeting': 'arc_meeting',
  'organized practice': 'organized_practice',
  'arc education': 'arc_education',
  'arc event': 'arc_event',
  'work day': 'work_day',
  'youth event': 'youth_event',
  'class': 'class',
  // Default fallback
  'default': 'arc_event',
};

interface MECEvent {
  title: string;
  link: string;
  description: string;
  contentEncoded: string;
  startDate: string;
  startHour: string;
  endDate: string;
  endHour: string;
  location: string;
  category: string;
  guid: string;
}

interface ParsedEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  rangeIds: string | null;
  isPublic: boolean;
  status: string;
  sourceUrl: string;
  sourceGuid: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parse time string like "7:30 AM" or "2:00 PM" to hours and minutes
 */
function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) {
    return { hours: 8, minutes: 0 }; // Default to 8 AM
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const isPM = match[3].toUpperCase() === 'PM';

  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

/**
 * Combine date string (YYYY-MM-DD) and time string (H:MM AM/PM) into a Date
 */
function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const { hours, minutes } = parseTimeString(timeStr);

  // Create date in Central Time (Austin)
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date;
}

/**
 * Extract range IDs from location string
 * e.g., "Ranges 'H, I, J, K, L'" -> ["H", "I", "J", "K", "L"]
 */
function extractRangeIds(location: string): string[] | null {
  if (!location) return null;

  const rangeIds: string[] = [];

  // Match patterns like "Range A", "Ranges H, I, J", "Range 'G'", etc.
  const patterns = [
    /Range[s]?\s*['"]?([A-L])['"]?/gi,
    /Range[s]?\s*['"]?([A-L])\s*(?:through|thru|-)\s*['"]?([A-L])['"]?/gi,
    /Range[s]?\s*['"]?([A-L](?:\s*,\s*[A-L])+)['"]?/gi,
  ];

  // Simple letter extraction
  const letterMatch = location.match(/[A-L]/g);
  if (letterMatch) {
    return [...new Set(letterMatch)];
  }

  return rangeIds.length > 0 ? rangeIds : null;
}

/**
 * Map MEC category to our event type
 */
function mapCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || CATEGORY_MAP['default'];
}

/**
 * Generate a deterministic ID from the source GUID
 */
function generateId(guid: string): string {
  // Extract the post ID from the GUID
  const match = guid.match(/p=(\d+)/);
  if (match) {
    return `mec-${match[1]}`;
  }
  // Fallback to hash
  let hash = 0;
  for (let i = 0; i < guid.length; i++) {
    const char = guid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `mec-${Math.abs(hash)}`;
}

/**
 * Strip HTML tags and decode entities
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Fetch and parse a single page of the RSS feed
 */
async function fetchRSSPage(page: number): Promise<MECEvent[]> {
  const url = `${RSS_FEED_URL}?paged=${page}`;
  console.log(`Fetching page ${page}: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch page ${page}: ${response.status}`);
    return [];
  }

  const xml = await response.text();

  try {
    const result = await parseStringPromise(xml, { explicitArray: false });

    if (!result.rss?.channel?.item) {
      return [];
    }

    const items = Array.isArray(result.rss.channel.item)
      ? result.rss.channel.item
      : [result.rss.channel.item];

    return items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      description: item.description || '',
      contentEncoded: item['content:encoded'] || '',
      startDate: item['mec:startDate'] || '',
      startHour: item['mec:startHour'] || '8:00 AM',
      endDate: item['mec:endDate'] || '',
      endHour: item['mec:endHour'] || '5:00 PM',
      location: item['mec:location'] || '',
      category: item['mec:category'] || '',
      guid: item.guid?._ || item.guid || '',
    }));
  } catch (error) {
    console.error(`Failed to parse page ${page}:`, error);
    return [];
  }
}

/**
 * Fetch all events from the RSS feed
 */
async function fetchAllEvents(): Promise<MECEvent[]> {
  const allEvents: MECEvent[] = [];
  const seenGuids = new Set<string>();

  for (let page = 1; page <= MAX_PAGES; page++) {
    const events = await fetchRSSPage(page);

    if (events.length === 0) {
      console.log(`No events on page ${page}, stopping.`);
      break;
    }

    // Deduplicate by GUID
    for (const event of events) {
      if (!seenGuids.has(event.guid)) {
        seenGuids.add(event.guid);
        allEvents.push(event);
      }
    }

    // Small delay to be nice to their server
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allEvents;
}

/**
 * Convert MEC event to our schema
 */
function convertEvent(mec: MECEvent): ParsedEvent {
  const now = new Date();

  // Parse dates
  let startTime: Date;
  let endTime: Date;

  try {
    startTime = combineDateAndTime(mec.startDate, mec.startHour);
    endTime = combineDateAndTime(mec.endDate, mec.endHour);

    // If end is before start (shouldn't happen), set end to start + 2 hours
    if (endTime <= startTime) {
      endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);
    }
  } catch (error) {
    console.error(`Failed to parse dates for "${mec.title}":`, error);
    startTime = now;
    endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  }

  // Get description - prefer content:encoded, fallback to description
  let description = mec.contentEncoded || mec.description;
  description = stripHtml(description);

  // Extract range IDs
  const rangeIds = extractRangeIds(mec.location);

  return {
    id: generateId(mec.guid),
    title: stripHtml(mec.title),
    description: description || null,
    eventType: mapCategory(mec.category),
    startTime,
    endTime,
    location: mec.location || null,
    rangeIds: rangeIds ? JSON.stringify(rangeIds) : null,
    isPublic: true, // MEC events are public calendar events
    status: 'published',
    sourceUrl: mec.link,
    sourceGuid: mec.guid,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Generate SQL INSERT statements
 */
function generateSQL(events: ParsedEvent[]): string {
  const lines: string[] = [
    '-- Import from ARC Modern Events Calendar',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Total events: ${events.length}`,
    '',
    '-- Clear existing imported events (optional - uncomment if needed)',
    "-- DELETE FROM events WHERE id LIKE 'mec-%';",
    '',
  ];

  for (const event of events) {
    const values = [
      `'${event.id}'`,
      `'${event.title.replace(/'/g, "''")}'`,
      event.description ? `'${event.description.replace(/'/g, "''")}'` : 'NULL',
      `'${event.eventType}'`,
      Math.floor(event.startTime.getTime() / 1000),
      Math.floor(event.endTime.getTime() / 1000),
      event.location ? `'${event.location.replace(/'/g, "''")}'` : 'NULL',
      event.rangeIds ? `'${event.rangeIds}'` : 'NULL',
      'NULL', // maxParticipants
      'NULL', // registrationDeadline
      0, // cost
      'NULL', // requiresCertification
      0, // membersOnly (false for public events)
      0, // isRecurring
      'NULL', // recurrenceRule
      'NULL', // parentEventId
      'NULL', // directorId
      'NULL', // contactEmail
      `'${event.status}'`,
      'NULL', // cancelledAt
      'NULL', // cancellationReason
      event.isPublic ? 1 : 0,
      'NULL', // createdBy
      Math.floor(event.createdAt.getTime() / 1000),
      Math.floor(event.updatedAt.getTime() / 1000),
    ];

    lines.push(`INSERT OR REPLACE INTO events (id, title, description, event_type, start_time, end_time, location, range_ids, max_participants, registration_deadline, cost, requires_certification, members_only, is_recurring, recurrence_rule, parent_event_id, director_id, contact_email, status, cancelled_at, cancellation_reason, is_public, created_by, created_at, updated_at) VALUES (${values.join(', ')});`);
  }

  return lines.join('\n');
}

/**
 * Generate JSON output for review
 */
function generateJSON(events: ParsedEvent[]): string {
  return JSON.stringify(events.map(e => ({
    ...e,
    startTime: e.startTime.toISOString(),
    endTime: e.endTime.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  })), null, 2);
}

/**
 * Main
 */
async function main() {
  console.log('Fetching events from ARC MEC RSS feed...\n');

  const mecEvents = await fetchAllEvents();
  console.log(`\nFetched ${mecEvents.length} events total.\n`);

  if (mecEvents.length === 0) {
    console.log('No events found. Exiting.');
    return;
  }

  // Convert to our format
  const parsedEvents = mecEvents.map(convertEvent);

  // Sort by start time
  parsedEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Print summary by category
  const byCategory: Record<string, number> = {};
  for (const event of parsedEvents) {
    byCategory[event.eventType] = (byCategory[event.eventType] || 0) + 1;
  }

  console.log('Events by type:');
  for (const [type, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type}: ${count}`);
  }
  console.log('');

  // Print date range
  const firstEvent = parsedEvents[0];
  const lastEvent = parsedEvents[parsedEvents.length - 1];
  console.log(`Date range: ${firstEvent.startTime.toDateString()} - ${lastEvent.startTime.toDateString()}\n`);

  // Generate outputs
  const sql = generateSQL(parsedEvents);
  const json = generateJSON(parsedEvents);

  // Write files
  const fs = await import('fs/promises');

  await fs.writeFile('scripts/imported-events.sql', sql);
  console.log('SQL written to: scripts/imported-events.sql');

  await fs.writeFile('scripts/imported-events.json', json);
  console.log('JSON written to: scripts/imported-events.json');

  // Print first few events as sample
  console.log('\nSample events:');
  for (const event of parsedEvents.slice(0, 5)) {
    console.log(`  - ${event.title}`);
    console.log(`    Type: ${event.eventType}`);
    console.log(`    When: ${event.startTime.toLocaleString()} - ${event.endTime.toLocaleTimeString()}`);
    console.log(`    Location: ${event.location || 'TBD'}`);
    console.log('');
  }
}

main().catch(console.error);
