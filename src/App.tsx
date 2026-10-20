import { lazy, Suspense, type ComponentType } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import ToolPage from './components/ToolPage';
import { routeSeoList, longTailRoutesSeo } from './lib/seoConfig';
import { routeImporters } from './routeChunks';

const Base64Converter = lazy(routeImporters.Base64Converter);
const SmartUnitConverter = lazy(routeImporters.SmartUnitConverter);
const BaseConverter = lazy(routeImporters.BaseConverter);
const TimezoneEpochConverter = lazy(routeImporters.TimezoneEpochConverter);
const ColorHarmonizer = lazy(routeImporters.ColorHarmonizer);
const About = lazy(routeImporters.About);
const PrivacyPolicy = lazy(routeImporters.PrivacyPolicy);
const TermsOfService = lazy(routeImporters.TermsOfService);
const Contact = lazy(routeImporters.Contact);

const Base64Info = lazy(routeImporters.Base64Info);
const UnitConverterInfo = lazy(routeImporters.UnitConverterInfo);
const BaseConverterInfo = lazy(routeImporters.BaseConverterInfo);
const TimezoneEpochInfo = lazy(routeImporters.TimezoneEpochInfo);
const ColorConverterInfo = lazy(routeImporters.ColorConverterInfo);

const Base64ToFile = lazy(routeImporters.Base64ToFile);
const Base64ToFileInfo = lazy(routeImporters.Base64ToFileInfo);
const HexBinaryBitmaskInfo = lazy(routeImporters.HexBinaryBitmaskInfo);

const componentByPath: Record<string, ComponentType> = {
  '/base64-encoder-decoder': Base64Converter,
  '/unit-converter': SmartUnitConverter,
  '/base-converter': BaseConverter,
  '/timezone-epoch-converter': TimezoneEpochConverter,
  '/color-converter': ColorHarmonizer,
  '/base64-to-file': Base64ToFile,
  '/hex-to-binary-bitmask': BaseConverter,
};

const infoByPath: Record<string, ComponentType> = {
  '/base64-encoder-decoder': Base64Info,
  '/unit-converter': UnitConverterInfo,
  '/base-converter': BaseConverterInfo,
  '/timezone-epoch-converter': TimezoneEpochInfo,
  '/color-converter': ColorConverterInfo,
  '/base64-to-file': Base64ToFileInfo,
  '/hex-to-binary-bitmask': HexBinaryBitmaskInfo,
};

function App() {
  return (
    // Initial load never hits this fallback — main.tsx preloads the current
    // route's chunk before hydrateRoot, so every lazy() below resolves on
    // the first render. It's here for later client-side navigations: the
    // legal routes have no Suspense boundary of their own, and ToolPage's
    // inner one only covers the tool/info area, not a route switch.
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          {[...routeSeoList, ...longTailRoutesSeo].map((seo) => (
            <Route
              key={seo.path}
              path={seo.path}
              element={<ToolPage seo={seo} Component={componentByPath[seo.path]} Info={infoByPath[seo.path]} />}
            />
          ))}
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
