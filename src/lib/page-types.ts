/**
 * Une page = UN fichier de contenu (CONTRIBUTING-PAGES.md) : `src/content/guides/<id>.ts`, avec la
 * version française (`fr`) et la version anglaise (`en`) côte à côte. Routes, menus, pied de page,
 * sitemap, hreflang, schémas et liens internes lisent ces fichiers et rien d'autre.
 */
import type { Kit } from './kit';
import type { Lang } from './format';

export interface FAQ { q: string; a: string }
export interface MiniOpts { /** titre */ t?: string; /** champs montrés */ p?: string[]; /** valeurs par défaut */ d?: Record<string, number | string>; /** texte du lien */ c?: string }

export interface Helpers extends Kit {
  lang: Lang;
  /** Lien interne par id de page, dans la langue de la page. Id inconnu = test en échec. */
  a: (id: string, text: string) => string;
  /** Tableau ; les nombres sont formatés dans la langue, les chaînes insérées en HTML. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Lien vers une source de params-2026.json (clé), page française ou anglaise selon la langue. */
  src: (key: string, text?: string) => string;
  ext: (url: string, text: string) => string;
  box: (title: string, html: string) => string;
  /** Mini-simulateur bâti sur un calculateur de tool-specs.ts. */
  mini: (kind: string, opts?: MiniOpts) => string;
  /** Formats de la langue de la page : montant, taux, nombre, taux officiel, date. */
  m: (x: number) => string; p: (x: number, d?: number) => string; n: (x: number, d?: number) => string; r: (x: number) => string; day: (iso: string) => string;
  /** Formats propres au carburant : ¢/L, écart en ¢, dollars à deux décimales. */
  cpl: (x: number, d?: number) => string; cents: (x: number, d?: number) => string; usd: (x: number, d?: number) => string;
  /** Nom d'une ville dans la langue. */
  cn: (id: string) => string;
  /** Date d'un relevé en clair (« relevé du lundi 19 octobre 2026 », « moyenne de septembre 2026 »). */
  when: (f: import('./data').FuelData) => string;
}

export type Group = 'outils' | 'on' | 'qc' | 'ouest' | 'atl';

export interface LangPage {
  /** Segment d'URL, minuscules et tirets, sans accent. */
  slug: string;
  nav: string; card: string;
  /** 50 à 60 caractères, terme clé d'abord, année comprise (RECETTE §11). */
  title: string;
  /** 150 à 160 caractères, année comprise. */
  description: string;
  h1: string; intro: string;
  /** UN paragraphe de 120 mots ou plus : la réponse directe, chiffrée (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  body: (h: Helpers) => string;
}
export interface GuideDef {
  id: string; group: Group; order: number;
  /** Calculateur en tête : une clé de tool-specs.ts. */
  tool: string;
  toolArg?: Record<string, number | string>;
  related: string[];
  /** Clés de params-2026.json > sources. */
  sources: string[];
  /** Version française facultative : la page n'existe alors qu'en anglais (routes partielles). */
  fr?: LangPage; en: LangPage;
  /** Ville que décrit la page (pages de ville). */
  city?: string;
}
export const defineGuide = (p: GuideDef): GuideDef => p;
