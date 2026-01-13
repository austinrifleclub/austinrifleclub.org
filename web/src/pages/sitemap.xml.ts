/**
 * Sitemap Generator
 *
 * Generates XML sitemap for search engines.
 */

import type { APIRoute } from 'astro';

const BASE_URL = 'https://austinrifleclub.org';

// Static pages with their priorities
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/ranges', priority: 0.9, changefreq: 'hourly' },
  { url: '/calendar', priority: 0.8, changefreq: 'daily' },
  { url: '/membership', priority: 0.8, changefreq: 'monthly' },
  { url: '/about', priority: 0.6, changefreq: 'monthly' },
  { url: '/faq', priority: 0.6, changefreq: 'monthly' },
  { url: '/range-rules', priority: 0.7, changefreq: 'monthly' },
  { url: '/login', priority: 0.3, changefreq: 'monthly' },
  { url: '/apply', priority: 0.7, changefreq: 'monthly' },
];

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
