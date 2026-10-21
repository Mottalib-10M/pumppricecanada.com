/**
 * Accès typé aux données du site (CONTRIBUTING-DONNEES.md) : instantané des prix (snapshot.json, refait à chaque
 * build), villes, taxes (params-2026.json), consommation des véhicules (RNCan). Aucun chiffre n'est tapé ici :
 * tout vient de ces fichiers, eux-mêmes tirés des sources officielles par scripts/update-data.py.
 */
import SNAP from '../data/snapshot.json';
import CITIES from '../data/cities.json';
import P from '../data/params-2026.json';
import VEH from '../data/series/vehicles.json';
import { breakdown, exciseAt, fillCost, litresFor, type Fuel, type ExciseStep, type TaxLine } from './engine/estimate';
import { displayDate, formatNumber, formatMoney, formatPercent, type Lang } from './format';

export type { Fuel };
export const FUELS: Fuel[] = ['regular', 'premium', 'diesel'];
export const TODAY: string = SNAP.today;
export const TOMORROW: string = SNAP.tomorrow;

export interface Latest { value: number; date: string; kind: 'day' | 'week' | 'month'; src: string; key: string | string[] }
export interface Est { value: number; target: string; rackDelta: number; sigDelta: number; sigFrom: string | null; sigTo: string | null; taxDelta: number; rackNowLast: string | null; rackRef: number | null; rackNow: number | null }
export interface Bt { n: number; mae: number; maeNaive: number; p90: number; from: string; to: string; kind: 'day' | 'week' | 'month' }
export interface FuelData { latest: Latest; est: Est; bt: Bt | null; isMax: boolean; regChangesTomorrow: boolean | null; monthly: { date: string; value: number } | null }
export interface CityData { prov: string; zone: string | null; proxy: string | null; regulated: string | null; hub: string; name: { en: string; fr: string }; fuels: Partial<Record<Fuel, FuelData>> }

const C = SNAP.cities as unknown as Record<string, CityData>;
/** Ordre d'affichage : celui de cities.json (Ontario, Québec, Ouest, Atlantique). */
export const CITY_IDS: string[] = (CITIES.cities as Array<{ id: string }>).map((c) => c.id);
/** Villes qui ont au moins un prix officiel. */
export const PRICED_IDS = CITY_IDS.filter((id) => C[id]?.fuels.regular);
export const city = (id: string): CityData => { const c = C[id]; if (!c) throw new Error(`Unknown city ${id}`); return c; };
export const cityName = (id: string, l: Lang) => city(id).name[l];
const PROXY: Record<string, { en: string; fr: string }> = {
  'toronto-west': { en: 'Toronto West', fr: 'Toronto Ouest' }, 'toronto-east': { en: 'Toronto East', fr: 'Toronto Est' },
  'ontario-south': { en: 'the southern Ontario average', fr: 'la moyenne du sud de l’Ontario' }, vancouver: { en: 'Vancouver', fr: 'Vancouver' }, 'saint-john': { en: 'Saint John', fr: 'Saint John' },
};
/** Marché voisin dont une ville reprend la moyenne officielle. */
export const proxyName = (k: string, l: Lang) => PROXY[k]?.[l] ?? k;
export const fuelOf = (id: string, f: Fuel): FuelData | null => city(id).fuels[f] ?? null;

type Prov = keyof typeof P.taxes.provinces;
const PR = P.taxes.provinces as Record<string, (typeof P.taxes.provinces)['ON']>;
export const PROVS = Object.keys(PR) as Prov[];
export const provName = (p: string, l: Lang) => PR[p].name[l];
export const salesRate = (p: string) => PR[p].sales.rate;
export const salesLabel = (p: string, l: Lang) => PR[p].sales.label[l];
export const fuelSteps = (p: string): ExciseStep[] => PR[p].fuel.steps as ExciseStep[];
export const EXCISE = P.taxes.excise.steps as ExciseStep[];
const REG = P.taxes.regional as Record<string, { label: { en: string; fr: string }; regular: number; diesel: number; province: string }>;

/** Taxes au litre (¢) d'une ville à une date, avant taxe de vente : provinciale, régionale, accise fédérale. */
export function perLitreTaxes(id: string, fuel: Fuel, date: string, l: Lang): Array<TaxLine & { label: string }> {
  const c = city(id);
  const lines: Array<TaxLine & { label: string }> = [];
  lines.push({ id: 'prov', cpl: exciseAt(fuelSteps(c.prov), date, fuel), label: PR[c.prov].fuel.label[l] });
  if (c.zone && REG[c.zone]) lines.push({ id: 'zone', cpl: fuel === 'diesel' ? REG[c.zone].diesel : REG[c.zone].regular, label: REG[c.zone].label[l] });
  lines.push({ id: 'excise', cpl: exciseAt(EXCISE, date, fuel), label: P.taxes.excise.label[l] });
  return lines;
}
/** Décomposition d'un prix de pompe d'une ville (¢/L). */
export const cityBreakdown = (id: string, fuel: Fuel, price: number, date: string, l: Lang) => {
  const lines = perLitreTaxes(id, fuel, date, l);
  return { ...breakdown(price, salesRate(city(id).prov), lines), lines };
};

/** Prix « à montrer » : le relevé officiel du jour ou de la semaine ; pour une moyenne mensuelle, l’estimation (le mois est fini). */
export function headline(f: FuelData): { value: number; isEstimate: boolean } {
  return f.latest.kind === 'month' ? { value: f.est.value, isEstimate: true } : { value: f.latest.value, isEstimate: false };
}

// ------------------------------------------------------------------------------------------------ Véhicules
type VCat = keyof typeof VEH.categories;
export const VEHICLES = VEH.categories as Record<string, { gasoline?: { median: number; models: number }; diesel?: { median: number; models: number } }>;
export const VEHICLE_IDS = ['compact', 'midsize', 'fullsize', 'suv-small', 'suv-standard', 'minivan', 'pickup-small', 'pickup-standard'] as VCat[];
export const VEHICLE_NAMES: Record<string, { en: string; fr: string }> = {
  compact: { en: 'Compact car', fr: 'Voiture compacte' }, midsize: { en: 'Mid-size car', fr: 'Voiture intermédiaire' }, fullsize: { en: 'Full-size car', fr: 'Grande voiture' },
  'suv-small': { en: 'Small SUV', fr: 'Petit VUS' }, 'suv-standard': { en: 'Standard SUV', fr: 'VUS standard' }, minivan: { en: 'Minivan', fr: 'Fourgonnette' },
  'pickup-small': { en: 'Small pickup', fr: 'Petite camionnette' }, 'pickup-standard': { en: 'Full-size pickup', fr: 'Grande camionnette' },
};
export const vehicleL100 = (v: string, fuel: Fuel) => (fuel === 'diesel' ? VEHICLES[v]?.diesel?.median : undefined) ?? VEHICLES[v]?.gasoline?.median ?? 9;

// ------------------------------------------------------------------------------------------------ Formats
export const cpl = (x: number, l: Lang, d = 1) => `${formatNumber(x, d, l)}${l === 'fr' ? ' ¢/L' : '¢/L'}`;
export const cents = (x: number, l: Lang, d = 1) => `${x > 0.05 ? '+' : x < -0.05 ? '−' : ''}${formatNumber(Math.abs(x), d, l)}${l === 'fr' ? ' ¢' : '¢'}`;
export const dollars = (x: number, l: Lang, d = 2) => formatMoney(x, d, l);
export const pct = (x: number, l: Lang, d = 1) => formatPercent(x, d, l);
export const num = (x: number, l: Lang, d = 0) => formatNumber(x, d, l);
const tag = (l: Lang) => (l === 'fr' ? 'fr-CA' : 'en-CA');
export const day = (iso: string, l: Lang) => displayDate(iso, tag(l));
export const weekday = (iso: string, l: Lang) => new Date(`${iso}T12:00:00Z`).toLocaleDateString(tag(l), { weekday: 'long', timeZone: 'UTC' });
export const month = (ym: string, l: Lang) => new Date(`${ym}-15T12:00:00Z`).toLocaleDateString(tag(l), { month: 'long', year: 'numeric', timeZone: 'UTC' });
export const fuelName = (f: Fuel, l: Lang) => ({ regular: { en: 'regular gasoline', fr: 'essence ordinaire' }, premium: { en: 'premium gasoline', fr: 'essence super' }, diesel: { en: 'diesel', fr: 'diesel' } })[f][l];

/** Nom court de la source d'un relevé. */
export function srcName(f: FuelData, l: Lang): string {
  const s = f.latest.src;
  if (s === 'statcan') return l === 'fr' ? 'Statistique Canada' : 'Statistics Canada';
  if (s === 'ontario') return l === 'fr' ? 'Gouvernement de l’Ontario' : 'Government of Ontario';
  if (s === 'regie') return l === 'fr' ? 'Régie de l’énergie du Québec' : 'Régie de l’énergie du Québec';
  const r = (P.regulators as Record<string, { name: { en: string; fr: string } }>)[String(f.latest.key)];
  return r ? r.name[l] : s;
}
/** Clé de params-2026.json > sources qui documente le relevé. */
export function srcKey(f: FuelData): string {
  const s = f.latest.src;
  if (s === 'ontario') return 'ontario-retail';
  if (s === 'atlantic') return ({ 'ns-zone1': 'nseb', nb: 'nbeub', 'nl-zone1': 'pubnl' } as Record<string, string>)[String(f.latest.key)];
  return s;
}
/** « moyenne de septembre 2026 », « relevé du lundi 19 octobre 2026 », « 21 octobre 2026 ». */
export function when(f: FuelData, l: Lang): string {
  const { kind, date } = f.latest;
  if (kind === 'month') return l === 'fr' ? `moyenne de ${month(date, l)}` : `${month(date, l)} average`;
  if (f.isMax) return l === 'fr' ? `prix maximal en vigueur depuis le ${day(date, l)}` : `maximum price in force since ${day(date, l)}`;
  if (kind === 'week') return l === 'fr' ? `relevé du ${weekday(date, l)} ${day(date, l)}` : `survey of ${weekday(date, l)}, ${day(date, l)}`;
  return l === 'fr' ? `moyenne du ${day(date, l)}` : `average of ${day(date, l)}`;
}
/** Écart passé, en clair. */
export function btText(b: Bt | null, l: Lang): string {
  if (!b) return l === 'fr' ? 'pas encore assez de relevés pour mesurer l’écart' : 'not enough surveys yet to measure the error';
  const unit = { day: l === 'fr' ? 'jours' : 'days', week: l === 'fr' ? 'semaines' : 'weeks', month: l === 'fr' ? 'mois' : 'months' }[b.kind];
  return l === 'fr' ? `± ${num(b.mae, l, 1)} ¢ en moyenne sur ${b.n} ${unit} (« sans changement » : ± ${num(b.maeNaive, l, 1)} ¢)` : `±${num(b.mae, l, 1)}¢ on average over ${b.n} ${unit} ("no change" guess: ±${num(b.maeNaive, l, 1)}¢)`;
}

export { fillCost, litresFor, P, SNAP };
