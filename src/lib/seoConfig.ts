import seoData from './seoData.json';

export interface RouteSeo {
  path: string;
  navLabel: string;
  tagline: string;
  h1?: string;
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
}

export const SITE_URL = seoData.siteUrl;
export const SITE_NAME = seoData.siteName;
export const homeSeo: RouteSeo = seoData.home;
export const routeSeoList: RouteSeo[] = seoData.routes;
export const longTailRoutesSeo: RouteSeo[] = seoData.longTailRoutes;
export const legalRoutesSeo: RouteSeo[] = seoData.legalRoutes;
export const allRoutesSeo: RouteSeo[] = [homeSeo, ...routeSeoList, ...longTailRoutesSeo, ...legalRoutesSeo];
