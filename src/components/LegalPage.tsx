import type { ReactNode } from 'react';
import type { RouteSeo } from '../lib/seoConfig';
import PageSeo from './PageSeo';

interface LegalPageProps {
  seo: RouteSeo;
  children: ReactNode;
}

const LegalPage = ({ seo, children }: LegalPageProps) => (
  <div className="w-full max-w-3xl">
    <PageSeo {...seo} />
    <h1 className="text-2xl sm:text-3xl font-light text-slate-100 light:text-slate-900 mb-6">
      {seo.navLabel}
    </h1>
    <div className="space-y-4 text-sm leading-relaxed text-slate-400 light:text-slate-600 [&_h2]:text-slate-200 [&_h2]:light:text-slate-800 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_a]:text-cyan-400 [&_a]:hover:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
      {children}
    </div>
  </div>
);

export default LegalPage;
