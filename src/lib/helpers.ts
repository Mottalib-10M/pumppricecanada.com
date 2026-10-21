/** Outils d'écriture (`Helpers`) passés au corps de chaque page, dans sa langue. */
import { route, ROUTES } from '../i18n/routes';
import type { Helpers, MiniOpts } from './page-types';
import { formatNumber, type Lang } from './format';
import { KIT } from './kit';
import P from '../data/params-2026.json';
import { PLANNED_IDS } from './planned';

const esc = (s: string | number) => String(s).replace(/&(?!(?:[a-z]+|#\d+);)/g, '&amp;').replace(/</g, '&lt;');
type Src = { url: string; url_en?: string; label: { fr: string; en: string } };
const RAW = (P as unknown as { sources: Record<string, Src> }).sources;
export const SOURCES = (lang: Lang): Record<string, { url: string; label: string }> =>
  Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, { url: lang === 'en' ? v.url_en ?? v.url : v.url, label: v.label[lang] }]));
export const sourceList = (keys: string[], lang: Lang) => { const S = SOURCES(lang); return keys.map((k) => ({ name: S[k].label, url: S[k].url })); };
export function table(headers: string[], rows: Array<Array<string | number>>, caption?: string, align: Array<'l' | 'r'> = [], lang: Lang = 'fr') {
  const al = (i: number) => (align[i] === 'r' ? 'text-right' : 'text-left');
  return `<div class="not-prose my-6 overflow-x-auto"><table class="journal w-full text-sm">${caption ? `<caption class="mb-2 text-left text-sm text-navy-700">${caption}</caption>` : ''}<thead><tr>${headers.map((h, i) => `<th scope="col" class="px-3 py-2 font-semibold text-navy-900 ${al(i)}">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="tabular-nums border-b border-navy-100 px-3 py-2 text-navy-800 ${al(i)}">${typeof c === 'number' ? esc(formatNumber(c, 0, lang)) : c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
export const ext = (url: string, text: string) => `<a href="${url}" target="_blank" rel="nofollow noopener noreferrer">${text}</a>`;
export function link(id: string, text: string, lang: Lang) {
  if (!ROUTES.some((r) => r.id === id)) { if (process.env.VITEST && !PLANNED_IDS.has(id)) throw new Error(`Unknown page id in link: ${id}`); return text; }
  return `<a href="${route(id, lang)}">${text}</a>`;
}
export const box = (title: string, html: string) => `<aside class="boxnote not-prose"><p class="boxnote-title">${title}</p><div class="text-navy-800">${html}</div></aside>`;
export const mini = (kind: string, arg?: MiniOpts) => `<!--mini:${kind}${arg === undefined ? '' : `|${Buffer.from(JSON.stringify(arg)).toString('base64')}`}-->`;
export const srcLink = (key: string, lang: Lang, text?: string) => { const s = SOURCES(lang)[key]; if (!s) throw new Error(`Unknown source ${key}`); return ext(s.url, text ?? s.label); };
export function helpers(lang: Lang): Helpers {
  const f = KIT[lang];
  return {
    ...KIT, lang, a: (id, text) => link(id, text, lang),
    table: (hd, rows, cap, al) => table(hd, rows, cap, al, lang),
    src: (key, text) => srcLink(key, lang, text), ext, box, mini,
    m: f.m, p: f.p, n: f.n, r: f.r, day: f.day,
  };
}
