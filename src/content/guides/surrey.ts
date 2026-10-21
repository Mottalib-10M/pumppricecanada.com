import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'surrey';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const P = K.proxyName(K.city(ID).proxy!, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const TL = (K.P.taxes.regional as Record<string, { total: { regular: number; diesel: number }; transit_share: number }>)['bc-translink'];
const VI = (K.P.taxes.regional as Record<string, { total: { regular: number; diesel: number } }>)['bc-victoria'];
const pick = K.vehicleL100('pickup-standard', 'regular'), comp = K.vehicleL100('compact', 'regular');
const yearCost = (q: number) => K.fillCost(K.litresFor(20000, q), r.est.value);

export default defineGuide({
  id: ID, group: groupOf(ID), order: 301, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['vancouver', 'victoria', 'kelowna', 'tomorrow', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-surrey',
    nav: 'Surrey', card: 'Vancouver average reused, TransLink area, yearly budget',
    title: 'Gas Prices Surrey BC 2026, Fill-Up and Yearly Fuel Cost',
    description: 'Gas prices in Surrey, B.C. in 2026: why the figure is the Vancouver average, the TransLink tax that Surrey pays, and what a fill-up or a year of driving costs.',
    h1: 'Gas prices in Surrey, B.C.',
    intro: `Surrey has no official average of its own: the ${P} figure, ${c(r.latest.value)} in ${mon}, is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}.`,
    resume: `No public body publishes a gasoline average for Surrey alone. Statistics Canada, whose monthly series is the only official source that can be reused, covers the Vancouver area as a whole, and Surrey lies inside it, in Metro Vancouver. This page therefore uses the ${P} average and says so: ${c(r.latest.value)} for regular in ${mon}, ${c(d.latest.value)} for diesel. Brought forward with the Edmonton wholesale price and dated tax changes, regular comes to ${c(r.est.value)} for ${E.day(K.TOMORROW)}; on ${r.bt?.n ?? 0} past months, that approach missed the next average by ${c(r.bt?.mae ?? 0)} on average. The tax side is not an approximation. Surrey is in the TransLink service area, so its stations charge the same ${TL.total.regular} cents of motor fuel tax per litre as Vancouver, plus 5% GST, which comes to ${E.p(br.taxShare)} of the estimated price. A 55-litre fill-up at that estimate costs ${E.m(K.fillCost(55, r.est.value))}.`,
    faqs: [
      { q: 'Is there an official gas price for Surrey?', a: 'Not a separate one. Statistics Canada publishes a monthly average for the Vancouver area, which includes Surrey, and that is the figure used here. Weekly averages from Natural Resources Canada also exist but cannot be republished. Individual stations in Surrey can sit a few cents above or below that regional average, so read it as a benchmark against the posted price.' },
      { q: 'Do Surrey drivers pay the TransLink gas tax?', a: 'Yes. Surrey is one of the municipalities of the TransLink service area, so gasoline sold there carries the full Metro Vancouver rate of 27 cents per litre of motor fuel tax, 18.5 of which fund TransLink. Leaving the region changes that: the Fraser Valley outside Metro Vancouver pays the provincial rate of 14.5 cents.' },
      { q: 'How much does a year of fuel cost a Surrey commuter?', a: `It depends mostly on the vehicle. The budget calculator on this page uses the median combined rating of 2026 models in each class, from Natural Resources Canada, and prices the litres at the estimate for tomorrow. At the median ratings, a full-size pickup burns ${K.num(pick / comp, 'en', 1)} times as much fuel as a compact car over the same distance, so the vehicle matters more than the station.` },
    ],
    body: (h) => `
<h2>What the Surrey figure is</h2>
<p>Surrey is part of Metro Vancouver, and in the official data it does not have a line of its own. Statistics Canada reports one average for the Vancouver area, and every number on this page that comes from it is that regional average. The table makes the borrowing visible: its source column names the Vancouver series and its month.</p>
${facts(h, ID)}
<p>A regional average describes the middle of the market. Individual stations in Surrey sit above or below it, so the figure is best read as a benchmark to compare against the sign you see. The estimate column brings the ${mon} average to ${h.day(K.TOMORROW)} using the Edmonton rack price; the ${h.a('tomorrow', 'tomorrow page')} explains the method for every city.</p>

<h2>Same tax zone as Vancouver</h2>
<p>Unlike the price, the tax in a Surrey litre is known exactly. The TransLink service area covers the municipalities of Metro Vancouver, Surrey among them, and gasoline sold there carries ${TL.total.regular} cents of motor fuel tax per litre, with ${TL.transit_share} cents going to TransLink. Drive east past the regional boundary and the rate drops to the provincial 14.5 cents; in the Victoria area it is ${VI.total.regular} cents.</p>
${taxTable(h, ID)}
<p>GST at 5% applies on top of the price with those taxes, and B.C. charges no provincial sales tax on road fuel. Since the carbon tax ended on April 1, 2025 and the federal excise was suspended on April 20, 2026, the fixed tax in a Surrey litre is the TransLink-area motor fuel tax alone. The ${h.a('kelowna', 'Kelowna page')} shows what the same litre pays outside the two transit zones.</p>

<h2>A year of driving in Surrey</h2>
<p>For a commuter, the yearly bill depends far more on the vehicle than on small differences between stations. Over 20,000 km a year at the estimate for ${h.day(K.TOMORROW)}, a compact car rated ${h.n(comp, 1)} L/100 km needs about ${h.usd(yearCost(comp), 0)} of fuel, a full-size pickup rated ${h.n(pick, 1)} L/100 km about ${h.usd(yearCost(pick), 0)}. Pick your own class and distance below.</p>
${h.mini('budget', { p: ['u', 'k'], d: { v: ID, u: 'pickup-standard', k: 20000 }, t: 'Your yearly fuel bill in Surrey' })}
<p>Those consumption figures are the median combined ratings of 2026 models in each class, published by Natural Resources Canada. Real consumption in heavy commuting traffic is usually above the label, so treat the result as a floor.</p>

<h2>The past year and your next fill-up</h2>
<p>The Vancouver series is published under the Open Government Licence, so the last months can be shown here. They are the same numbers as on the ${h.a('vancouver', 'Vancouver page')}, since Surrey shares the average.</p>
${histTable(h, ID)}
<p>If the station sign shows a different price from the estimate, use it: the calculator below gives the cost of your tank and what each cent per litre is worth.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(r.est.value * 10) / 10 }, t: 'Your Surrey fill-up' })}
`,
  },
});
