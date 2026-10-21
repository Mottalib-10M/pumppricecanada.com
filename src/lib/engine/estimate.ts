/**
 * Moteur de l'estimation (CONTRIBUTING-DONNEES.md). Fonctions pures, sans import de données : la même source
 * sert au script `scripts/build-snapshot.ts` (Node, au build) et aux tests vitest.
 *
 * Estimation pour une date T = dernier prix officiel de la ville
 *   + (prix de gros récent − prix de gros de la période du relevé) × (1 + taxe de vente)
 *   + changements de taxe datés entre la date du relevé et T, taxe de vente comprise.
 * Le prix de gros « récent » est la moyenne des trois derniers jours publiés avant T ; celui « de la période »
 * est la moyenne des trois jours publiés avant le relevé (relevé du jour ou de la semaine) ou la moyenne du
 * mois (relevé mensuel). Un prix de gros plus ancien que le relevé ne déplace donc rien : l'estimation reste
 * le prix officiel, et la page le dit.
 */
export type Obs = [string, number];
export type Kind = 'day' | 'week' | 'month';

export interface Base { value: number; date: string; kind: Kind }
export interface ExciseStep { from: string; regular: number; diesel: number; premium?: number }
export type Fuel = 'regular' | 'premium' | 'diesel';

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
export const round1 = (x: number) => Math.round(x * 10) / 10;

/** Moyenne des `n` dernières observations strictement antérieures à `before` (date ISO), ou null. */
export function rackBefore(rack: Obs[], before: string, n = 3): { value: number; last: string } | null {
  const xs = rack.filter(([d]) => d < before).slice(-n);
  return xs.length ? { value: mean(xs.map((o) => o[1])), last: xs[xs.length - 1][0] } : null;
}

/** Moyenne d'un mois « AAAA-MM ». */
export function rackMonth(rack: Obs[], month: string): number | null {
  const xs = rack.filter(([d]) => d.startsWith(month)).map((o) => o[1]);
  return xs.length ? mean(xs) : null;
}

/** Date de référence d'un relevé : le jour lui-même, ou le 1er du mois suivant pour un relevé mensuel
 *  (la moyenne d'un mois est connue une fois le mois fini). */
export function baseDate(b: Base): string {
  if (b.kind !== 'month') return b.date;
  const [y, m] = b.date.split('-').map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
}

/** Taux de la taxe d'accise fédérale (¢/L) en vigueur à une date. */
export function exciseAt(steps: ExciseStep[], date: string, fuel: Fuel): number {
  let v = 0;
  for (const s of [...steps].sort((a, b) => a.from.localeCompare(b.from))) if (s.from <= date) v = fuel === 'diesel' ? s.diesel : (fuel === 'premium' ? s.premium ?? s.regular : s.regular);
  return v;
}

export interface Estimate {
  value: number; target: string; base: Base;
  /** Variation de gros retenue (¢/L, avant taxe de vente) et dates des prix de gros comparés. */
  rackDelta: number; rackRef: number | null; rackNow: number | null; rackNowLast: string | null;
  /** Variation du signal quotidien (¢/L avant taxes) entre `sigFrom` et `sigTo`, après la fin des prix de gros. */
  sigDelta: number; sigFrom: string | null; sigTo: string | null;
  /** Effet des changements de taxe datés, taxe de vente comprise (¢/L). */
  taxDelta: number;
}

/** Dernière observation d'une série à une date ou avant (≤), ou strictement avant (<). */
function lastAt(s: Obs[], date: string, strict = false): Obs | null {
  let r: Obs | null = null;
  for (const o of s) { if (strict ? o[0] < date : o[0] <= date) r = o; else break; }
  return r;
}
const monthEnd = (m: string) => { const [y, mo] = m.split('-').map(Number); return new Date(Date.UTC(y, mo, 0)).toISOString().slice(0, 10); };

/**
 * `signal` (facultatif) : série quotidienne de prix AVANT taxes publiée le jour même (relevé quotidien de la
 * Régie de l'énergie pour la région de Montréal, taxes retirées). Elle prend le relais des prix de gros, publiés
 * avec une semaine de retard : on lui demande seulement la variation entre la fin de ce que couvrent les prix de
 * gros (ou la date du relevé) et le dernier jour publié avant la date visée.
 */
export function estimate(base: Base, rack: Obs[], target: string, salesRate: number, excise: ExciseStep[], fuel: Fuel, signal: Obs[] = []): Estimate {
  const ref = base.kind === 'month' ? rackMonth(rack, base.date) : rackBefore(rack, base.date)?.value ?? null;
  const now = rackBefore(rack, target);
  let rackDelta = 0;
  // Un prix de gros plus ancien que la fin de la période de référence n'apporte rien de nouveau.
  const fresh = !!now && (base.kind === 'month' ? now.last >= baseDate(base) || now.last.startsWith(base.date) : now.last >= base.date);
  if (ref !== null && now && fresh) rackDelta = now.value - ref;
  // Le signal couvre la suite : depuis la fin des prix de gros retenus, ou depuis le relevé.
  const anchor = fresh && now ? now.last : base.kind === 'month' ? monthEnd(base.date) : base.date;
  let sigDelta = 0, sigFrom: string | null = null, sigTo: string | null = null;
  const a = signal.length ? lastAt(signal, anchor) : null, b = signal.length ? lastAt(signal, target, true) : null;
  // Le point de départ du signal doit tomber à quatre jours au plus du point d'ancrage (fins de semaine, jours fériés).
  const near = a && Date.parse(anchor) - Date.parse(a[0]) <= 4 * 864e5;
  if (a && b && near && b[0] > a[0]) { sigDelta = b[1] - a[1]; sigFrom = a[0]; sigTo = b[0]; }
  const from = base.kind === 'month' ? `${base.date}-15` : base.date;
  const taxDelta = (exciseAt(excise, target, fuel) - exciseAt(excise, from, fuel)) * (1 + salesRate);
  return {
    value: base.value + (rackDelta + sigDelta) * (1 + salesRate) + taxDelta, target, base,
    rackDelta, rackRef: ref, rackNow: now?.value ?? null, rackNowLast: now?.last ?? null, sigDelta, sigFrom, sigTo, taxDelta,
  };
}

export interface Backtest { n: number; mae: number; maeNaive: number; p90: number; from: string; to: string }
export interface BacktestOptions {
  /** Dates de changements de taxe non modélisés : les intervalles qui les contiennent sont écartés des deux mesures. */
  skip?: string[];
  /** Signal quotidien (voir `estimate`). */
  signal?: Obs[];
  /** Retard de publication des prix de gros, en jours : on ne donne à la méthode que ce qui était publié. */
  rackLagDays?: number;
}

/**
 * Écart constaté : on rejoue la méthode sur le passé. Pour chaque relevé r(k+1), on part de r(k), on lui ajoute
 * ce qui était connu la veille de r(k+1) (prix de gros publiés à ce moment, signal quotidien), et on compare au
 * relevé réel. `maeNaive` est l'écart d'une prévision « pas de changement » (r(k+1) = r(k)), pour juger ce que la
 * méthode apporte.
 */
export function backtest(series: Obs[], rack: Obs[], kind: Kind, salesRate: number, since: string, excise: ExciseStep[], fuel: Fuel, opts: BacktestOptions = {}): Backtest | null {
  const { skip = [], signal = [], rackLagDays = 0 } = opts;
  const maxGapDays = kind === 'month' ? 40 : kind === 'week' ? 8 : 4;
  const s = series.filter(([d]) => d >= since);
  const errs: number[] = [], naive: number[] = [];
  const days = (a: string, b: string) => (Date.parse(kind === 'month' ? `${b}-01` : b) - Date.parse(kind === 'month' ? `${a}-01` : a)) / 864e5;
  const shift = (iso: string, n: number) => new Date(Date.parse(`${iso}T12:00:00Z`) - n * 864e5).toISOString().slice(0, 10);
  for (let i = 1; i < s.length; i++) {
    const [d0, v0] = s[i - 1], [d1, v1] = s[i];
    if (days(d0, d1) > maxGapDays) continue;
    // Un changement de taxe que la méthode ne modélise pas (redevance carbone) fausserait l'écart : on saute.
    if (skip.some((e) => (kind === 'month' ? e.startsWith(d0) || e.startsWith(d1) : e > d0 && e <= d1))) continue;
    let est: number;
    if (kind === 'month') {
      const a = rackMonth(rack, d0), b = rackMonth(rack, d1);
      if (a === null || b === null) continue;
      const tax = (exciseAt(excise, `${d1}-15`, fuel) - exciseAt(excise, `${d0}-15`, fuel)) * (1 + salesRate);
      est = v0 + (b - a) * (1 + salesRate) + tax;
    } else {
      const known = rackLagDays ? rack.filter(([d]) => d < shift(d1, rackLagDays)) : rack;
      const e = estimate({ value: v0, date: d0, kind }, known, d1, salesRate, excise, fuel, signal);
      if (e.rackRef === null && !e.sigTo) continue;
      est = e.value;
    }
    errs.push(Math.abs(est - v1)); naive.push(Math.abs(v0 - v1));
  }
  if (errs.length < 8) return null;
  const sorted = [...errs].sort((a, b) => a - b);
  return { n: errs.length, mae: round1(mean(errs)), maeNaive: round1(mean(naive)), p90: round1(sorted[Math.floor(sorted.length * 0.9)]), from: s[0][0], to: s[s.length - 1][0] };
}

/** Moyenne de plusieurs séries aux dates communes (ex. Toronto Ouest et Est). */
export function averageSeries(list: Obs[][]): Obs[] {
  if (list.length === 1) return list[0];
  const maps = list.map((s) => new Map(s));
  return list[0].filter(([d]) => maps.every((m) => m.has(d))).map(([d]) => [d, round1(mean(maps.map((m) => m.get(d)!)))] as Obs);
}

// ---------------------------------------------------------------------------------------------- Taxes
export interface TaxLine { id: string; cpl: number }
export interface Breakdown { price: number; salesTax: number; fuelTaxes: TaxLine[]; product: number; taxShare: number }

/**
 * Décomposition d'un prix à la pompe (¢/L, taxes comprises). Les taxes de vente (TPS, TVH, TVQ) s'appliquent sur
 * le prix qui comprend déjà les taxes sur les carburants : prix avant taxe de vente = prix / (1 + taux).
 * `product` = ce qui reste : produit raffiné, transport, marges de gros et de détail.
 */
export function breakdown(price: number, salesRate: number, fuelTaxes: TaxLine[]): Breakdown {
  const pre = price / (1 + salesRate);
  const salesTax = price - pre;
  const sum = fuelTaxes.reduce((a, t) => a + t.cpl, 0);
  const product = pre - sum;
  return { price, salesTax, fuelTaxes, product, taxShare: price > 0 ? (salesTax + sum) / price : 0 };
}

// ---------------------------------------------------------------------------------------------- Plein et budget
/** Coût d'un plein en dollars : litres × prix (¢/L) / 100. */
export const fillCost = (litres: number, cpl: number) => (Math.max(0, litres) * Math.max(0, cpl)) / 100;
/** Litres consommés sur une distance (km) à une consommation (L/100 km). */
export const litresFor = (km: number, l100: number) => (Math.max(0, km) * Math.max(0, l100)) / 100;
/** Coût annuel en dollars. */
export const yearlyCost = (km: number, l100: number, cpl: number) => fillCost(litresFor(km, l100), cpl);

/** Additionne des calendriers de taxes au litre (accise fédérale + taxe provinciale) en un seul calendrier. */
export function combineSteps(...lists: ExciseStep[][]): ExciseStep[] {
  const dates = [...new Set(lists.flat().map((s) => s.from))].sort();
  return dates.map((from) => ({
    from,
    regular: lists.reduce((a, l) => a + exciseAt(l, from, 'regular'), 0),
    diesel: lists.reduce((a, l) => a + exciseAt(l, from, 'diesel'), 0),
    premium: lists.reduce((a, l) => a + exciseAt(l, from, 'premium'), 0),
  }));
}
