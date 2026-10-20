import { Suspense, type ComponentType } from 'react';
import type { RouteSeo } from '../lib/seoConfig';
import PageSeo from './PageSeo';
import AdSlot from './AdSlot';

interface ToolPageProps {
  seo: RouteSeo;
  Component: ComponentType;
  Info?: ComponentType;
}

const ToolPage = ({ seo, Component, Info }: ToolPageProps) => (
  <>
    <PageSeo {...seo} />
    <header className="mb-6 md:mb-10">
      <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Module</p>
      <div className="flex items-center space-x-3">
        <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
        <h1 className="text-xl sm:text-2xl font-light text-slate-300 light:text-slate-700">
          {seo.h1 ?? seo.navLabel}
        </h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 light:text-slate-500">{seo.tagline}</p>
    </header>

    <section className="flex-1 flex items-start justify-center pt-4">
      <div className="w-full transform transition-all duration-500">
        <Suspense fallback={<div className="text-sm text-slate-500">Loading…</div>}>
          <Component />
          {Info && (
            <>
              <div className="max-w-3xl mt-8">
                <AdSlot minHeight={250} />
              </div>
              <Info />
            </>
          )}
        </Suspense>
      </div>
    </section>
  </>
);

export default ToolPage;
