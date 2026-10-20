import LegalPage from './LegalPage';
import { legalRoutesSeo } from '../lib/seoConfig';

const seo = legalRoutesSeo.find((r) => r.path === '/contact')!;

const Contact = () => (
  <LegalPage seo={seo}>
    <p>
      ConvertGrove is a small, independently run toolkit — there's no support team behind it, just
      one person who built and maintains it. That said, real reports and requests do get read and
      acted on.
    </p>
    <h2>What to write in about</h2>
    <ul>
      <li>A conversion that produces a wrong or unexpected result</li>
      <li>A bug in the interface — something that doesn't work, or breaks on a specific browser</li>
      <li>A converter you'd like added, or a unit/category missing from an existing one</li>
      <li>Privacy, legal, or copyright concerns</li>
    </ul>
    <p>
      For a bug report, include what you typed in, what you expected, and what you got instead —
      that's usually enough to reproduce it without back-and-forth.
    </p>
    <h2>Email</h2>
    <p>
      <a href="mailto:contact@convertgrove.com">contact@convertgrove.com</a>. This is the only
      contact channel right now — no live chat, no phone line. Replies aren't instant, but every
      message gets read.
    </p>
  </LegalPage>
);

export default Contact;
