import { describe, expect, it } from 'vitest';
import { estimate, backtest, breakdown, exciseAt, fillCost, yearlyCost, litresFor, rackBefore, rackMonth, averageSeries, baseDate, type Obs, type ExciseStep } from '../src/lib/engine/estimate';

// Calendrier de la taxe d'accise fédérale (Finance Canada, 2026-04-14 et projet de loi de septembre 2026).
const EXCISE: ExciseStep[] = [
  { from: '1995-02-28', regular: 10, diesel: 4 },
  { from: '2026-04-20', regular: 0, diesel: 0 },
  { from: '2027-02-01', regular: 5, diesel: 2 },
  { from: '2027-04-01', regular: 10, diesel: 4 },
];
const rack: Obs[] = [
  ['2026-10-05', 140], ['2026-10-06', 141], ['2026-10-07', 142],
  ['2026-10-08', 150], ['2026-10-09', 151], ['2026-10-12', 152],
];

describe('taxe d’accise', () => {
  it('suit le calendrier de Finance Canada', () => {
    expect(exciseAt(EXCISE, '2026-04-19', 'regular')).toBe(10);
    expect(exciseAt(EXCISE, '2026-04-20', 'regular')).toBe(0);
    expect(exciseAt(EXCISE, '2027-01-31', 'diesel')).toBe(0);
    expect(exciseAt(EXCISE, '2027-02-01', 'regular')).toBe(5);
    expect(exciseAt(EXCISE, '2027-02-01', 'diesel')).toBe(2);
    expect(exciseAt(EXCISE, '2027-04-01', 'diesel')).toBe(4);
  });
});

describe('estimation', () => {
  it('ajoute la variation de gros, taxe de vente comprise', () => {
    // Relevé du 2026-10-08 : prix de gros de référence = moyenne 05-07 = 141 ; récent avant le 13 : 150, 151, 152 = 151.
    const e = estimate({ value: 180, date: '2026-10-08', kind: 'week' }, rack, '2026-10-13', 0.13, EXCISE, 'regular');
    expect(e.rackRef).toBeCloseTo(141, 6);
    expect(e.rackNow).toBeCloseTo(151, 6);
    expect(e.value).toBeCloseTo(180 + 10 * 1.13, 6);
    expect(e.taxDelta).toBe(0);
  });
  it('ne bouge pas quand le prix de gros est plus ancien que le relevé', () => {
    const e = estimate({ value: 180, date: '2026-10-19', kind: 'day' }, rack, '2026-10-22', 0.14975, EXCISE, 'regular');
    expect(e.value).toBe(180);
    expect(e.rackDelta).toBe(0);
  });
  it('ajoute le retour de la taxe d’accise au 1er février 2027 avec la TVH', () => {
    const e = estimate({ value: 170, date: '2027-01-31', kind: 'day' }, [], '2027-02-01', 0.13, EXCISE, 'regular');
    expect(e.taxDelta).toBeCloseTo(5 * 1.13, 6);
    expect(e.value).toBeCloseTo(175.65, 6);
  });
  it('relevé mensuel : compare à la moyenne du mois', () => {
    const r: Obs[] = [['2026-09-01', 130], ['2026-09-30', 140], ['2026-10-01', 150], ['2026-10-02', 150], ['2026-10-05', 150]];
    expect(rackMonth(r, '2026-09')).toBe(135);
    expect(baseDate({ value: 1, date: '2026-09', kind: 'month' })).toBe('2026-10-01');
    const e = estimate({ value: 167.3, date: '2026-09', kind: 'month' }, r, '2026-10-22', 0.05, EXCISE, 'regular');
    expect(e.value).toBeCloseTo(167.3 + 15 * 1.05, 6);
  });
  it('fenêtre de gros : trois derniers jours avant la date', () => {
    expect(rackBefore(rack, '2026-10-08')).toEqual({ value: 141, last: '2026-10-07' });
    expect(rackBefore(rack, '2026-10-01')).toBeNull();
  });
});

describe('écart constaté', () => {
  it('rejoue la méthode et la compare à « pas de changement »', () => {
    // Prix qui suit exactement le gros (× 1,13) : la méthode a un écart nul, la prévision naïve non.
    const days: Obs[] = []; const weekly: Obs[] = [];
    let d = new Date('2025-06-02T00:00:00Z'); // avant la suspension du 2026-04-20 : aucune marche de taxe
    for (let i = 0; i < 120; i++) {
      const iso = d.toISOString().slice(0, 10);
      const v = 130 + 10 * Math.sin(i / 6);
      days.push([iso, v]);
      d = new Date(d.getTime() + 864e5);
    }
    for (let k = 7; k < 120; k += 7) {
      const iso = days[k][0];
      const ref = rackBefore(days, iso)!.value;
      weekly.push([iso, 40 + ref * 1.13]);
    }
    const b = backtest(weekly, days, 'week', 0.13, '2025-01-01', EXCISE, 'regular')!;
    expect(b.n).toBeGreaterThan(10);
    expect(b.mae, JSON.stringify(b)).toBe(0);
    expect(b.maeNaive).toBeGreaterThan(1);
  });
  it('refuse de conclure sur trop peu de points', () => {
    expect(backtest([['2026-10-01', 1], ['2026-10-08', 2]], rack, 'week', 0.13, '2026-01-01', EXCISE, 'regular')).toBeNull();
  });
});

describe('décomposition et coûts', () => {
  it('sépare taxe de vente, taxes sur les carburants et produit', () => {
    // 113 ¢ avec TVH 13 % : 100 ¢ avant TVH, dont 9 ¢ de taxe de l'Ontario.
    const b = breakdown(113, 0.13, [{ id: 'on', cpl: 9 }]);
    expect(b.salesTax).toBeCloseTo(13, 6);
    expect(b.product).toBeCloseTo(91, 6);
    expect(b.taxShare).toBeCloseTo(22 / 113, 6);
  });
  it('plein, litres et budget', () => {
    expect(fillCost(55, 180)).toBeCloseTo(99, 6);
    expect(litresFor(15000, 9.1)).toBeCloseTo(1365, 6);
    expect(yearlyCost(15000, 9.1, 180)).toBeCloseTo(2457, 6);
    expect(fillCost(-1, 180)).toBe(0);
  });
  it('moyenne de deux marchés aux dates communes', () => {
    expect(averageSeries([[['a', 1], ['b', 3]], [['b', 5]]])).toEqual([['b', 4]]);
  });
});

describe('calendriers combinés et taxes non modélisées', () => {
  it('additionne accise et taxe provinciale (Alberta, octobre 2026)', async () => {
    const { combineSteps } = await import('../src/lib/engine/estimate');
    const ab: ExciseStep[] = [{ from: '2024-04-01', regular: 13, diesel: 13 }, { from: '2026-10-01', regular: 0, diesel: 0 }];
    const all = combineSteps(EXCISE, ab);
    expect(exciseAt(all, '2026-09-15', 'regular')).toBe(13);
    expect(exciseAt(all, '2026-10-22', 'regular')).toBe(0);
    expect(exciseAt(all, '2026-03-15', 'diesel')).toBe(17);
    // Relevé de septembre (taxe de 13 ¢ incluse) : l'estimation d'octobre retire 13 ¢ × 1,05.
    const e = estimate({ value: 167.6, date: '2026-09', kind: 'month' }, [], '2026-10-22', 0.05, all, 'regular');
    expect(e.taxDelta).toBeCloseTo(-13.65, 6);
  });
  it('saute les relevés qui enjambent une date de taxe non modélisée', () => {
    const w: Obs[] = []; const r: Obs[] = [];
    for (let i = 0; i < 20; i++) { const d = new Date(Date.UTC(2025, 1, 3) + i * 7 * 864e5).toISOString().slice(0, 10); w.push([d, 150 - (d >= '2025-04-01' ? 18 : 0)]); }
    for (let i = 0; i < 140; i++) r.push([new Date(Date.UTC(2025, 0, 20) + i * 864e5).toISOString().slice(0, 10), 100]);
    const sans = backtest(w, r, 'week', 0.13, '2025-01-01', EXCISE, 'regular')!;
    const avec = backtest(w, r, 'week', 0.13, '2025-01-01', EXCISE, 'regular', { skip: ['2025-04-01'] })!;
    expect(sans.mae).toBeGreaterThan(0);
    expect(avec.mae).toBe(0);
    expect(avec.n).toBe(sans.n - 1);
  });
});

describe('signal quotidien', () => {
  it('prend le relais des prix de gros après leur dernier jour publié', () => {
    // Relevé du lundi 19 ; gros publiés jusqu'au 14 (avant le relevé) ; signal : 160 le 19, 157 le 21.
    const sig: Obs[] = [['2026-10-16', 161], ['2026-10-19', 160], ['2026-10-20', 158.5], ['2026-10-21', 157]];
    const e = estimate({ value: 176.7, date: '2026-10-19', kind: 'week' }, rack, '2026-10-22', 0.13, EXCISE, 'regular', sig);
    expect(e.rackDelta).toBe(0);
    expect(e.sigFrom).toBe('2026-10-19');
    expect(e.sigTo).toBe('2026-10-21');
    expect(e.value).toBeCloseTo(176.7 - 3 * 1.13, 6);
  });
  it('n’utilise que les jours publiés avant la date visée', () => {
    const sig: Obs[] = [['2026-10-19', 160], ['2026-10-22', 150]];
    const e = estimate({ value: 176.7, date: '2026-10-19', kind: 'week' }, [], '2026-10-22', 0.13, EXCISE, 'regular', sig);
    expect(e.value).toBe(176.7);
  });
});
