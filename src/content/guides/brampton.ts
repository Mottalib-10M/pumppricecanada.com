import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'brampton';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const usd0 = (x: number) => K.dollars(x, 'en', 0);
const MKT = K.proxyName(K.city(ID).proxy!, 'en');
/** Kilométrage d'exemple : la valeur de départ du simulateur, pas une moyenne. */
const KM = 15000;
const year = (v: string) => K.fillCost(K.litresFor(KM, K.vehicleL100(v, 'regular')), r.est.value);
const tor = K.fuelOf('toronto', 'regular')!.latest.value;
const CLASSES = ['compact', 'midsize', 'suv-small', 'suv-standard', 'minivan', 'pickup-standard'];

export default defineGuide({
  id: ID, group: groupOf(ID), order: 102, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['toronto', 'mississauga', 'barrie', 'tomorrow', 'forecast'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-brampton',
    nav: 'Brampton', card: 'Toronto West average, commute cost, yearly fuel budget',
    title: 'Gas Prices Brampton 2026: Commute and Yearly Fuel Cost',
    description: 'Gas prices in Brampton in 2026: the official Toronto West average, the estimate for tomorrow, and what a year of commuting costs in fuel for each vehicle class.',
    h1: 'Gas prices in Brampton and the cost of a year of driving',
    intro: `Regular gas in Brampton follows the Toronto West average, ${c(r.latest.value)} at the ${E.day(r.latest.date)} survey, with ${c(r.est.value)} expected for ${E.day(K.TOMORROW)}.`,
    resume: `Ontario does not survey Brampton on its own. The province's Monday price survey treats the city as part of ${MKT}, so the figure shown here is that regional average, and it is identical to the one used for Mississauga. The ${K.when(r, 'en')} found regular gasoline at ${c(r.latest.value)} and diesel at ${c(d.latest.value)}, taxes in. Moving it forward with the wholesale change published since Monday gives an estimate of ${c(r.est.value)} for ${E.day(K.TOMORROW)}; on ${r.bt?.n ?? 0} replayed weeks, the method's average miss was ${c(r.bt?.mae ?? 0)}, which beats the ${c(r.bt?.maeNaive ?? 0)} of a no-change guess. For a commuter the yearly bill matters more than the weekly number: at that estimate, ${E.n(KM)} km in a small SUV rated at the class median burns ${usd0(year('suv-small'))} of fuel, a compact ${usd0(year('compact'))}. Taxes are ${E.p(br.taxShare)} of the price, from Ontario's 9-cent tax and the 13% HST, the federal excise being suspended since April 20, 2026.`,
    faqs: [
      { q: 'How much does a year of commuting from Brampton cost in gas?', a: `It depends mostly on distance and vehicle. As an example, ${E.n(KM)} km a year in a small SUV at the Natural Resources Canada class median uses about ${E.n(K.litresFor(KM, K.vehicleL100('suv-small', 'regular')))} litres, or ${usd0(year('suv-small'))} at tomorrow's ${MKT} estimate. Change the vehicle, the distance or your own consumption rating in the calculator to get your figure.` },
      { q: 'Does Brampton have its own official gas price average?', a: `No. The Government of Ontario publishes regional averages, and Brampton sits inside ${MKT}, the same market as Mississauga. That is why both pages show the same number. This site states the regional source openly rather than presenting a city figure that no agency publishes.` },
      { q: 'Should Brampton commuters fill up in Toronto instead?', a: `On regional averages the difference is small: the Toronto figure, which blends West and East, was ${c(tor)} at the latest survey, against ${c(r.latest.value)} for ${MKT}. On a 55-litre fill-up that is ${K.dollars(Math.abs(r.latest.value - tor) * 0.55, 'en')}. Detouring for it rarely pays; a cheaper station on your usual route matters more.` },
    ],
    body: (h) => `
<h2>The regional figure behind Brampton</h2>
<p>Brampton's number is borrowed, and it is worth knowing from where. Each Monday the province records self-serve prices in a set of markets; ${MKT} covers the western side of the Greater Toronto Area, Peel Region included. The averages below are those of that market, dated, with the estimate for ${h.day(K.TOMORROW)} beside them.</p>
${facts(h, ID)}

<h2>The commute, counted over a year</h2>
<p>Highways 410, 401 and 407 tie Brampton to Toronto, and for anyone who drives one of them every working day a cent per litre is abstract; the yearly total is not. The table uses the median combined rating of 2026 models in each class from Natural Resources Canada and ${h.n(KM)} km, which is only the calculator's starting distance. Real commutes can be much longer or shorter, and real-world consumption is often above the label.</p>
${h.table(['Vehicle class', 'L/100 km (median)', `Fuel for ${h.n(KM)} km`, 'Per month'], CLASSES.map((v) => [K.VEHICLE_NAMES[v].en, h.n(K.vehicleL100(v, 'regular'), 1), h.usd(year(v), 0), h.usd(year(v) / 12, 0)]), `Brampton, regular gasoline at the ${h.day(K.TOMORROW)} estimate of ${h.cpl(r.est.value)}.`, ['l', 'r', 'r', 'r'])}
<p>The spread between classes is the real lever. Moving from a standard SUV to a compact changes the yearly bill by ${h.usd(year('suv-standard') - year('compact'), 0)} at today's prices, far more than any week-to-week change in the pump price. Each extra 10 cents a litre adds ${h.usd(K.litresFor(KM, K.vehicleL100('suv-small', 'regular')) * 0.1, 0)} a year to the small SUV in the example.</p>
${h.mini('budget', { p: ['u', 'k'], d: { v: ID, u: 'suv-small', k: KM }, t: 'Your yearly fuel budget in Brampton' })}

<h2>From Monday's survey to tomorrow's number</h2>
<p>A yearly budget built on a single survey would go stale within days, which is why the calculator uses the estimate rather than the Monday figure. The site takes the ${MKT} average, then adds the change in the pre-tax Montreal price published each morning by the Régie de l'énergie du Québec, grossed up by Ontario's HST. Both markets are supplied from the same eastern refining and import system, so their wholesale prices tend to move together. Diesel has no such daily signal: its estimate only shifts when Ontario's wholesale (rack) price is newer than the survey, ${d.est.value === d.latest.value ? `which is why it currently reads ${h.cpl(d.est.value)}, the same as Monday` : `and it currently reads ${h.cpl(d.est.value)} against ${h.cpl(d.latest.value)} on Monday`}. The ${h.a('tomorrow', 'tomorrow page')} lists the estimate for every city.</p>

<h2>Brampton or Toronto for the fill-up</h2>
<p>Drivers who work downtown sometimes wonder whether to buy fuel at either end of the trip. The provincial averages do not show a large gap: ${MKT} differs from the blended Toronto figure by ${h.cents(r.latest.value - tor)} at the latest survey. The ${h.a('toronto', 'Toronto page')} explains how that blend is made.</p>

<h2>What the province and Ottawa take</h2>
<p>Ontario's gasoline tax is 9 cents a litre, a rate made permanent on July 1, 2025, and HST at 13% is added on top of the full price. The federal excise tax is suspended for now; its planned return in 2027 is covered on the ${h.a('forecast', 'price outlook page')}.</p>
${taxTable(h, ID, 'regular', r.est.value)}

<h2>The last Monday surveys</h2>
<p>Week-to-week moves in this market are visible in the published series, which is open data.</p>
${histTable(h, ID)}
`,
  },
});
