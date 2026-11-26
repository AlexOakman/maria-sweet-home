import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { port, siteUrl } from './config.mjs';

const output = resolve('dist');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const server = createServer(async (request, response) => {
  let filename;
  let size;
  let status = 200;
  try {
    const { pathname } = new URL(request.url, siteUrl.origin);
    if (!pathname.startsWith(siteUrl.pathname)) throw new Error('Outside site');
    const path = decodeURIComponent(pathname.slice(siteUrl.pathname.length));
    filename = resolve(output, path, pathname.endsWith('/') ? 'index.html' : '');
    if (!filename.startsWith(output + sep)) throw new Error('Outside output');
    const info = await stat(filename);
    if (!info.isFile()) throw new Error('Not a file');
    size = info.size;
  } catch {
    status = 404;
    filename = resolve(output, '404.html');
    size = (await stat(filename)).size;
  }

  const headers = {
    'Content-Type': mime[extname(filename)] ?? 'application/octet-stream',
    'Content-Length': size,
    'Accept-Ranges': 'bytes',
  };
  const range = status === 200 && request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  let streamOptions;
  if (range) {
    const start = Number(range[1]);
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end) {
      response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    headers['Content-Length'] = end - start + 1;
    streamOptions = { start, end };
  }

  response.writeHead(status, headers);
  if (request.method === 'HEAD') response.end();
  else createReadStream(filename, streamOptions).pipe(response);
});

await stat(resolve(output, 'index.html')).catch(() => { throw new Error('Сначала выполни npm run build.'); });
server.listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}${siteUrl.pathname}`));
