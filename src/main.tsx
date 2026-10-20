import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { preloadRouteChunks } from './routeChunks'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// Production build ships prerendered markup inside #root (see
// scripts/generate-static-pages.mjs); dev serves an empty div.
if (container.hasChildNodes()) {
  // The prerendered HTML has the resolved route markup but no Suspense
  // boundary markers, so hydrateRoot can't reconcile a still-loading lazy()
  // route component — it would leave the DOM inert until first interaction.
  // Fetch this route's chunk(s) first so every lazy() resolves on the first
  // render and hydration actually completes. `.finally` so a failed fetch
  // still falls through to hydrate (no worse than before).
  preloadRouteChunks(window.location.pathname).finally(() => {
    hydrateRoot(container, app)
  })
} else {
  createRoot(container).render(app)
}
