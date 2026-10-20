/** One place for every code-split route component's dynamic import, so
 *  App.tsx's `lazy()` wrappers and main.tsx's pre-hydration preload use the
 *  exact same module specifier — Vite then maps both to a single chunk.
 *
 *  Why main.tsx preloads at all: scripts/generate-static-pages.mjs bakes the
 *  fully-resolved tool markup into each page but *no* Suspense boundary
 *  markers (that's what renderToPipeableStream's `onAllReady` output looks
 *  like). hydrateRoot then reaches a `lazy()` route component whose chunk
 *  isn't loaded, suspends — and with no marker to reconcile against, leaves
 *  the server-rendered DOM in place, un-hydrated and inert, until the
 *  visitor interacts. Fetching the current route's chunk *before*
 *  hydrateRoot lets every `lazy()` on that route resolve synchronously on
 *  the first render, so hydration completes on load. */

export const routeImporters = {
  Base64Converter: () => import('./components/Base64Converter'),
  SmartUnitConverter: () => import('./components/SmartUnitConverter'),
  BaseConverter: () => import('./components/BaseConverter'),
  TimezoneEpochConverter: () => import('./components/TimezoneEpochConverter'),
  ColorHarmonizer: () => import('./components/ColorHarmonizer'),
  About: () => import('./components/About'),
  PrivacyPolicy: () => import('./components/PrivacyPolicy'),
  TermsOfService: () => import('./components/TermsOfService'),
  Contact: () => import('./components/Contact'),
  Base64Info: () => import('./components/Base64Info'),
  UnitConverterInfo: () => import('./components/UnitConverterInfo'),
  BaseConverterInfo: () => import('./components/BaseConverterInfo'),
  TimezoneEpochInfo: () => import('./components/TimezoneEpochInfo'),
  ColorConverterInfo: () => import('./components/ColorConverterInfo'),
  Base64ToFile: () => import('./components/Base64ToFile'),
  Base64ToFileInfo: () => import('./components/Base64ToFileInfo'),
  HexBinaryBitmaskInfo: () => import('./components/HexBinaryBitmaskInfo'),
};

/** Chunks each route renders (tool component + its on-page Info component, or
 *  a single legal page). Paths match seoData.json / App.tsx exactly. */
const chunksByPath: Record<string, Array<keyof typeof routeImporters>> = {
  '/base64-encoder-decoder': ['Base64Converter', 'Base64Info'],
  '/unit-converter': ['SmartUnitConverter', 'UnitConverterInfo'],
  '/base-converter': ['BaseConverter', 'BaseConverterInfo'],
  '/timezone-epoch-converter': ['TimezoneEpochConverter', 'TimezoneEpochInfo'],
  '/color-converter': ['ColorHarmonizer', 'ColorConverterInfo'],
  '/base64-to-file': ['Base64ToFile', 'Base64ToFileInfo'],
  '/hex-to-binary-bitmask': ['BaseConverter', 'HexBinaryBitmaskInfo'],
  '/about': ['About'],
  '/privacy-policy': ['PrivacyPolicy'],
  '/terms-of-service': ['TermsOfService'],
  '/contact': ['Contact'],
};

/** Fetch the JS chunk(s) for `pathname` (trailing slash tolerated). Resolves
 *  once they're all loaded — or immediately for routes with no code-split
 *  component (`/`, unknown paths). A failed fetch resolves too, so hydration
 *  is never blocked by it. */
export function preloadRouteChunks(pathname: string): Promise<unknown> {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const keys = chunksByPath[path] ?? [];
  return Promise.all(keys.map((key) => routeImporters[key]().catch(() => undefined)));
}
