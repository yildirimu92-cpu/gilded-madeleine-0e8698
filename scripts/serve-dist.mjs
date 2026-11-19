// Lokaler Server für dist/, der die Netlify-Header (netlify.toml + dist/_headers) und
// -Redirects nachbildet. Wird für `npm run preview` und die E2E-Tests verwendet.
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { parse } from 'smol-toml';

const root = resolve('dist');
const port = Number(process.env.PORT ?? 4173);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
};

/** Netlify-Pfadmuster: `*` als Platzhalter (Splat). */
function matches(pattern, path) {
  const rx = new RegExp(
    '^' +
      pattern
        .split('*')
        .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*') +
      '$',
  );
  return rx.test(path);
}

function parseHeadersFile(text) {
  const rules = [];
  let current;
  for (const line of text.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      current = { for: line.trim(), values: {} };
      rules.push(current);
    } else if (current) {
      const i = line.indexOf(':');
      current.values[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}

const config = parse(await readFile('netlify.toml', 'utf8'));
let fileRules = [];
try {
  fileRules = parseHeadersFile(await readFile(join(root, '_headers'), 'utf8'));
} catch {
  /* keine _headers-Datei */
}
const headerRules = [...(config.headers ?? []), ...fileRules];
const redirects = config.redirects ?? [];

function headersFor(path) {
  const out = {};
  for (const rule of headerRules) {
    if (!matches(rule.for, path)) continue;
    for (const [k, v] of Object.entries(rule.values)) {
      // Netlify kombiniert gleichnamige Header mehrerer Regeln.
      out[k] = out[k] ? `${out[k]}, ${v}` : v;
    }
  }
  return out;
}

async function resolveFile(path) {
  const target = normalize(join(root, decodeURIComponent(path)));
  if (!target.startsWith(root)) return null;
  try {
    const s = await stat(target);
    if (s.isFile()) return target;
    if (s.isDirectory()) {
      const index = join(target, 'index.html');
      if ((await stat(index)).isFile()) return index;
    }
  } catch {
    /* nicht gefunden */
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');

  const redirect = redirects.find((r) => r.from === pathname);
  if (redirect) {
    res.writeHead(redirect.status ?? 301, { Location: redirect.to, ...headersFor(pathname) });
    return res.end();
  }

  const file = await resolveFile(pathname);
  const status = file ? 200 : 404;
  const served = file ?? join(root, '404.html');
  res.writeHead(status, {
    'Content-Type': types[extname(served)] ?? 'application/octet-stream',
    ...headersFor(pathname),
  });
  createReadStream(served).pipe(res);
}).listen(port, () => {
  console.log(`dist/ mit Netlify-Headern auf http://localhost:${port}`);
});
