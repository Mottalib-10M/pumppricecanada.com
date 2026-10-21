import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'ottawa';
const G = 'gatineau';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const g = K.fuelOf(G, 'regular')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brG = K.cityBreakdown(G, 'regular', g.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const fixed = (b: typeof br) => b.lines.reduce((a, x) => a + x.cpl, 0);
const taxO = fixed(br) + br.salesTax, taxG = fixed(brG) + brG.salesTax;
const qcBase = K.exciseAt(K.fuelSteps('QC'), K.TOMORROW, 'regular');
const qcGat = brG.lines.find((x) => x.id === 'prov')!.cpl + (brG.lines.find((x) => x.id === 'zone')?.cpl ?? 0);
const gapG = g.latest.value - r.est.value;
// Rang d'Ottawa parmi les marchés ontariens publiés sous leur propre nom.
const onList = K.PRICED_IDS.filter((id) => K.city(id).prov === 'ON' && !K.city(id).proxy).map((id) => ({ id, p: K.fuelOf(id, 'regular')!.latest.value })).sort((a, b) => a.p - b.p);
const rank = onList.findIndex((x) => x.id === ID) + 1;
const ord = (n: number) => (n === 1 ? 'the cheapest' : n === onList.length ? 'the most expensive' : `number ${n} from the cheapest`);
const sc = r.monthly;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 107, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['gatineau', 'montreal', 'toronto', 'tomorrow', 'taxes'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-ottawa',
    nav: 'Ottawa', card: 'Ottawa survey, Gatineau across the river, tomorrow',
    title: 'Gas Prices Ottawa 2026: Today, Tomorrow and Gatineau Gap',
    description: 'Gas prices in Ottawa for 2026: the weekly Ontario survey, tomorrow’s estimate, the gap with Gatineau across the river and how Ontario and Quebec taxes differ.',
    h1: 'Gas prices in Ottawa, and the Gatineau gap',
    intro: `Ottawa's regular gasoline averaged ${c(r.latest.value)} at the ${E.day(r.latest.date)} Ontario survey, and the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `Ottawa is one of the markets that the Government of Ontario surveys by name every Monday, so the city has its own official average. At the ${K.when(r, 'en')} it was ${c(r.latest.value)} for regular and ${c(d.latest.value)} for diesel, taxes included${sc ? `; Statistics Canada's monthly average for ${K.month(sc.date, 'en')}, a separate survey, was ${c(sc.value)}` : ''}. The estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}: Monday's figure plus the pre-tax change since then in the daily Montreal survey of the Régie de l'énergie du Québec, with HST. Over ${r.bt?.n ?? 0} replayed weeks it missed the next survey by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} for a no-change guess. Across the Ottawa River, the Régie's daily average for Gatineau on ${E.day(g.latest.date)} was ${c(g.latest.value)}. Taxes make up ${E.p(br.taxShare)} of an Ottawa litre, from Ontario's 9-cent gasoline tax and 13% HST; the federal excise has been suspended since April 20, 2026.`,
    faqs: [
      { q: 'Is gas cheaper in Ottawa or in Gatineau?', a: `On the latest figures, Gatineau's daily average of ${c(g.latest.value)} (${E.day(g.latest.date)}) is ${K.cents(gapG, 'en')} from the Ottawa estimate for ${E.day(K.TOMORROW)}, ${c(r.est.value)}. Quebec taxes are heavier, but Quebec cuts its fuel tax by 6 cents within 15 km of Ontario, which narrows the gap. Compare the two sources on dates as close as possible.` },
      { q: 'Why are there two official gas prices for Ottawa?', a: `Two agencies measure it. The Government of Ontario surveys self-serve stations every Monday; Statistics Canada publishes a monthly average in its consumer price data. They differ in method and period, so they rarely match to the cent. This page leads with the Ontario survey because it is weekly and recent, and keeps the monthly figure as a cross-check.` },
      { q: 'Where does Ottawa rank among Ontario cities for gas prices?', a: `At the latest survey Ottawa was ${ord(rank)} of the ${onList.length} Ontario cities on this site with a surveyed market of their own, at ${c(r.latest.value)}. The ranking can change from one Monday to the next, so the city ranking page recomputes it with every update of the data.` },
    ],
    body: (h) => `
<h2>Ottawa's own weekly average</h2>
<p>Unlike the suburbs of Toronto, Ottawa has a market of its own in the provincial survey, so the figures below describe the city rather than a wider region. They are dated by the Monday survey that produced them.</p>
${facts(h, ID)}
${sc ? `<p>Statistics Canada also publishes an Ottawa average, monthly, in table 18-10-0001-01. For ${K.month(sc.date, 'en')} it was ${h.cpl(sc.value)}. That is ${h.cents(sc.value - r.latest.value)} from the latest Ontario survey, but the two series are collected differently and cover different periods, a full month on one side and a single Monday on the other; the weekly Ontario survey is the fresher of the two and is the one the estimate starts from.</p>` : ''}

<h2>Ottawa and Gatineau, either side of the river</h2>
<p>Gatineau faces Ottawa across the Ottawa River, and several bridges link the two. The two cities sit in different tax systems and are measured by different agencies: Ontario's weekly survey for Ottawa, the Régie de l'énergie du Québec's daily survey for Gatineau. On the most recent dates available, Gatineau was at ${h.cpl(g.latest.value)} on ${h.day(g.latest.date)}, and Ottawa is estimated at ${h.cpl(r.est.value)} for ${h.day(K.TOMORROW)}, a gap of ${h.cents(gapG)} for Gatineau.</p>
<p>The tax side explains part of the picture. Quebec's fuel tax is ${h.n(qcBase, 1)} cents a litre, but within 15 km of the Ontario border it is reduced by 6 cents, which brings Gatineau to ${h.n(qcGat, 1)} cents against Ontario's 9. Quebec then charges GST and QST together at ${h.r(K.salesRate('QC'))}, against ${h.r(K.salesRate('ON'))} HST in Ontario. All told, taxes come to ${h.cpl(taxG)} in Gatineau at its price and ${h.cpl(taxO)} in Ottawa at the survey price. Whatever remains of the gap comes from wholesale supply and retail competition on each side.</p>
${h.mini('comparer', { p: ['w', 'r'], d: { v: ID, w: G }, t: 'Ottawa against Gatineau' })}
<p>The ${h.a('gatineau', 'Gatineau page')} gives the Quebec side in detail, and ${h.a('montreal', 'Montreal')} shows the effect of the transit levy charged there.</p>

<h2>Ottawa among Ontario markets</h2>
<p>Of the ${h.n(onList.length)} Ontario cities on this site that have a surveyed market of their own (Toronto counted once, as the mean of its two halves), Ottawa was ${ord(rank)} at the latest survey. Cities that borrow a regional figure, such as Mississauga or Hamilton, are left out of the ranking so that no average is counted twice.</p>
${h.mini('classement', { p: ['c'], d: { z: 'ON' }, t: 'Ontario cities, cheapest first' })}

<h2>The tax inside an Ottawa litre</h2>
${taxTable(h, ID)}
<p>The provincial rate of 9 cents was cut from 14.7 cents in July 2022 and made permanent in 2025. The ${h.a('taxes', 'tax page')} sets it beside every other province.</p>

<h2>Recent Ottawa surveys</h2>
<p>The province publishes its weekly series under an open licence, so the recent Ottawa surveys can be shown in full. They show how far the price can travel within a few months, and how much of that movement a single week can hold.</p>
${histTable(h, ID)}
<p>The estimate for the coming days is explained on the ${h.a('tomorrow', 'tomorrow page')}.</p>
`,
  },
});
