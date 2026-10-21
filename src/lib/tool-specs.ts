/**
 * Les simulateurs du site, dans les deux langues. Chaque chiffre vient de src/lib/data.ts (instantané officiel du
 * jour, taxes, consommation RNCan) et du moteur src/lib/engine/estimate.ts. Une spec liste ses champs (visibles
 * d'abord, `adv` repliés) et une fonction pure `run` qui rend la carte de résultat.
 */
import type { ToolSpec, V, Input, Opt } from './tool-types';
import { resolve } from './tool-types';
import { formatRate, type Lang } from './format';
import {
  CITY_IDS, PRICED_IDS, FUELS, PROVS, TODAY, TOMORROW, VEHICLE_IDS, VEHICLE_NAMES, EXCISE,
  city, cityName, fuelOf, provName, salesRate, salesLabel, proxyName, cityBreakdown, headline, vehicleL100,
  cpl, cents, dollars, pct, num, day, weekday, fuelName, srcName, when, btText, fillCost, litresFor, type Fuel,
} from './data';
import { exciseAt } from './engine/estimate';

export type Args = Record<string, number | string>;
const T = (l: Lang, fr: string, en: string) => (l === 'fr' ? fr : en);
const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k]);
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/* ---------- champs communs ---------- */
const cityOpts = (l: Lang, ids = PRICED_IDS): Opt[] => ids.map((id) => ({ value: id, label: `${cityName(id, l)} (${provName(city(id).prov, l)})` }));
const cityField = (l: Lang, def = 'toronto', id = 'v', label?: string): Input => ({ kind: 'select', id, label: label ?? T(l, 'Ville', 'City'), def, options: cityOpts(l) });
/** Carburants offerts par la ville choisie (Gatineau et Sherbrooke : essence ordinaire seulement). */
const fuelField = (l: Lang, def: Fuel = 'regular', cityKey = 'v'): Input => ({
  kind: 'select', id: 'c', label: T(l, 'Carburant', 'Fuel'), def,
  options: (v: V) => FUELS.filter((f) => fuelOf(String(v[cityKey] ?? 'toronto'), f)).map((f) => ({ value: f, label: cap(fuelName(f, l)) })),
});
const tankField = (l: Lang, def = 55, adv = false): Input => ({ id: 'r', label: T(l, 'Litres à mettre', 'Litres to buy'), def, unit: 'L', max: 400, help: T(l, 'Un plein de voiture compacte : 45 L environ ; camionnette : 90 L', 'A compact car fill-up: about 45 L; a pickup: about 90 L'), adv });
const kmField = (l: Lang, def = 15000, adv = true): Input => ({ id: 'k', label: T(l, 'Kilomètres par an', 'Kilometres a year'), def, unit: 'km', max: 200000, adv });
const l100Field = (l: Lang, def = 8.7, adv = true): Input => ({ id: 'q', label: T(l, 'Consommation', 'Fuel consumption'), def, unit: 'L/100 km', max: 40, decimals: 1, help: T(l, 'Cote combinée de votre véhicule (étiquette ÉnerGuide)', 'Combined rating of your vehicle (EnerGuide label)'), adv });

/** Première ligne de la note : d'où vient le chiffre. */
function provenance(id: string, f: Fuel, l: Lang): string {
  const c = city(id), d = fuelOf(id, f)!;
  const parts = [`${T(l, 'Source', 'Source')} : ${srcName(d, l)}, ${when(d, l)}.`.replace(' :', l === 'fr' ? ' :' : ':')];
  if (c.proxy) parts.push(T(l, `Pas de moyenne officielle propre à ${c.name.fr} : le chiffre est celui publié pour ${proxyName(c.proxy, l)}.`, `No official average of its own for ${c.name.en}: the figure is the one published for ${proxyName(c.proxy, l)}.`));
  if (d.isMax) parts.push(T(l, 'Prix MAXIMAL fixé par le régulateur, taxes comprises : une station peut vendre moins cher.', 'MAXIMUM price set by the regulator, taxes included: a station may sell for less.'));
  return parts.join(' ');
}

/** Lignes de l'estimation du lendemain (méthode publiée). */
function estRows(id: string, f: Fuel, l: Lang): Array<[string, string]> {
  const d = fuelOf(id, f)!, e = d.est, rate = salesRate(city(id).prov);
  const rows: Array<[string, string]> = [[T(l, 'Point de départ officiel', 'Official starting point'), `${cpl(d.latest.value, l)} (${when(d, l)})`]];
  if (e.rackDelta) rows.push([T(l, `Prix de gros, jusqu’au ${day(e.rackNowLast!, l)}, taxe de vente comprise`, `Wholesale price, up to ${day(e.rackNowLast!, l)}, with sales tax`), cents(e.rackDelta * (1 + rate), l)]);
  if (e.sigDelta) rows.push([T(l, `Marché de l’Est, du ${day(e.sigFrom!, l)} au ${day(e.sigTo!, l)}`, `Eastern market, ${day(e.sigFrom!, l)} to ${day(e.sigTo!, l)}`), cents(e.sigDelta * (1 + rate), l)]);
  if (e.taxDelta) rows.push([T(l, 'Changement de taxe daté', 'Dated tax change'), cents(e.taxDelta, l)]);
  rows.push([T(l, 'Écart passé de la méthode', 'Past error of the method'), btText(d.bt, l)]);
  return rows;
}

export const SPECS: Record<string, (l: Lang, arg?: Args) => ToolSpec> = {
  /* Accueil et pages de ville : prix du jour, demain, plein, budget, taxes */
  ville: (l) => ({
    inputs: [cityField(l), fuelField(l), tankField(l), kmField(l), l100Field(l)],
    run: (v) => {
      const id = s(v, 'v'), f = s(v, 'c') as Fuel, d = fuelOf(id, f)!;
      const h = headline(d), e = d.est;
      const br = cityBreakdown(id, f, h.value, TOMORROW, l);
      const fill = fillCost(n(v, 'r'), h.value), fillT = fillCost(n(v, 'r'), e.value);
      const year = fillCost(litresFor(n(v, 'k'), n(v, 'q')), e.value);
      const diff = e.value - h.value;
      return {
        label: h.isEstimate
          ? T(l, `${cap(fuelName(f, l))} à ${cityName(id, l)}, estimation pour le ${day(TOMORROW, l)}`, `${cap(fuelName(f, l))} in ${cityName(id, l)}, estimate for ${day(TOMORROW, l)}`)
          : T(l, `${cap(fuelName(f, l))} à ${cityName(id, l)}, ${when(d, l)}`, `${cap(fuelName(f, l))} in ${cityName(id, l)}, ${when(d, l)}`),
        value: cpl(h.value, l),
        sub: h.isEstimate
          ? T(l, `Dernière moyenne officielle : ${cpl(d.latest.value, l)} (${when(d, l)}).`, `Last official average: ${cpl(d.latest.value, l)} (${when(d, l)}).`)
          : T(l, `Estimation pour demain, ${weekday(TOMORROW, l)} ${day(TOMORROW, l)} : ${cpl(e.value, l)} (${cents(diff, l)}).`, `Estimate for tomorrow, ${weekday(TOMORROW, l)}, ${day(TOMORROW, l)}: ${cpl(e.value, l)} (${cents(diff, l)}).`),
        rows: [
          [T(l, `Plein de ${num(n(v, 'r'), l)} L à ce prix`, `${num(n(v, 'r'), l)} L at this price`), dollars(fill, l), fill],
          [T(l, `Le même plein demain (estimation)`, `The same fill-up tomorrow (estimate)`), dollars(fillT, l), fillT],
          [T(l, `Carburant pour ${num(n(v, 'k'), l)} km par an`, `Fuel for ${num(n(v, 'k'), l)} km a year`), dollars(year, l, 0)],
          [T(l, 'Taxes dans un litre', 'Taxes in one litre'), `${cpl(br.salesTax + br.lines.reduce((a, x) => a + x.cpl, 0), l)} (${pct(br.taxShare, l)})`],
          [T(l, 'Écart passé de l’estimation', 'Past error of the estimate'), btText(d.bt, l)],
        ],
        note: provenance(id, f, l),
      };
    },
  }),

  /* Prix de demain : l'estimation et ses composantes */
  demain: (l) => ({
    inputs: [cityField(l), fuelField(l)],
    run: (v) => {
      const id = s(v, 'v'), f = s(v, 'c') as Fuel, d = fuelOf(id, f)!, e = d.est;
      const diff = e.value - d.latest.value;
      const reg = d.isMax && d.regChangesTomorrow === false;
      return {
        label: T(l, `Estimation pour demain, ${weekday(TOMORROW, l)} ${day(TOMORROW, l)}, ${cityName(id, l)}`, `Estimate for tomorrow, ${weekday(TOMORROW, l)}, ${day(TOMORROW, l)}, ${cityName(id, l)}`),
        value: cpl(e.value, l),
        sub: reg
          ? T(l, 'Le régulateur ne refixe pas le prix maximal demain : il reste celui en vigueur.', 'The regulator does not reset the maximum price tomorrow: the one in force stays.')
          : T(l, `${cents(diff, l)} par rapport au dernier chiffre officiel (${when(d, l)}).`, `${cents(diff, l)} compared with the last official figure (${when(d, l)}).`),
        rows: estRows(id, f, l),
        note: `${provenance(id, f, l)} ${T(l, 'Estimation : le prix affiché peut différer, les stations changent leurs prix à toute heure.', 'Estimate: the posted price can differ, stations change prices at any hour.')}`,
      };
    },
  }),

  /* Comparer deux villes */
  comparer: (l) => ({
    inputs: [cityField(l, 'toronto', 'v', T(l, 'Première ville', 'First city')), cityField(l, 'montreal', 'w', T(l, 'Deuxième ville', 'Second city')),
      { kind: 'choice', id: 'c', label: T(l, 'Carburant', 'Fuel'), def: 'regular', options: [{ value: 'regular', label: T(l, 'Ordinaire', 'Regular') }, { value: 'diesel', label: 'Diesel' }] },
      tankField(l, 55, true), kmField(l), l100Field(l)],
    run: (v) => {
      const a = s(v, 'v'), b = s(v, 'w');
      const f = (fuelOf(a, s(v, 'c') as Fuel) && fuelOf(b, s(v, 'c') as Fuel) ? s(v, 'c') : 'regular') as Fuel;
      const pa = headline(fuelOf(a, f)!).value, pb = headline(fuelOf(b, f)!).value, dlt = pb - pa;
      const lit = litresFor(n(v, 'k'), n(v, 'q'));
      const cheaper = dlt > 0 ? cityName(a, l) : cityName(b, l);
      return {
        label: T(l, `Écart par litre, ${cityName(b, l)} moins ${cityName(a, l)}`, `Difference per litre, ${cityName(b, l)} minus ${cityName(a, l)}`),
        value: cents(dlt, l),
        sub: Math.abs(dlt) < 0.05 ? T(l, 'Même prix moyen.', 'Same average price.') : T(l, `${cheaper} est moins cher en moyenne.`, `${cheaper} is cheaper on average.`),
        rows: [
          [cityName(a, l), `${cpl(pa, l)} (${when(fuelOf(a, f)!, l)})`],
          [cityName(b, l), `${cpl(pb, l)} (${when(fuelOf(b, f)!, l)})`],
          [T(l, `Sur un plein de ${num(n(v, 'r'), l)} L`, `On a ${num(n(v, 'r'), l)} L fill-up`), dollars(Math.abs(dlt) * n(v, 'r') / 100, l)],
          [T(l, `Sur ${num(n(v, 'k'), l)} km par an`, `Over ${num(n(v, 'k'), l)} km a year`), dollars(Math.abs(dlt) * lit / 100, l, 0)],
        ],
        note: T(l, 'Moyennes de ville, pas de station. Une moyenne mensuelle est ramenée à aujourd’hui avec la méthode publiée.', 'City averages, not stations. A monthly average is brought to today with the published method.'),
      };
    },
  }),

  /* Coût d'un plein, à partir du prix affiché à la station */
  plein: (l, arg) => {
    const def = Number(arg?.p) || headline(fuelOf('toronto', 'regular')!).value;
    return {
      inputs: [{ id: 'p', label: T(l, 'Prix affiché', 'Posted price'), def: Math.round(def * 10) / 10, unit: '¢/L', max: 500, decimals: 1, help: T(l, 'En cents par litre, comme sur le panneau', 'In cents per litre, as on the sign') },
        { id: 'r', label: T(l, 'Taille du réservoir', 'Tank size'), def: 55, unit: 'L', max: 400 },
        { id: 'e', label: T(l, 'Reste dans le réservoir', 'Left in the tank'), def: 15, unit: '%', max: 100 }],
      run: (v) => {
        const lit = n(v, 'r') * (1 - Math.min(100, n(v, 'e')) / 100), cost = fillCost(lit, n(v, 'p'));
        return {
          label: T(l, 'Coût du plein', 'Cost of the fill-up'), value: dollars(cost, l),
          sub: T(l, `${num(lit, l, 1)} L à ${cpl(n(v, 'p'), l)}.`, `${num(lit, l, 1)} L at ${cpl(n(v, 'p'), l)}.`),
          rows: [
            [T(l, '10 litres', '10 litres'), dollars(fillCost(10, n(v, 'p')), l)],
            [T(l, 'Si le prix monte de 5 ¢', 'If the price goes up 5¢'), dollars(fillCost(lit, n(v, 'p') + 5), l)],
            [T(l, 'Si le prix baisse de 5 ¢', 'If the price goes down 5¢'), dollars(fillCost(lit, Math.max(0, n(v, 'p') - 5)), l)],
            [T(l, 'Chaque cent par litre sur ce plein', 'Each cent per litre on this fill-up'), dollars(lit / 100, l)],
          ],
        };
      },
    };
  },

  /* Budget annuel selon le véhicule (médianes RNCan) */
  budget: (l) => ({
    inputs: [{ kind: 'select', id: 'u', label: T(l, 'Véhicule', 'Vehicle'), def: 'suv-small', options: VEHICLE_IDS.map((x) => ({ value: x, label: VEHICLE_NAMES[x][l] })) }, kmField(l, 15000, false), cityField(l),
      { id: 'q', label: T(l, 'Consommation (0 = médiane de la catégorie)', 'Fuel consumption (0 = class median)'), def: 0, unit: 'L/100 km', max: 40, decimals: 1, adv: true }],
    run: (v) => {
      const id = s(v, 'v'), d = fuelOf(id, 'regular')!, p = d.est.value;
      const q = n(v, 'q') || vehicleL100(s(v, 'u'), 'regular');
      const lit = litresFor(n(v, 'k'), q), y = fillCost(lit, p);
      return {
        label: T(l, `Carburant pour un an, ${VEHICLE_NAMES[s(v, 'u')][l].toLowerCase()} à ${cityName(id, l)}`, `Fuel for a year, ${VEHICLE_NAMES[s(v, 'u')][l].toLowerCase()} in ${cityName(id, l)}`),
        value: dollars(y, l, 0),
        sub: T(l, `${num(lit, l)} L à ${cpl(p, l)} (estimation du ${day(TOMORROW, l)}).`, `${num(lit, l)} L at ${cpl(p, l)} (estimate for ${day(TOMORROW, l)}).`),
        rows: [
          [T(l, 'Par mois', 'Per month'), dollars(y / 12, l, 0)],
          [T(l, 'Par 100 km', 'Per 100 km'), dollars(fillCost(q, p), l)],
          [T(l, 'Consommation retenue', 'Consumption used'), `${num(q, l, 1)} L/100 km`],
          [T(l, 'Chaque 10 ¢ de plus par litre', 'Each extra 10¢ a litre'), dollars(lit * 0.1, l, 0)],
        ],
        note: T(l, 'Consommation : médiane des cotes combinées des modèles 2026 de la catégorie (Ressources naturelles Canada, essence ordinaire). La conduite réelle consomme souvent plus.', 'Consumption: median combined rating of the 2026 models in the class (Natural Resources Canada, regular gasoline). Real-world driving often uses more.'),
      };
    },
  }),

  /* Part des taxes dans le litre */
  taxes: (l) => ({
    inputs: [cityField(l), fuelField(l), { id: 'p', label: T(l, 'Prix à la pompe (0 = prix officiel)', 'Pump price (0 = official price)'), def: 0, unit: '¢/L', max: 500, decimals: 1, adv: true }],
    run: (v) => {
      const id = s(v, 'v'), f = s(v, 'c') as Fuel, d = fuelOf(id, f)!;
      const price = n(v, 'p') || headline(d).value;
      const br = cityBreakdown(id, f, price, TOMORROW, l), prov = city(id).prov;
      const fixed = br.lines.reduce((a, x) => a + x.cpl, 0);
      return {
        label: T(l, `Taxes dans un litre à ${cityName(id, l)}`, `Taxes in one litre in ${cityName(id, l)}`), value: cpl(br.salesTax + fixed, l),
        sub: T(l, `${pct(br.taxShare, l)} d’un prix de ${cpl(price, l)}.`, `${pct(br.taxShare, l)} of a ${cpl(price, l)} price.`),
        rows: [
          ...br.lines.map((x) => [x.label, cpl(x.cpl, l, 2), x.cpl] as [string, string, number]),
          [T(l, `Taxe de vente (${salesLabel(prov, l)}, ${formatRate(salesRate(prov), l)})`, `Sales tax (${salesLabel(prov, l)}, ${formatRate(salesRate(prov), l)})`), cpl(br.salesTax, l, 2), br.salesTax],
          [T(l, 'Produit, transport et marges', 'Product, transport and margins'), cpl(br.product, l, 2), br.product],
        ],
        note: T(l, 'La taxe de vente s’applique sur le prix qui comprend déjà les taxes au litre. La taxe d’accise fédérale est suspendue depuis le 20 avril 2026.', 'Sales tax applies to the price that already includes the per-litre taxes. The federal excise tax has been suspended since April 20, 2026.'),
      };
    },
  }),

  /* Retour de la taxe d'accise en 2027 */
  accise: (l) => ({
    inputs: [{ kind: 'select', id: 'pr', label: T(l, 'Province', 'Province'), def: 'ON', options: PROVS.map((p) => ({ value: p, label: provName(p, l) })) },
      { kind: 'choice', id: 'c', label: T(l, 'Carburant', 'Fuel'), def: 'regular', options: [{ value: 'regular', label: T(l, 'Essence', 'Gasoline') }, { value: 'diesel', label: 'Diesel' }] },
      { id: 'm', label: T(l, 'Litres par mois', 'Litres a month'), def: 120, unit: 'L', max: 5000 }],
    run: (v) => {
      const f = s(v, 'c') as Fuel, rate = salesRate(s(v, 'pr')), m = n(v, 'm');
      const half = exciseAt(EXCISE, '2027-02-01', f) * (1 + rate), full = exciseAt(EXCISE, '2027-04-01', f) * (1 + rate);
      return {
        label: T(l, 'De plus par mois à partir du 1er avril 2027', 'Extra a month from April 1, 2027'), value: dollars(full * m / 100, l),
        sub: T(l, `${cents(full, l, 2)} par litre, taxe de vente comprise, si le calendrier du projet de loi est adopté.`, `${cents(full, l, 2)} a litre, with sales tax, if the draft legislation schedule is enacted.`),
        rows: [
          [T(l, 'Jusqu’au 31 janvier 2027', 'Until January 31, 2027'), dollars(0, l)],
          [T(l, 'Février et mars 2027 (demi-taux), par mois', 'February and March 2027 (half rate), a month'), dollars(half * m / 100, l)],
          [T(l, 'À partir d’avril 2027, par an', 'From April 2027, a year'), dollars(full * m * 12 / 100, l, 0)],
          [T(l, 'Taux d’accise prévu au 1er avril 2027', 'Excise rate planned for April 1, 2027'), cpl(exciseAt(EXCISE, '2027-04-01', f), l, 0)],
        ],
        note: T(l, 'Calendrier : Finances Canada (suspension du 20 avril 2026 ; avant-projet de loi de septembre 2026 : prolongation au 31 janvier 2027, demi-taux en février et mars, plein taux le 1er avril 2027).', 'Schedule: Finance Canada (suspension of April 20, 2026; September 2026 draft legislation: extension to January 31, 2027, half rate in February and March, full rate on April 1, 2027).'),
      };
    },
  }),

  /* Classement des villes */
  classement: (l) => ({
    inputs: [{ kind: 'choice', id: 'c', label: T(l, 'Carburant', 'Fuel'), def: 'regular', options: [{ value: 'regular', label: T(l, 'Ordinaire', 'Regular') }, { value: 'diesel', label: 'Diesel' }] },
      { kind: 'select', id: 'z', label: T(l, 'Région', 'Region'), def: 'all', options: [{ value: 'all', label: T(l, 'Tout le Canada', 'All of Canada') }, { value: 'ON', label: 'Ontario' }, { value: 'QC', label: T(l, 'Québec', 'Quebec') }, { value: 'W', label: T(l, 'Ouest', 'West') }, { value: 'A', label: T(l, 'Atlantique', 'Atlantic') }] }],
    run: (v) => {
      const f = s(v, 'c') as Fuel, z = s(v, 'z');
      const inZ = (p: string) => z === 'all' || p === z || (z === 'W' && ['BC', 'AB', 'SK', 'MB'].includes(p)) || (z === 'A' && ['NS', 'NB', 'NL', 'PE'].includes(p));
      const list = PRICED_IDS.filter((id) => fuelOf(id, f) && inZ(city(id).prov) && !city(id).proxy).map((id) => ({ id, p: headline(fuelOf(id, f)!).value })).sort((a, b) => a.p - b.p);
      const lo = list[0], hi = list[list.length - 1];
      return {
        label: T(l, `Moins cher, ${fuelName(f, l)}`, `Cheapest, ${fuelName(f, l)}`), value: `${cityName(lo.id, l)}`,
        sub: `${cpl(lo.p, l)} · ${T(l, 'le plus cher', 'most expensive')} : ${cityName(hi.id, l)}, ${cpl(hi.p, l)}`.replace(' :', l === 'fr' ? ' :' : ':'),
        rows: [[T(l, 'Écart entre les deux', 'Gap between the two'), cents(hi.p - lo.p, l)], [T(l, 'Sur un plein de 55 L', 'On a 55 L fill-up'), dollars((hi.p - lo.p) * 0.55, l)], [T(l, 'Villes comparées', 'Cities compared'), num(list.length, l)]],
        table: { caption: T(l, 'Prix du jour ou estimation (moyennes mensuelles), du moins cher au plus cher', 'Price of the day or estimate (monthly averages), cheapest first'), headers: [T(l, 'Ville', 'City'), T(l, 'Prix', 'Price'), T(l, 'Chiffre', 'Figure')], align: ['l', 'r', 'l'], rows: list.map((x) => [cityName(x.id, l), cpl(x.p, l), headline(fuelOf(x.id, f)!).isEstimate ? T(l, 'estimation', 'estimate') : when(fuelOf(x.id, f)!, l)]) },
      };
    },
  }),
};

export function getTool(kind: string, lang: Lang, arg?: Args): ToolSpec {
  const f = SPECS[kind];
  if (!f) throw new Error(`Unknown tool ${kind}`);
  const spec = f(lang, arg);
  if (arg) for (const i of spec.inputs) if (arg[i.id] !== undefined) (i as { def: number | string }).def = i.kind === 'choice' || i.kind === 'select' ? String(arg[i.id]) : Number(arg[i.id]);
  return spec;
}
export function runTool(kind: string, lang: Lang, args: V = {}) {
  const spec = getTool(kind, lang);
  const v: V = resolve(spec.inputs, { ...Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])), ...args });
  return spec.run(v);
}
export const TOOL_KINDS = Object.keys(SPECS);
export { CITY_IDS, TODAY };
