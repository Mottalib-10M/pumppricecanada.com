/**
 * Instantané des prix (CONTRIBUTING-DONNEES.md) : lit src/data/series/*.json, src/data/cities.json et
 * src/data/params-2026.json, applique le moteur (src/lib/engine/estimate.ts) et écrit src/data/snapshot.json,
 * le seul fichier de prix que lisent les pages et les simulateurs. Lancé par `npm run build` (Node 22.18+,
 * types effacés nativement) ; aucun accès réseau.
 *
 * Date de l'estimation : le lendemain du jour du build (heure de Toronto), sauf SNAPSHOT_DAY=AAAA-MM-JJ.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { estimate, backtest, averageSeries, combineSteps, exciseAt, round1, type Obs, type Kind, type Fuel, type ExciseStep } from '../src/lib/engine/estimate.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const J = (p: string) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

type SeriesFile = { latest: string; retrieved_at: string; url: string | string[]; series: Record<string, Record<string, Obs[]> | Obs[]> };
const FILES: Record<string, SeriesFile> = {
  statcan: J('src/data/series/statcan.json'),
  ontario: J('src/data/series/ontario-retail.json'),
  regie: J('src/data/series/regie-retail.json'),
  atlantic: J('src/data/series/atlantic.json'),
};
const RACK_ON = J('src/data/series/ontario-rack.json').series as Record<string, Record<string, Obs[]>>;
const RACK_QC = J('src/data/series/regie-rack.json').series as Record<string, Obs[]>;
const P = J('src/data/params-2026.json');
const CITIES = J('src/data/cities.json').cities as Array<Record<string, any>>;
const KIND: Record<string, Kind> = { statcan: 'month', ontario: 'week', regie: 'day', atlantic: 'week' };
/** Sources dont la licence permet d'afficher l'historique ; pour les autres, seul le dernier chiffre daté est repris. */
const OPEN = new Set(['statcan', 'ontario']);
const FUELS: Fuel[] = ['regular', 'premium', 'diesel'];
const EXCISE: ExciseStep[] = P.taxes.excise.steps;
const EVENTS: string[] = P.taxes.events;
/** Taxes au litre datées d'une province : accise fédérale + taxe provinciale sur les carburants. */
const stepsOf = (prov: string): ExciseStep[] => combineSteps(EXCISE, P.taxes.provinces[prov].fuel.steps);

/**
 * Signal quotidien : relevé de la Régie de l'énergie pour la région de Montréal (publié chaque matin), dont on retire
 * TPS + TVQ, la taxe québécoise, la taxe de l'ARTM et l'accise fédérale du jour, pour ne garder que la part « marché ».
 * Il sert aux villes de l'Est (Ontario, Québec, Atlantique), dont les prix de gros suivent le même marché (port de
 * New York) ; il n'est jamais affiché tel quel. Essence seulement : le diesel n'a pas de relevé quotidien ouvert.
 */
const QC = P.taxes.provinces.QC;
const QC_STEPS = stepsOf('QC');
const SIGNAL: Obs[] = ((FILES.regie.series.montreal as Obs[]) ?? []).map(([d, v]) => [d, round1(v / (1 + QC.sales.rate) - exciseAt(QC_STEPS, d, 'regular') - P.taxes.regional['qc-cmm'].regular)] as Obs);
const EAST = new Set(['ON', 'QC', 'NS', 'NB', 'NL', 'PE']);

const torontoDay = (d = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const TODAY = process.env.SNAPSHOT_DAY ?? torontoDay();
const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);
const TOMORROW = addDays(TODAY, 1);

function seriesOf(src: string, key: string | string[], fuel: Fuel): Obs[] | null {
  const f = FILES[src];
  const one = (k: string): Obs[] | null => {
    const s = f.series[k] as any;
    if (!s) return null;
    if (src === 'regie') return fuel === 'regular' ? (s as Obs[]) : null; // la Régie publie l'essence ordinaire au quotidien
    return (s[fuel] as Obs[] | undefined) ?? null;
  };
  const keys = Array.isArray(key) ? key : [key];
  const list = keys.map(one);
  if (list.some((x) => !x || !x.length)) return null;
  return averageSeries(list as Obs[][]);
}

function rackOf(hub: string, fuel: Fuel): Obs[] {
  if (hub === 'montreal') return RACK_QC[fuel] ?? [];
  const h = RACK_ON[hub];
  return (h?.[fuel === 'premium' ? 'regular' : fuel] ?? []) as Obs[];
}

/** Taux de la taxe de vente qui s'applique au litre (TPS, TVH, ou TPS + TVQ). */
const salesRate = (prov: string): number => P.taxes.provinces[prov].sales.rate;

/** Clé de fraîcheur : un jour vaut mieux qu'une semaine, qui vaut mieux qu'un mois, à date égale. */
const freshness = (date: string, kind: Kind) => (kind === 'month' ? `${date}-28` : date);

const out: Record<string, any> = {};
for (const c of CITIES) {
  const fuels: Record<string, any> = {};
  for (const fuel of FUELS) {
    const cands = (c[fuel] ?? []) as Array<{ src: string; key: string | string[] }>;
    let best: any = null;
    for (const cand of cands) {
      const s = seriesOf(cand.src, cand.key, fuel);
      if (!s?.length) continue;
      const [date, value] = s[s.length - 1];
      const kind = KIND[cand.src];
      const item = { src: cand.src, key: cand.key, kind, date, value, series: s };
      if (!best || freshness(date, kind) > freshness(best.date, best.kind)) best = item;
    }
    if (!best) continue;
    const rack = rackOf(c.hub, fuel);
    const rate = salesRate(c.prov);
    const steps = stepsOf(c.prov);
    const signal = EAST.has(c.prov) && fuel !== 'diesel' ? SIGNAL : [];
    // Prix maximal réglementé : il ne bouge que les jours où le régulateur le refixe ; les autres jours, seule une
    // taxe datée peut le déplacer.
    const reg = best.src === 'atlantic' ? P.regulators[best.key as string] : null;
    const changes = !reg || reg.changeDays.includes(new Date(`${TOMORROW}T12:00:00Z`).getUTCDay());
    const e = estimate({ value: best.value, date: best.date, kind: best.kind }, changes ? rack : [], TOMORROW, rate, steps, fuel, changes ? signal : []);
    const since = best.kind === 'month' ? '2023-09' : best.kind === 'week' ? '2024-01-01' : '2026-01-01';
    // Prix de gros publiés avec une semaine de retard : le calcul de l'écart ne les donne qu'avec ce retard.
    const bt = backtest(best.series, rack, best.kind, rate, since, steps, fuel, { skip: EVENTS, signal, rackLagDays: 7 });
    const hist = OPEN.has(best.src) ? best.series.slice(-13).map(([d, v]: Obs) => [d, v]) : [];
    // Repère mensuel officiel (Statistique Canada) quand la source la plus fraîche est une autre.
    const sc = cands.find((x) => x.src === 'statcan');
    const scs = sc && best.src !== 'statcan' ? seriesOf('statcan', sc.key, fuel) : null;
    // Sans écart mesurable sur la source du jour (relevés trop récents), on publie celui de la série mensuelle.
    const btMonthly = !bt && scs?.length ? backtest(scs, rack, 'month', rate, '2023-09', steps, fuel, { skip: EVENTS }) : null;
    fuels[fuel] = {
      latest: { value: best.value, date: best.date, kind: best.kind, src: best.src, key: best.key },
      est: { value: round1(e.value), target: TOMORROW, rackDelta: round1(e.rackDelta), sigDelta: round1(e.sigDelta), sigFrom: e.sigFrom, sigTo: e.sigTo, taxDelta: round1(e.taxDelta), rackNowLast: e.rackNowLast, rackRef: e.rackRef === null ? null : round1(e.rackRef), rackNow: e.rackNow === null ? null : round1(e.rackNow) },
      bt: bt ? { ...bt, kind: best.kind } : btMonthly ? { ...btMonthly, kind: 'month' } : null,
      isMax: best.src === 'atlantic',
      regChangesTomorrow: reg ? changes : null,
      hist,
      monthly: scs?.length ? { date: scs[scs.length - 1][0], value: scs[scs.length - 1][1] } : null,
    };
  }
  out[c.id] = { prov: c.prov, zone: c.zone ?? null, proxy: c.proxy ?? null, regulated: c.regulated ?? null, hub: c.hub, name: c.name, fuels };
}

// Repère national et dernières dates de chaque source.
const nat = (FILES.statcan.series.canada as Record<string, Obs[]>).regular;
const hubLast = (hub: string, fuel: Fuel) => { const r = rackOf(hub, fuel); return r.length ? { date: r[r.length - 1][0], value: r[r.length - 1][1] } : null; };
const snapshot = {
  _lisezmoi: 'Généré par scripts/build-snapshot.ts à chaque build : ne pas modifier à la main.',
  today: TODAY, tomorrow: TOMORROW,
  sources: Object.fromEntries(Object.entries(FILES).map(([k, f]) => [k, { latest: f.latest, retrieved_at: f.retrieved_at }])),
  signal: SIGNAL.length ? { date: SIGNAL[SIGNAL.length - 1][0] } : null,
  racks: { toronto: hubLast('toronto', 'regular'), edmonton: hubLast('edmonton', 'regular'), 'thunder-bay': hubLast('thunder-bay', 'regular'), montreal: hubLast('montreal', 'regular'), torontoDiesel: hubLast('toronto', 'diesel'), edmontonDiesel: hubLast('edmonton', 'diesel'), montrealDiesel: hubLast('montreal', 'diesel') },
  national: { date: nat[nat.length - 1][0], value: nat[nat.length - 1][1], prev: nat[nat.length - 13] ?? null },
  cities: out,
};
writeFileSync(join(ROOT, 'src/data/snapshot.json'), JSON.stringify(snapshot, null, 1) + '\n');
const n = Object.values(out).filter((c: any) => c.fuels.regular).length;
console.log(`snapshot : ${n} villes avec un prix de l'essence ordinaire, estimation pour le ${TOMORROW}`);
