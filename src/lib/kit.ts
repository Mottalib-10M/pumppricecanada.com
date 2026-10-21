/**
 * Trousse de rédaction (CONTRIBUTING-PAGES.md) : tout chiffre écrit dans une page vient d'ici, jamais tapé à la main.
 *   K.P                       params-2026.json (taxes, régulateurs, sources)
 *   K.city(id), K.fuelOf(id, f), K.headline(f), K.cityBreakdown(id, f, prix, date, l), K.perLitreTaxes(...)
 *   K.PRICED_IDS, K.CITY_IDS, K.PROVS, K.provName(p, l), K.salesRate(p), K.salesLabel(p, l), K.fuelSteps(p)
 *   K.TODAY, K.TOMORROW, K.SNAP (instantané complet), K.HIST (historique court des sources ouvertes)
 *   K.VEHICLES, K.vehicleL100(classe, f), K.EXCISE, K.exciseAt(steps, date, f)
 *   K.tool(kind, lang, args)  lance un simulateur de tool-specs.ts et rend sa carte de résultat
 *   K.fr / K.en               formats de la langue : m (montant), p (taux), n (nombre), r (taux officiel), day (date)
 */
import P from '../data/params-2026.json';
import HIST from '../data/snapshot-hist.json';
import * as D from './data';
import { exciseAt } from './engine/estimate';
import { runTool } from './tool-specs';
import { formatMoney, formatNumber, formatPercent, formatRate, displayDate, type Lang } from './format';

const fmt = (l: Lang) => ({
  m: (x: number) => `${x < -0.5 ? '-' : ''}${formatMoney(Math.abs(Math.round(x)), 0, l)}`,
  p: (x: number, d = 1) => formatPercent(x, d, l),
  n: (x: number, d = 0) => formatNumber(x, d, l),
  r: (x: number) => formatRate(x, l),
  day: (iso: string) => displayDate(iso, l === 'fr' ? 'fr-CA' : 'en-CA'),
});
export const KIT = {
  ...D, P, HIST: HIST as Record<string, Partial<Record<D.Fuel, Array<[string, number]>>>>, exciseAt,
  tool: runTool,
  fr: fmt('fr'), en: fmt('en'), fmt,
};
export type Kit = typeof KIT;
