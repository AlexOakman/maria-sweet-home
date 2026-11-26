import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { counterId, siteUrl, verification } from './config.mjs';

const routes = ['', 'works/', 'works/wedding/', 'works/bento/', 'fillings/', 'reviews/', 'about/', 'contacts/'];
const titles = new Set();
const descriptions = new Set();
const sitemap = await readFile('dist/sitemap.xml', 'utf8');

for (const route of routes) {
  const pagePath = join('dist', route, 'index.html');
  const html = await readFile(pagePath, 'utf8');
  const canonical = new URL(route, siteUrl).href;
  assert.ok(html.includes(`rel="canonical" href="${canonical}"`), pagePath);
  assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), canonical);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, pagePath);
  assert.equal(html.includes('noindex'), false, pagePath);
  assert.ok(!/whatsapp|wa\.me/i.test(html), pagePath);
  titles.add(html.match(/<title>([^<]+)<\/title>/)?.[1]);
  descriptions.add(html.match(/name="description" content="([^"]+)"/)?.[1]);
  assert.equal(html.includes('data-metrika='), Boolean(counterId), pagePath);
  if (counterId) assert.ok(html.includes(`data-metrika="${counterId}"`), pagePath);
  assert.equal(html.includes('name="google-site-verification"'), Boolean(verification && route === ''), pagePath);

  for (const [, href] of html.matchAll(/(?:href|src|srcset|data-source)="(\/[^"]*)"/g)) {
    assert.ok(href.startsWith(siteUrl.pathname), `Неверный префикс URL в ${pagePath}: ${href}`);
    const path = href.slice(siteUrl.pathname.length);
    await access(join('dist', path, href.endsWith('/') ? 'index.html' : ''));
  }
}

assert.equal(titles.size, routes.length);
assert.equal(descriptions.size, routes.length);
assert.ok(!titles.has(undefined) && !descriptions.has(undefined));
assert.equal((sitemap.match(/<loc>/g) || []).length, routes.length);
const missing = await readFile('dist/404.html', 'utf8');
assert.ok(missing.includes('name="robots" content="noindex"'));
if (siteUrl.pathname === '/') {
  assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${new URL('sitemap.xml', siteUrl).href}`));
} else {
  await assert.rejects(access('dist/robots.txt'), { code: 'ENOENT' });
}
console.log('Проверены страницы, внутренние ссылки, файлы, метаданные и карта сайта.');
