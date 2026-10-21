import { route, type Locale } from './routes';
import { GUIDES, guideById } from '../lib/pages';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  fr: { home: 'Bilan CELI, REER, CELIAPP', method: 'Méthode de calcul', about: 'À propos', widget: 'Intégrer un simulateur', contact: 'Contact', editorial: 'Politique éditoriale', privacy: 'Confidentialité', terms: 'Mentions légales', cookies: 'Cookies' },
  en: { home: 'TFSA, RRSP and FHSA check', method: 'How we calculate', about: 'About', widget: 'Embed a calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
export const GROUPS: Array<{ id: Group; label: Record<Locale, string> }> = [
  { id: 'celi', label: { fr: 'CELI', en: 'TFSA' } },
  { id: 'reer', label: { fr: 'REER', en: 'RRSP' } },
  { id: 'maison', label: { fr: 'CELIAPP, RAP, REEP', en: 'FHSA, HBP, LLP' } },
  { id: 'impot', label: { fr: 'Impôt et prestations', en: 'Tax and benefits' } },
  { id: 'prov', label: { fr: 'Par province', en: 'By province' } },
];
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? guideById(id)?.[lang].nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
export const inGroup = (g: Group, lang: Locale): NavLink[] => GUIDES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.filter((g) => g.id !== 'prov').map((g) => ({ label: g.label[lang], links: inGroup(g.id, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.filter((g) => g.id !== 'prov').map((g) => ({ label: g.label[lang], links: inGroup(g.id, lang) })).filter((c) => c.links.length),
  { label: lang === 'fr' ? 'Ce site' : 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** Les 13 pages par province, à un clic de toute page (RECETTE §18.2). */
export const popularLinks = (lang: Locale): NavLink[] => inGroup('prov', lang);
