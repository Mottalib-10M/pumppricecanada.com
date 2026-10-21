/**
 * Tests de contenu (CONTRIBUTING-PAGES.md) : chaque fichier de src/content/guides, en français et en anglais.
 *   PAGE_FILES=droits-celi,prov-qc npx vitest run tests/pages.test.ts
 * Écrit .cache-raw/page-texts.json, lu par `python3 scripts/sim-pages.py` (même mesure que check-unique).
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { GUIDES } from '../src/lib/pages';
import { helpers, SOURCES } from '../src/lib/helpers';
import { ROUTES } from '../src/i18n/routes';
import { TOOL_KINDS } from '../src/lib/tool-specs';
import type { FAQ } from '../src/lib/page-types';
import { HOME } from '../src/content/home';
import { PLANNED_IDS } from '../src/lib/planned';

const BANNED_ALL = [/—/, /–/, /canadanetpay|myeicanada|mycanadabenefits/i];
const BANNED_EN = [/it'?s important to note/i, /dive into/i, /\bdelve/i, /whether you'?re/i, /navigate the/i, /\bMoreover\b/, /\bAdditionally\b/, /\bFurthermore\b/, /game.?changer/i, /\bunlock/i, /in today'?s world/i, /\bguaranteed\b(?![ -]income)/i, /\$ ?\d+(?:,\d{3})* ?\$/];
const BANNED_FR = [/il est important de noter/i, /\bplongeons\b/i, /\bn'hésitez pas\b/i, /\ben outre\b/i, /\bde plus,/i, /\bpar ailleurs\b/i, /\$\d/];
const words = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const text = (s: string) => s.replace(/<div class="not-prose my-6 overflow-x-auto">[\s\S]*?<\/table><\/div>/g, ' ').replace(/<!--mini:[^>]*-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const only = (process.env.PAGE_FILES ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const keep = (id: string) => !only.length || only.includes(id);

interface Item { id: string; lang: 'fr' | 'en'; title: string; description: string; intro: string; resume: string; body: string; faqs: FAQ[]; related: string[]; minBody: number }
const items: Item[] = GUIDES.flatMap((g) => (['fr', 'en'] as const).map((l) => ({ id: g.id, lang: l, title: g[l].title, description: g[l].description, intro: g[l].intro, resume: g[l].resume, body: g[l].body(helpers(l)), faqs: g[l].faqs, related: g.related, minBody: 520 })));

const allQ = new Map<string, string[]>();
for (const it of [...items, { id: 'home', lang: 'fr', faqs: HOME.fr.faqs } as Item, { id: 'home', lang: 'en', faqs: HOME.en.faqs } as Item]) for (const f of it.faqs) { const k = f.q.trim().toLowerCase(); allQ.set(k, [...(allQ.get(k) ?? []), `${it.id}/${it.lang}`]); }
const titles = new Map<string, number>(), descs = new Map<string, number>(), slugs = new Map<string, number>();
for (const it of items) { titles.set(it.title, (titles.get(it.title) ?? 0) + 1); descs.set(it.description, (descs.get(it.description) ?? 0) + 1); }
for (const g of GUIDES) for (const l of ['fr', 'en'] as const) slugs.set(`${l}/${g[l].slug}`, (slugs.get(`${l}/${g[l].slug}`) ?? 0) + 1);

describe('fichiers de contenu', () => {
  for (const x of items.filter((y) => keep(y.id))) {
    describe(`${x.id} (${x.lang})`, () => {
      it('titre 50-60, terme clé d’abord, année, unique', () => {
        expect(x.title.length, x.title).toBeGreaterThanOrEqual(50);
        expect(x.title.length, x.title).toBeLessThanOrEqual(60);
        expect(x.title).toMatch(/2026/);
        expect(x.title).not.toMatch(/^(How|What|When|Why|Is|Are|Do|Does|Can|Should|Calculator|Simulator|Canada|Canadian|Comment|Quel|Quelle|Quels|Pourquoi|Combien|Est-ce|Faut-il|Calcul|Calculateur|Simulateur|Canada)/);
        expect(titles.get(x.title)).toBe(1);
      });
      it('description 150-160, année, unique', () => {
        expect(x.description.length, x.description).toBeGreaterThanOrEqual(150);
        expect(x.description.length, x.description).toBeLessThanOrEqual(160);
        expect(x.description).toMatch(/2026/);
        expect(descs.get(x.description)).toBe(1);
      });
      it('résumé : un paragraphe de 120 mots ou plus', () => {
        expect(words(x.resume), x.resume).toBeGreaterThanOrEqual(120);
        expect(x.resume).not.toMatch(/\n\s*\n|<p>/);
      });
      it(`corps : au moins ${x.minBody} mots de prose, tableaux à part`, () => { expect(words(text(x.body))).toBeGreaterThanOrEqual(x.minBody); });
      it('aucune tournure interdite ni tiret long', () => {
        const res = [...BANNED_ALL, ...(x.lang === 'en' ? BANNED_EN : BANNED_FR)];
        for (const re of res) for (const part of [x.title, x.description, x.intro, x.resume, x.body, ...x.faqs.flatMap((f) => [f.q, f.a])]) expect(part, String(re)).not.toMatch(re);
      });
      it('FAQ : 3 à 5 questions, réponses de 40 à 90 mots, uniques sur le site', () => {
        expect(x.faqs.length).toBeGreaterThanOrEqual(3);
        expect(x.faqs.length).toBeLessThanOrEqual(5);
        for (const f of x.faqs) {
          expect(words(f.a), f.q).toBeGreaterThanOrEqual(40);
          expect(words(f.a), f.q).toBeLessThanOrEqual(90);
          expect(allQ.get(f.q.trim().toLowerCase()), f.q).toHaveLength(1);
        }
      });
      it('pages liées et minis existent', () => {
        for (const r of x.related) expect(ROUTES.some((y) => y.id === r) || PLANNED_IDS.has(r), r).toBe(true);
        for (const m of x.body.matchAll(/<!--mini:([A-Za-z0-9_]+)/g)) expect(TOOL_KINDS, m[1]).toContain(m[1]);
        expect(x.body.match(/<!--mini:/g)?.length ?? 0, 'au moins un mini-simulateur').toBeGreaterThanOrEqual(1);
        expect(x.body).not.toMatch(/undefined|NaN|\[object Object\]|\bnull\b|Infinity/);
        expect(x.resume + x.description + x.title + x.intro + JSON.stringify(x.faqs)).not.toMatch(/undefined|NaN|\bnull\b|Infinity/);
      });
    });
  }
  it('slugs uniques et sans accent', () => { for (const [k, n] of slugs) { expect(n, k).toBe(1); expect(k).toMatch(/^(fr|en)\/[a-z0-9-]+$/); } });
  it.skipIf(!!only.length)('chaque page prévue a son fichier', () => { for (const id of PLANNED_IDS) expect(ROUTES.some((x) => x.id === id), id).toBe(true); });
  it('sources des pages existantes', () => { const S = SOURCES('fr'); for (const g of GUIDES) for (const s of g.sources) expect(S[s], `${g.id}: ${s}`).toBeTruthy(); });
  it('accueil : snippets, 6 à 8 questions par langue', () => { for (const l of ['fr', 'en'] as const) {
    const x = HOME[l]; expect(x.title.length, x.title).toBeGreaterThanOrEqual(50); expect(x.title.length, x.title).toBeLessThanOrEqual(60); expect(x.description.length, x.description).toBeGreaterThanOrEqual(150); expect(x.description.length, x.description).toBeLessThanOrEqual(160); expect(words(x.resume)).toBeGreaterThanOrEqual(120); expect(HOME[l].faqs.length).toBeGreaterThanOrEqual(6); expect(HOME[l].faqs.length).toBeLessThanOrEqual(8); for (const f of HOME[l].faqs) { expect(words(f.a), f.q).toBeGreaterThanOrEqual(40); expect(words(f.a), f.q).toBeLessThanOrEqual(90); } } });
});

mkdirSync('.cache-raw', { recursive: true });
writeFileSync('.cache-raw/page-texts.json', JSON.stringify(Object.fromEntries(items.map((it) => [`${it.id}/${it.lang}`, { kind: it.lang, text: [it.intro, it.resume, text(it.body), ...it.faqs.flatMap((f) => [f.q, f.a])].join(' ') }]))));
