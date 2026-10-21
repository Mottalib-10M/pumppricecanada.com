import { makeRouter, type RouteDef } from './routes-core';
import { GUIDES } from '../lib/pages';
/** Anglais d'abord (la plupart des recherches), français pour le Québec et les francophones : pages traduites
 *  seulement là où la recherche existe en français (routes partielles, hreflang limité aux paires réelles). */
export const LOCALES = ['en', 'fr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
const R = (id: string, fr: string, en: string, noindex = false) => ({ id, paths: { fr: `/fr/${fr}/`, en: `/en/${en}/` }, ...(noindex ? { noindex } : {}) });
const CORE: RouteDef<Locale>[] = [
  { id: 'home', paths: { fr: '/fr/', en: '/en/' } },
  R('method', 'methode', 'method'),
  R('about', 'a-propos', 'about'),
  R('widget', 'widget', 'widget', true),
  R('contact', 'contact', 'contact', true),
  R('editorial', 'politique-editoriale', 'editorial-policy', true),
  R('privacy', 'confidentialite', 'privacy', true),
  R('terms', 'mentions-legales', 'legal-notice', true),
  R('cookies', 'cookies', 'cookies', true),
];
const G = (g: (typeof GUIDES)[number]): RouteDef<Locale> => ({ id: g.id, paths: { en: `/en/${g.en.slug}/`, ...(g.fr ? { fr: `/fr/${g.fr.slug}/` } : {}) } });
export const ROUTES: RouteDef<Locale>[] = [CORE[0], ...GUIDES.map(G), ...CORE.slice(1)];
export const { NOINDEX_PATHS, route, hasRoute, altPaths } = makeRouter(LOCALES, ROUTES);
