import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'hamilton';
const SC = 'st-catharines';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const rs = K.fuelOf(SC, 'regular')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const MKT = K.proxyName(K.city(ID).proxy!, 'en');
const hs = new Map(K.HIST[SC]?.regular ?? []), hh = K.HIST[ID]?.regular ?? [];
const pairs = hh.filter(([dt]) => hs.has(dt)).map(([dt, v]) => [dt, v, hs.get(dt)!] as [string, number, number]);
const nNiagara = pairs.filter(([, a, b]) => b < a - 0.05).length;
const avg = pairs.length ? pairs.reduce((s, [, a, b]) => s + (b - a), 0) / pairs.length : 0;
const gap = rs.latest.value - r.latest.value;
const cheaper = gap < -0.05 ? `St. Catharines and Niagara was ${K.cpl(-gap, 'en')} below it` : gap > 0.05 ? `St. Catharines and Niagara was ${K.cpl(gap, 'en')} above it` : 'St. Catharines and Niagara matched it';

export default defineGuide({
  id: ID, group: groupOf(ID), order: 104, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['st-catharines', 'kitchener', 'toronto', 'cheapest', 'tomorrow'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-hamilton',
    nav: 'Hamilton', card: 'Southern Ontario average, against Niagara, tomorrow',
    title: 'Gas Prices Hamilton 2026: Southern Ontario Average, Niagara',
    description: 'Gas prices in Hamilton in 2026: the southern Ontario average the province publishes, how it compares with St. Catharines and Niagara, and tomorrow’s estimate.',
    h1: 'Gas prices in Hamilton and the southern Ontario average',
    intro: `For Hamilton the reference is ${MKT}, which put regular at ${c(r.latest.value)} on ${E.day(r.latest.date)}; the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `Hamilton is not one of the markets in the Government of Ontario's weekly fuel price survey, so there is no official Hamilton average to quote. The closest published figure is ${MKT}, a single number that the province computes across the southern part of Ontario every Monday, and this page uses it. At the ${K.when(r, 'en')}, it was ${c(r.latest.value)} for regular, ${c(pr.latest.value)} for premium and ${c(d.latest.value)} for diesel, taxes included. The nearest surveyed city, St. Catharines and Niagara, has its own series: on that date ${cheaper}. The estimate for ${E.day(K.TOMORROW)}, ${c(r.est.value)}, adds the wholesale change seen since Monday in the daily Montreal survey; over ${r.bt?.n ?? 0} replayed weeks it was off by ${c(r.bt?.mae ?? 0)} on average, a no-change guess by ${c(r.bt?.maeNaive ?? 0)}. Taxes, 9 cents of Ontario gasoline tax plus 13% HST with the federal excise suspended since April 20, 2026, are ${E.p(br.taxShare)} of the price.`,
    faqs: [
      { q: 'Why does this page use the southern Ontario average for Hamilton?', a: `Because the province publishes nothing narrower for the city. Its weekly survey reports a handful of markets by name and two broad averages, one for the south of the province and one for the north. Hamilton falls in the southern one. Using it, and saying so, avoids presenting a city figure that no public agency produces.` },
      { q: 'Is gas cheaper in Hamilton or in St. Catharines?', a: `The two cannot be compared station by station from public data, only through their averages. Over the ${pairs.length} recent surveys, the St. Catharines and Niagara figure was below ${MKT} ${nNiagara} times, with an average difference of ${K.cents(avg, 'en')}. That is a comparison of a regional average with a city average, not of two cities on equal terms.` },
      { q: 'How much does a fill-up cost in Hamilton at the moment?', a: `With ${MKT} at ${c(r.latest.value)}, ${K.P.tank.midsize} litres of regular cost ${K.dollars(K.fillCost(K.P.tank.midsize, r.latest.value), 'en')} and ${K.P.tank.suv} litres ${K.dollars(K.fillCost(K.P.tank.suv, r.latest.value), 'en')}. The fill-up calculator on the page lets you enter the price on the sign instead, which is the better figure when you are standing at the pump.` },
    ],
    body: (h) => `
<h2>A regional average, not a city one</h2>
<p>The Ontario survey reports averages for a short list of markets (Toronto West and East, Ottawa, London, Windsor, St. Catharines, Peterborough and several northern cities) along with a provincial, a southern and a northern average. Hamilton is not on the list. The southern average is the published number that covers it, so it is the one used here. It blends many places, which smooths out local quirks: a Hamilton station can be cheaper or dearer than this figure on any given week.</p>
${facts(h, ID)}
<p>Premium was ${h.cpl(pr.latest.value - r.latest.value)} above regular in the survey, diesel ${h.cpl(d.latest.value - r.latest.value)} above. Those gaps are set by the refined products markets; the provincial tax per litre is the same on both grades of gasoline.</p>

<h2>Hamilton against St. Catharines and Niagara</h2>
<p>St. Catharines, a short drive along the Queen Elizabeth Way, is the closest market the province surveys by name. Its average can be set beside ${MKT} for each week where both were published.</p>
${h.table(['Survey', MKT.charAt(0).toUpperCase() + MKT.slice(1), 'St. Catharines and Niagara', 'Difference'], [...pairs].reverse().map(([dt, a, b]) => [h.day(dt), h.cpl(a), h.cpl(b), h.cents(b - a)]), 'Regular gasoline, Government of Ontario weekly survey, most recent first.', ['l', 'r', 'r', 'r'])}
<p>In ${h.n(nNiagara)} of those ${h.n(pairs.length)} weeks Niagara came in below the southern average, and the mean difference was ${h.cents(avg)}. Keep in mind what is being compared: one side is a single urban market, the other an average of the whole south of the province, so a gap may say as much about the rest of southern Ontario as about either city. The full Niagara picture is on the ${h.a('st-catharines', 'St. Catharines page')}.</p>
${h.mini('comparer', { p: ['w', 'c'], d: { v: ID, w: SC }, t: 'Hamilton against St. Catharines' })}

<h2>How the Hamilton estimate moves</h2>
<p>The southern average is a Monday number. Between surveys, the site follows the Régie de l'énergie du Québec, which publishes a Montreal price every morning; with its taxes removed, its change since Monday is a fair read of where the eastern wholesale market went, and it is applied to the southern average with HST. In the replay, nine weeks out of ten the error stayed below ${h.cpl(r.bt?.p90 ?? 0)}. The ${h.a('tomorrow', 'tomorrow page')} gives the same estimate for all cities.</p>

<h2>Taxes per litre in Hamilton</h2>
<p>Hamilton drivers pay the same taxes as everywhere else in Ontario: 9 cents a litre of provincial gasoline tax and 13% HST. No regional fuel tax is added on top, unlike the transit levies charged in Metro Vancouver or around Montreal.</p>
${taxTable(h, ID)}
<p>On a ${K.P.tank.midsize}-litre fill-up at this price, ${h.usd(K.fillCost(K.P.tank.midsize, br.salesTax + br.lines.reduce((a, x) => a + x.cpl, 0)))} goes to taxes and ${h.usd(K.fillCost(K.P.tank.midsize, br.product))} to the fuel itself, its transport and the margins of the wholesaler and the retailer.</p>

<h2>Recent southern Ontario surveys</h2>
${histTable(h, ID)}
<p>For a national view, the ${h.a('cheapest', 'city ranking')} lines up every surveyed market from the cheapest to the most expensive.</p>
`,
  },
});
