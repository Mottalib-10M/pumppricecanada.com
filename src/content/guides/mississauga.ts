import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'mississauga';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const MKT = K.proxyName(K.city(ID).proxy!, 'en');
const TANK = K.P.tank.compact;
const L100 = K.vehicleL100('compact', 'regular');
const tor = K.fuelOf('toronto', 'regular')!.latest.value;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 101, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['toronto', 'brampton', 'oshawa', 'tomorrow', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-mississauga',
    nav: 'Mississauga', card: 'Toronto West survey, tomorrow’s estimate, compact car fill-up',
    title: 'Gas Prices Mississauga 2026: Toronto West Survey, Tomorrow',
    description: 'Gas prices in Mississauga for 2026: the Toronto West average the province publishes, tomorrow’s estimate, a compact car fill-up cost and the tax per litre.',
    h1: 'Gas prices in Mississauga: the Toronto West figure',
    intro: `Mississauga drivers paid ${c(r.latest.value)} on average for regular at the ${E.day(r.latest.date)} Toronto West survey, and the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `Mississauga has no official gas price of its own: the Government of Ontario's weekly survey of self-serve stations folds the city into ${MKT}, the western half of the Toronto market, so every figure on this page is the ${MKT} average. At the ${K.when(r, 'en')}, regular gasoline there cost ${c(r.latest.value)}, premium ${c(pr.latest.value)} and diesel ${c(d.latest.value)}, taxes included. Because the province only surveys on Mondays, the site carries that number forward with the wholesale movement visible since then in the daily Montreal survey of the Régie de l'énergie du Québec, sales tax added, which gives ${c(r.est.value)} for ${E.day(K.TOMORROW)}. Replayed over ${r.bt?.n ?? 0} past weeks of ${MKT}, that projection was off by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} when the last survey is simply repeated. Tax makes up ${E.p(br.taxShare)} of the litre: Ontario's 9-cent gasoline tax and 13% HST, while the federal excise tax stays suspended since April 20, 2026.`,
    faqs: [
      { q: 'Why does the Mississauga gas price match Toronto West exactly?', a: 'The Ontario government does not publish a Mississauga average. Its weekly survey splits Greater Toronto into a western and an eastern market, and Mississauga belongs to the western one. Showing that regional figure, and saying so, is more honest than inventing a city number. A station near your home can still sit a few cents above or below it.' },
      { q: 'How much does it cost to fill a compact car in Mississauga this week?', a: `With a ${TANK}-litre tank filled from empty at the ${MKT} survey price of ${c(r.latest.value)}, the bill is ${K.dollars(K.fillCost(TANK, r.latest.value), 'en')}. If some fuel is still in the tank when you stop, the calculator on this page lets you say how much remains and recomputes the litres you actually buy.` },
      { q: 'Is gas in Mississauga cheaper than in central Toronto?', a: `The Toronto page blends the West and East averages, while Mississauga uses West alone. At the latest survey the blend was ${c(tor)} and ${MKT} was ${c(r.latest.value)}, a gap of ${K.cents(r.latest.value - tor, 'en')}. Real stations on either side of the city limit vary more than that, so the regional gap is a rough guide only.` },
    ],
    body: (h) => `
<h2>Toronto West stands in for Mississauga</h2>
<p>The provincial survey is a Monday snapshot of self-serve prices across a handful of Ontario markets. Mississauga is not one of them by name; it falls inside ${MKT}, and so do its neighbours in Peel. The table below therefore describes the western part of the Greater Toronto Area as a whole, with each figure dated and attributed.</p>
${facts(h, ID)}
<p>At this survey premium sat ${h.cpl(pr.latest.value - r.latest.value)} above regular and diesel ${h.cpl(d.latest.value - r.latest.value)} above it. Those spreads come from the refined products markets, not from tax: Ontario charges the same 9 cents a litre on both gasoline grades.</p>

<h2>What a compact car costs to fill in Mississauga</h2>
<p>The simplest case is a compact car. Take a ${TANK}-litre tank bought from empty: at the survey price it costs ${h.usd(K.fillCost(TANK, r.latest.value))}, and at the price expected for ${h.day(K.TOMORROW)} it would cost ${h.usd(K.fillCost(TANK, r.est.value))}. Each cent per litre is worth ${h.usd(TANK / 100)} on that fill-up, so a move of a few cents between Monday and the weekend barely changes the bill.</p>
<p>The running cost tells a more useful story. Natural Resources Canada's median combined rating for 2026 compact models is ${h.n(L100, 1)} litres per 100 km, which puts every 100 km at ${h.usd(K.fillCost(L100, r.est.value))} at tomorrow's estimate. Enter your posted price and how full the tank still is below.</p>
${h.mini('plein', { p: ['p', 'r', 'e'], d: { p: Math.round(r.latest.value * 10) / 10, r: TANK }, t: 'A compact car fill-up in Mississauga' })}

<h2>Reading tomorrow's Mississauga estimate</h2>
<p>The estimate is the Monday ${MKT} average plus whatever the wholesale market has done since, measured through the daily Québec survey once its taxes are stripped out and Ontario's HST is put back. It answers one question: if the survey were taken again tomorrow, where would the average probably land? Over the weeks replayed, nine misses out of ten stayed within ${h.cpl(r.bt?.p90 ?? 0)}. It cannot say what a single forecourt on Hurontario Street or Dundas Street will post. The ${h.a('tomorrow', 'tomorrow page')} shows the same estimate for every city.</p>

<h2>Taxes inside a Mississauga litre</h2>
<p>Tax per litre is fixed in cents, then HST is charged on the whole price, so the HST part rises and falls with the pump price while the provincial tax does not.</p>
${taxTable(h, ID)}
<p>The federal excise tax of 10 cents on gasoline is at zero for now. Finance Canada's draft legislation brings back half of it on February 1, 2027 and all of it on April 1, 2027, which would add the excise plus HST on top to every litre.</p>

<h2>Recent Toronto West surveys</h2>
<p>The Ontario series is published under an open licence, so the last ${h.n(K.HIST[ID]?.regular?.length ?? 0)} surveys used for Mississauga can be listed in full.</p>
${histTable(h, ID)}
<p>Drivers in the east end of the region can set these against the ${h.a('oshawa', 'Toronto East figures used for Oshawa')}, and the ${h.a('cheapest', 'national ranking')} places the whole market among other Canadian cities.</p>
`,
  },
});
