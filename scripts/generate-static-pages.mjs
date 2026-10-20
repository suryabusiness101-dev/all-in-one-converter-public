// Postbuild step: duplicates dist/index.html into one static folder per tool
// route, swapping in that route's title/description/OG/canonical/JSON-LD, and
// prerenders each route's actual page markup (via the SSR bundle built from
// src/entry-server.tsx) into #root so crawlers get real content instead of an
// empty div. No server involved at request time — this only writes static
// files into dist/; dist-ssr is a build-time-only intermediate, deleted below.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');
const seoData = JSON.parse(readFileSync(join(root, 'src/lib/seoData.json'), 'utf-8'));
const faqData = JSON.parse(readFileSync(join(root, 'src/lib/faqData.json'), 'utf-8'));
const template = readFileSync(join(distDir, 'index.html'), 'utf-8');
const { render } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')));

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const replaceOrInsert = (html, regex, tag) =>
  regex.test(html) ? html.replace(regex, tag) : html.replace('</head>', `    ${tag}\n  </head>`);

function applySeo(html, seo) {
  const canonicalUrl = seo.path === '/' ? `${seoData.siteUrl}/` : `${seoData.siteUrl}${seo.path}/`;
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);

  let out = html;
  out = out.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${description}" />`
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${title}" />`
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${description}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${title}" />`
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${description}" />`
  );
  out = seo.jsonLd
    ? out.replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">${JSON.stringify(seo.jsonLd).replace(/<\/script/g, '<\\/script')}</script>`
      )
    : out.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  out = replaceOrInsert(
    out,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  out = replaceOrInsert(
    out,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  return out;
}

async function inlineAppHtml(html, path) {
  const appHtml = await render(path);
  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

const homeHtml = await inlineAppHtml(
  applySeo(template, seoData.home).replace(
    '</head>',
    `    <script type="application/ld+json">${JSON.stringify(faqJsonLd).replace(/<\/script/g, '<\\/script')}</script>\n  </head>`
  ),
  seoData.home.path
);
writeFileSync(join(distDir, 'index.html'), homeHtml);

const allRoutes = [...seoData.routes, ...seoData.longTailRoutes, ...seoData.legalRoutes];
for (const route of allRoutes) {
  const outDir = join(distDir, route.path.replace(/^\//, ''));
  mkdirSync(outDir, { recursive: true });
  const html = await inlineAppHtml(applySeo(template, route), route.path);
  writeFileSync(join(outDir, 'index.html'), html);
}

rmSync(ssrDir, { recursive: true, force: true });

console.log(`Generated ${allRoutes.length + 1} static SEO pages (prerendered) in dist/`);
