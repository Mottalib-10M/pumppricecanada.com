/** Formatage localisé, une locale par langue de page (RECETTE §4 : « 7 000 $ » en français,
 *  « $7,000 » en anglais). Chaque fonction prend la langue ; défaut : français, langue principale. */
import { LANG_TAGS, CURRENCY } from '../data/site-config';

export type Lang = 'fr' | 'en';
const cache = new Map<string, Intl.NumberFormat>();
function nf(lang: Lang, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const k = lang + JSON.stringify(opts);
  if (!cache.has(k)) cache.set(k, new Intl.NumberFormat(LANG_TAGS[lang] ?? 'fr-CA', opts));
  return cache.get(k)!;
}
export function formatMoney(value: number, decimals = 0, lang: Lang = 'fr'): string {
  const v = Math.abs(value) < 0.5 && decimals === 0 ? 0 : value;
  return nf(lang, { style: 'currency', currency: CURRENCY, currencyDisplay: 'narrowSymbol', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}
export function formatNumber(value: number, decimals = 0, lang: Lang = 'fr'): string {
  return nf(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}
/** Nombre tiré des paramètres dans un texte : décimales utiles seulement (RECETTE §4.1). */
export function formatDecimal(value: number, max = 2, lang: Lang = 'fr'): string {
  return nf(lang, { maximumFractionDigits: max }).format(value);
}
/** Taux : espace insécable avant % dans les deux langues (RECETTE §7). */
export function formatPercent(value: number, decimals = 1, lang: Lang = 'fr'): string {
  return nf(lang, { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value).replace(/(\d)\s?%/, lang === 'en' ? '$1%' : '$1 %');
}
/** Taux officiel cité : ses décimales à lui (« 12,29 % », « 14 % », « 25,75 % »). */
export function formatRate(value: number, lang: Lang = 'fr'): string {
  return `${nf(lang, { maximumFractionDigits: 3 }).format(value * 100)}${lang === 'en' ? '' : ' '}%`;
}
export function parseLocaleNumber(input: string): number {
  const cleaned = input.replace(/[^\d.,-]/g, '');
  const lastComma = cleaned.lastIndexOf(','), lastDot = cleaned.lastIndexOf('.');
  let s = cleaned;
  if (/^-?\d{1,3}(,\d{3})+$/.test(cleaned)) s = cleaned.replace(/,/g, '');
  else if (lastComma > lastDot) s = cleaned.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(cleaned)) s = cleaned.replace(/\./g, '');
  else s = cleaned.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
/** Date en toutes lettres, dans la langue de la page ; « 1er » en français. */
export function displayDate(iso: string, langTag: string): string {
  const s = new Date(`${iso}T00:00:00Z`).toLocaleDateString(langTag, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  return langTag.startsWith('fr') ? s.replace(/^1 /, '1er ') : s;
}
