import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import { legalRoutesSeo } from '../lib/seoConfig';

const seo = legalRoutesSeo.find((r) => r.path === '/about')!;

const About = () => (
  <LegalPage seo={seo}>
    <p>
      ConvertGrove is a free toolkit of everyday conversion utilities — Base64
      encode/decode, unit conversion, number base conversion, timezone &amp; epoch conversion,
      and color code conversion — built to run entirely in your browser.
    </p>
    <p>
      Every tool computes its result with plain JavaScript on your device. Nothing you type or
      upload is sent to a server for processing, so there's no upload wait and nothing to worry
      about leaving your machine.
    </p>
    <h2>Why we built this</h2>
    <p>
      Most conversion tools online are cluttered, slow, or split across a dozen different sites.
      We wanted one clean, fast place for the conversions people reach for daily, without an
      account, a paywall, or a bloated interface.
    </p>
    <h2>Contact</h2>
    <p>
      Found a bug, have a feature request, or want a new converter added? See the{' '}
      <Link to="/contact">contact page</Link> for how to reach out.
    </p>
  </LegalPage>
);

export default About;
