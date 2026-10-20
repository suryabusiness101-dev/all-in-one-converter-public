import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import { legalRoutesSeo } from '../lib/seoConfig';

const seo = legalRoutesSeo.find((r) => r.path === '/terms-of-service')!;

const TermsOfService = () => (
  <LegalPage seo={seo}>
    <p>Last updated: July 11, 2026</p>

    <h2>Use of the service</h2>
    <p>
      ConvertGrove is provided free of charge, with no account or sign-up required. You
      may use it for personal or commercial purposes, provided you don't attempt to disrupt,
      reverse-engineer for malicious purposes, or abuse the service.
    </p>

    <h2>No warranty on results</h2>
    <p>
      Conversions are computed with standard formulas and constants, but we make no guarantee of
      absolute accuracy or fitness for any particular purpose. Don't rely on this site as the sole
      source of truth for financial, medical, legal, engineering, or other decisions where an
      error could cause harm — always verify critical values independently.
    </p>

    <h2>Advertising</h2>
    <p>
      This site may display third-party advertisements to support free hosting and development.
      We are not responsible for the content of ads served by third-party networks.
    </p>

    <h2>Limitation of liability</h2>
    <p>
      The service is provided "as is" without warranties of any kind. To the maximum extent
      permitted by law, we are not liable for any damages arising from use of, or inability to
      use, this site.
    </p>

    <h2>Changes to these terms</h2>
    <p>
      We may update these terms from time to time. Continued use of the site after changes are
      posted constitutes acceptance of the updated terms.
    </p>

    <h2>Contact</h2>
    <p>
      Questions about these terms can be sent via the <Link to="/contact">contact page</Link>.
    </p>
  </LegalPage>
);

export default TermsOfService;
