/**
 * Scan for all MEC events by iterating through WordPress post IDs
 *
 * Run with: npx tsx scripts/scan-mec-events.ts
 */

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

const START_ID = 4800;
const END_ID = 6600;
const BATCH_SIZE = 50;

async function checkPostExists(postId: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://austinrifleclub.org/?post_type=mec-events&p=${postId}`,
      { redirect: 'manual' }
    );

    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      if (location && location.includes('/events/')) {
        return location;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function fetchEventDetails(url: string, postId: number): Promise<ScannedEvent | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const html = await response.text();

    // Extract JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
    let startDate = '';
    let endDate = '';
    let title = 'Unknown';
    let location = '';
    let description = '';

    if (jsonLdMatch) {
      try {
        const jsonLd = JSON.parse(jsonLdMatch[1]);
        if (jsonLd['@type'] === 'Event') {
          title = jsonLd.name || '';
          startDate = jsonLd.startDate || '';
          endDate = jsonLd.endDate || '';
          description = jsonLd.description || '';
          if (jsonLd.location) {
            location = jsonLd.location.name || jsonLd.location.address?.streetAddress || '';
          }
        }
      } catch (e) {
        // JSON parse failed, fall back to HTML parsing
      }
    }

    // Fallback to HTML parsing if JSON-LD didn't work
    if (!title || title === 'Unknown') {
      const titleMatch = html.match(/<h1[^>]*class="[^"]*mec-single-title[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                         html.match(/<title>([^<|]+)/i);
      title = titleMatch ? titleMatch[1].trim() : 'Unknown';
    }

    // Extract category from HTML
    const categoryMatch = html.match(/mec-category[^>]*>[\s\S]*?<a[^>]*>([^<]+)</i);
    const category = categoryMatch ? categoryMatch[1].trim() : '';

    return {
      postId,
      url,
      title,
      startDate,
      endDate,
      location,
      category,
      description: description.substring(0, 500),
    };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

async function scanBatch(startId: number, endId: number): Promise<ScannedEvent[]> {
  const events: ScannedEvent[] = [];
  const promises: Promise<void>[] = [];

  for (let id = startId; id <= endId; id++) {
    promises.push(
      checkPostExists(id).then(async (url) => {
        if (url) {
          const event = await fetchEventDetails(url, id);
          if (event) {
            events.push(event);
            console.log(`Found: ${event.postId} - ${event.title}`);
          }
        }
      })
    );
  }

  await Promise.all(promises);
  return events;
}

async function main() {
  console.log(`Scanning post IDs ${START_ID} to ${END_ID}...\n`);

  const allEvents: ScannedEvent[] = [];

  for (let start = START_ID; start <= END_ID; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE - 1, END_ID);
    console.log(`Scanning ${start}-${end}...`);

    const events = await scanBatch(start, end);
    allEvents.push(...events);

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\nFound ${allEvents.length} total events.\n`);

  // Sort by postId
  allEvents.sort((a, b) => a.postId - b.postId);

  // Save results
  const fs = await import('fs/promises');
  await fs.writeFile(
    'scripts/scanned-events.json',
    JSON.stringify(allEvents, null, 2)
  );
  console.log('Results written to: scripts/scanned-events.json');

  // Print summary
  console.log('\nEvents found:');
  for (const event of allEvents) {
    console.log(`  ${event.postId}: ${event.title} (${event.startDate || 'no date'})`);
  }
}

main().catch(console.error);
