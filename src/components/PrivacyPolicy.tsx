import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import { legalRoutesSeo } from '../lib/seoConfig';

const seo = legalRoutesSeo.find((r) => r.path === '/privacy-policy')!;

const PrivacyPolicy = () => (
  <LegalPage seo={seo}>
    <p>Last updated: July 14, 2026</p>

    <h2>What we collect</h2>
    <p>
      Nothing you type, paste, or upload into any converter on this site is sent to a server.
      Every conversion (Base64, units, number bases, timezones, colors) runs entirely in your
      browser using client-side JavaScript. We do not store, log, or have any access to your
      conversion inputs or outputs.
    </p>

    <h2>Cookies &amp; advertising</h2>
    <p>
      This site may display ads served by third-party advertising networks, such as Google
      AdSense. These networks may use cookies or similar device identifiers to serve ads based on
      your prior visits to this or other websites. You can learn more about how Google uses this
      data at{' '}
      <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
        policies.google.com/technologies/ads
      </a>{' '}
      and opt out of personalized advertising at{' '}
      <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
        adssettings.google.com
      </a>
      .
    </p>

    <h2>Analytics</h2>
    <p>
      We use Google Analytics to understand how visitors use this site (e.g. which pages and
      tools are visited, and general traffic patterns). Google Analytics uses cookies and similar
      technologies to collect this data, which may include your IP address and device/browser
      information. This data is separate from and unrelated to anything you type, paste, or
      upload into a converter, which never leaves your browser. You can learn more about how
      Google collects and processes this data at{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
        policies.google.com/privacy
      </a>{' '}
      and opt out of Google Analytics tracking using the{' '}
      <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
        Google Analytics Opt-out Browser Add-on
      </a>
      .
    </p>

    <h2>Children's privacy</h2>
    <p>This site is not directed at children under 13 and does not knowingly collect data from them.</p>

    <h2>Changes to this policy</h2>
    <p>
      We may update this policy from time to time. Changes will be posted on this page with an
      updated date above.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about this policy can be sent via the <Link to="/contact">contact page</Link>.
    </p>
  </LegalPage>
);

export default PrivacyPolicy;
