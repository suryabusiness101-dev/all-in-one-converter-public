import { StrictMode } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { Writable } from 'node:stream';
import App from './App';

// Build-time only: renders a route to a static HTML string so crawlers get
// real content in the initial response instead of an empty root div. Never
// runs at request time — see scripts/generate-static-pages.mjs.
export function render(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const collector = new Writable({
      write(chunk, _enc, callback) {
        html += chunk;
        callback();
      },
    });
    collector.on('finish', () => resolve(html));

    const { pipe, abort } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          pipe(collector);
        },
        onError: reject,
      }
    );

    setTimeout(() => abort(new Error(`Timed out prerendering ${url}`)), 10000);
  });
}
