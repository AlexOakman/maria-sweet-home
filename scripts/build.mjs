import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createSite, escapeHtml } from '../src/site.mjs';
import { counterId, siteUrl, verification } from './config.mjs';

const output = 'dist';
const readData = async (name) => JSON.parse(await readFile(`content/${name}.json`, 'utf8'));
const [site, gallery, fillings, reviews, files] = await Promise.all([
  readData('site'),
  readData('gallery'),
  readData('fillings'),
  readData('reviews'),
  readdir('public/assets'),
]);
const assets = new Set(files);
for (const required of ['site.css', 'site.js', 'favicon.png', site.hero.video, site.hero.poster]) {
  if (!assets.has(required)) throw new Error(`Ресурс отсутствует: ${required}`);
}

const { pages, document, notFound } = createSite({
  site, gallery, fillings, reviews, url: siteUrl, assets, counterId, verification,
});
const documents = pages.map((page) => [`${page.route}index.html`, document(page)]);
documents.push(['404.html', document(notFound, { missing: true })]);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(({ route }) => `  <url><loc>${escapeHtml(new URL(route, siteUrl).href)}</loc></url>`).join('\n')}
</urlset>
`;
documents.push(['sitemap.xml', sitemap]);
if (siteUrl.pathname === '/') {
  documents.push(['robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', siteUrl).href}\n`]);
}

await rm(output, { recursive: true, force: true });
await mkdir(output);
await cp('public/assets', join(output, 'assets'), { recursive: true });
await Promise.all(documents.map(async ([name, contents]) => {
  const file = join(output, name);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}));
console.log(`Собрано страниц: ${pages.length}. Адрес: ${siteUrl.href}`);
