import { route, hasRoute, type Locale } from './routes';
import { GUIDES, guideById } from '../lib/pages';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  fr: { home: 'Prix de l’essence au Canada', method: 'Méthode', about: 'À propos', widget: 'Intégrer le simulateur', contact: 'Contact', editorial: 'Politique éditoriale', privacy: 'Confidentialité', terms: 'Mentions légales', cookies: 'Cookies' },
  en: { home: 'Gas prices in Canada', method: 'Method', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
export const GROUPS: Array<{ id: Group; label: Record<Locale, string> }> = [
  { id: 'outils', label: { fr: 'Demain, diesel, taxes', en: 'Tomorrow, diesel, taxes' } },
  { id: 'on', label: { fr: 'Ontario', en: 'Ontario' } },
  { id: 'qc', label: { fr: 'Québec', en: 'Quebec' } },
  { id: 'ouest', label: { fr: 'Ouest', en: 'West' } },
  { id: 'atl', label: { fr: 'Atlantique', en: 'Atlantic' } },
];
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? guideById(id)?.[lang]?.nav ?? guideById(id)?.en.nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
/** Pages d'un groupe qui existent dans la langue (le français ne couvre qu'une partie des villes). */
export const inGroup = (g: Group, lang: Locale): NavLink[] => GUIDES.filter((p) => p.group === g && hasRoute(p.id, lang)).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: g.label[lang], links: inGroup(g.id, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  { label: GROUPS[0].label[lang], links: inGroup('outils', lang) },
  { label: lang === 'fr' ? 'Ce site' : 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** Toutes les villes, à un clic de toute page (RECETTE §18.2). */
export const popularLinks = (lang: Locale): NavLink[] => (['on', 'qc', 'ouest', 'atl'] as Group[]).flatMap((g) => inGroup(g, lang));
