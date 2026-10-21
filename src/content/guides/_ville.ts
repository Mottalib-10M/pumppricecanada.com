/**
 * Pièces communes des pages de ville (CONTRIBUTING-PAGES.md). Tout ce qui est commun aux villes est rendu en
 * TABLEAU (que la mesure d'unicité met à part) ; la prose de chaque page est écrite pour sa ville.
 *   facts(h, id)          tableau du jour : carburant, chiffre officiel, date et source, estimation de demain, écart passé
 *   taxTable(h, id, f)    décomposition d'un litre (taxe provinciale, régionale, accise, taxe de vente, produit)
 *   histTable(h, id)      derniers relevés publiés (sources ouvertes seulement : Statistique Canada, Ontario)
 *   groupOf(id), sourcesOf(id)
 */
import type { Helpers, Group } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import type { Fuel } from '../../lib/data';

const FU: Fuel[] = ['regular', 'premium', 'diesel'];
const T = (h: Helpers, fr: string, en: string) => (h.lang === 'fr' ? fr : en);
const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

export function facts(h: Helpers, id: string): string {
  const rows = FU.filter((f) => K.fuelOf(id, f)).map((f) => {
    const d = K.fuelOf(id, f)!;
    return [cap(K.fuelName(f, h.lang)), h.cpl(d.latest.value), `${h.when(d)} · ${K.srcName(d, h.lang)}`, h.cpl(d.est.value), K.btText(d.bt, h.lang)];
  });
  return h.table([T(h, 'Carburant', 'Fuel'), T(h, 'Dernier chiffre officiel', 'Latest official figure'), T(h, 'Date et source', 'Date and source'), T(h, `Estimation du ${h.day(K.TOMORROW)}`, `Estimate for ${h.day(K.TOMORROW)}`), T(h, 'Écart passé de la méthode', 'Past error of the method')], rows,
    T(h, `${K.cityName(id, 'fr')} : prix en cents par litre, libre-service, taxes comprises. Sources lues le ${h.day(K.TODAY)}.`, `${K.cityName(id, 'en')}: prices in cents per litre, self-serve, taxes included. Sources read on ${h.day(K.TODAY)}.`), ['l', 'r', 'l', 'r', 'l']);
}

export function taxTable(h: Helpers, id: string, f: Fuel = 'regular', price?: number): string {
  const d = K.fuelOf(id, f);
  const p = price ?? (d ? K.headline(d).value : 0);
  const b = K.cityBreakdown(id, f, p, K.TOMORROW, h.lang);
  const prov = K.city(id).prov;
  const rows: Array<Array<string | number>> = [
    ...b.lines.map((x) => [x.label, h.cpl(x.cpl, 2)]),
    [T(h, `Taxe de vente (${K.salesLabel(prov, h.lang)}, ${h.r(K.salesRate(prov))})`, `Sales tax (${K.salesLabel(prov, h.lang)}, ${h.r(K.salesRate(prov))})`), h.cpl(b.salesTax, 2)],
    [T(h, 'Produit raffiné, transport et marges', 'Refined product, transport and margins'), h.cpl(b.product, 2)],
    [`<strong>${T(h, 'Prix à la pompe', 'Pump price')}</strong>`, `<strong>${h.cpl(p, 1)}</strong>`],
  ];
  return h.table([T(h, 'Composante', 'Component'), T(h, 'Par litre', 'Per litre')], rows,
    T(h, `Un litre de ${K.fuelName(f, 'fr')} à ${K.cityName(id, 'fr')} au prix du jour : ${h.p(b.taxShare)} de taxes.`, `One litre of ${K.fuelName(f, 'en')} in ${K.cityName(id, 'en')} at today's price: ${h.p(b.taxShare)} taxes.`), ['l', 'r']);
}

export function histTable(h: Helpers, id: string): string {
  const H = K.HIST[id];
  if (!H?.regular?.length) return '';
  const reg = H.regular, dsl = H.diesel ?? [];
  const dm = new Map(dsl);
  const monthly = /^\d{4}-\d{2}$/.test(reg[0][0]);
  const lbl = (x: string) => (monthly ? K.month(x, h.lang) : h.day(x));
  const rows = [...reg].reverse().map(([dd, v]) => [lbl(dd), h.cpl(v), dm.has(dd) ? h.cpl(dm.get(dd)!) : '']);
  return h.table([monthly ? T(h, 'Mois', 'Month') : T(h, 'Relevé', 'Survey'), T(h, 'Ordinaire', 'Regular'), 'Diesel'], rows,
    monthly ? T(h, 'Moyennes mensuelles de Statistique Canada (tableau 18-10-0001-01), les plus récentes d’abord.', 'Statistics Canada monthly averages (table 18-10-0001-01), most recent first.')
      : T(h, 'Relevés hebdomadaires du gouvernement de l’Ontario, les plus récents d’abord.', 'Government of Ontario weekly surveys, most recent first.'), ['l', 'r', 'r']);
}

export function groupOf(id: string): Group {
  const p = K.city(id).prov;
  return p === 'ON' ? 'on' : p === 'QC' ? 'qc' : ['NS', 'NB', 'NL', 'PE'].includes(p) ? 'atl' : 'ouest';
}

/** Sources de la page : relevés utilisés, taxe de la province, accise, prix de gros, consommation. */
export function sourcesOf(id: string): string[] {
  const c = K.city(id);
  const keys = new Set<string>();
  for (const f of FU) { const d = K.fuelOf(id, f); if (d) keys.add(K.srcKey(d)); }
  keys.add(`tax-${c.prov.toLowerCase()}`); keys.add('excise'); keys.add('ontario-rack');
  if (['ON', 'QC', 'NS', 'NB', 'NL', 'PE'].includes(c.prov)) keys.add('regie');
  return [...keys];
}
