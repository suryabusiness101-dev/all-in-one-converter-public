# ConvertGrove

A set of free, fast converters for developers and everyday use. Everything runs in your browser, so nothing you type or upload is sent to a server.

**Live site:** https://convertgrove.com

## Tools

- **Base64 encoder/decoder**: text ↔ Base64, plus decoding Base64 back into a downloadable file
- **Unit converter**: 14 categories, including length, weight, temperature, speed, digital storage, area, volume, pressure and energy
- **Number base converter**: binary, decimal, octal and hex, with BigInt precision
- **Hex to binary for bitmasks**: read flags, permission bits, subnet masks and memory addresses
- **Epoch and timezone converter**: Unix timestamps ↔ human-readable dates in any IANA timezone
- **Color converter**: convert between HEX, RGB, HSL and CMYK

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for dev server and bundling
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Router](https://reactrouter.com) with lazy-loaded route chunks
- Build-time prerendering (`src/entry-server.tsx` + `scripts/generate-static-pages.mjs`), so every tool page ships as static, SEO-friendly HTML
- Hosted on [Cloudflare Workers](https://developers.cloudflare.com/workers/static-assets/) static assets, deployed with Wrangler

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # start the Vite dev server
npm run build      # type-check, build, prerender static pages into dist/
npm run preview    # serve the production build locally
npm run lint       # run ESLint
```

### Analytics

`index.html` includes a Google Analytics tag with the placeholder ID `G-XXXXXXXXXX`. Replace it with your own measurement ID, or remove the tag.

### Deploying

`npm run deploy` builds the site and runs `wrangler deploy`. You need your own Cloudflare account. Authenticate with `npx wrangler login` or set `CLOUDFLARE_API_TOKEN` in your environment, and change the `name` and `routes` in `wrangler.jsonc` to your own Worker and domain.

## Built with Claude Code

This project was built with [Claude Code](https://claude.com/claude-code).
