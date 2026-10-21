import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'kitchener';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const brD = K.cityBreakdown(ID, 'diesel', d.latest.value, K.TOMORROW, 'en');
const brR = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const usd0 = (x: number) => K.dollars(x, 'en', 0);
const MKT = K.proxyName(K.city(ID).proxy!, 'en');
/** Kilométrage d'exemple (valeur de départ des simulateurs), pas une statistique. */
const KM = 20000;
const qG = K.vehicleL100('suv-standard', 'regular'), qD = K.vehicleL100('suv-standard', 'diesel');
const yG = K.fillCost(K.litresFor(KM, qG), r.est.value), yD = K.fillCost(K.litresFor(KM, qD), d.est.value);
const qPG = K.vehicleL100('pickup-standard', 'regular'), qPD = K.vehicleL100('pickup-standard', 'diesel');
const yPG = K.fillCost(K.litresFor(KM, qPG), r.est.value), yPD = K.fillCost(K.litresFor(KM, qPD), d.est.value);
// Prix du diesel au-dessus duquel le diesel coûte plus cher au kilomètre que l'essence (VUS standard).
const breakEven = r.est.value * qG / qD;
const nModelsD = K.VEHICLES['suv-standard']?.diesel?.models ?? 0;
const cheaperDiesel = yD < yG;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 105, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['hamilton', 'london', 'diesel', 'tomorrow'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-kitchener',
    nav: 'Kitchener-Waterloo', card: 'Diesel and gasoline, SUV fuel budget, southern Ontario figure',
    title: 'Gas Prices Kitchener 2026: Diesel and SUV Fuel Budget',
    description: 'Gas and diesel prices in Kitchener-Waterloo in 2026: the southern Ontario average, tomorrow’s estimate and what a standard SUV costs to run on gas or diesel.',
    h1: 'Gas and diesel prices in Kitchener-Waterloo',
    intro: `In Kitchener-Waterloo diesel stood at ${c(d.latest.value)} and regular at ${c(r.latest.value)} on the ${E.day(r.latest.date)} southern Ontario average.`,
    resume: `Kitchener-Waterloo is not surveyed by name in the Government of Ontario's weekly fuel price report, so the official figure that applies to it is ${MKT}. At the ${K.when(d, 'en')}, that average put diesel at ${c(d.latest.value)} and regular gasoline at ${c(r.latest.value)}, a gap of ${c(d.latest.value - r.latest.value)}, taxes included. Regular is expected at ${c(r.est.value)} on ${E.day(K.TOMORROW)} once the wholesale move since Monday is added; diesel has no daily public signal, so its estimate stays at ${c(d.est.value)} until the provincial rack price catches up. Replayed over ${d.bt?.n ?? 0} weeks, the diesel method missed by ${c(d.bt?.mae ?? 0)} on average and the gasoline one by ${c(r.bt?.mae ?? 0)}. For a standard SUV driven ${E.n(KM)} km, the class medians from Natural Resources Canada give ${usd0(yG)} a year on gasoline and ${usd0(yD)} on diesel at those prices. Taxes take ${E.p(brD.taxShare)} of a litre of diesel: Ontario's 9 cents plus 13% HST, with the federal excise of 4 cents suspended since April 20, 2026.`,
    faqs: [
      { q: 'What is the diesel price in Kitchener-Waterloo this week?', a: `The latest official figure is ${c(d.latest.value)}, ${MKT} for diesel at the ${K.when(d, 'en')}. The province does not survey Kitchener-Waterloo on its own, so this is the regional average. A given station in Kitchener, Waterloo or Cambridge can sit several cents away from it, so the price on the sign is what to enter in the fill-up calculator.` },
      { q: 'Is a diesel SUV cheaper to run than a gasoline one in Kitchener?', a: `${cheaperDiesel ? 'At current prices, yes, slightly' : 'At current prices, no'}: over ${E.n(KM)} km the diesel class median costs ${usd0(yD)} a year against ${usd0(yG)} for gasoline. The answer turns on the price gap. Diesel wins only while it stays below about ${c(breakEven)} with regular at today's estimate, and only ${nModelsD} standard SUV models in the 2026 ratings run on diesel.` },
      { q: 'Why does the Kitchener diesel estimate not change from Monday?', a: `The gasoline estimate moves with the daily Montreal survey, which only covers regular gasoline. For diesel the site can only use Ontario's wholesale (rack) price, published with about a week of delay. When that series has nothing newer than the Monday survey, the honest estimate is the survey itself, which is what the page shows.` },
    ],
    body: (h) => `
<h2>Kitchener-Waterloo in the Ontario survey</h2>
<p>The provincial survey names a few markets and then gives broader averages. Kitchener-Waterloo is in the broad one for the south of the province, ${MKT}, and every number below comes from it, with its date and its source.</p>
${facts(h, ID)}
<p>The two fuels are estimated in different ways. Regular gasoline is carried from Monday to ${h.day(K.TOMORROW)} with the daily Montreal survey of the Régie de l'énergie du Québec, whose pre-tax change tracks the wholesale market that also supplies southern Ontario; in the replay its miss stayed under ${h.cpl(r.bt?.p90 ?? 0)} nine weeks out of ten. The daily Québec survey covers regular gasoline only, so for diesel the site waits for Ontario's rack series, which lags by about a week. That is why the diesel column often shows no change, and why its past error, ${h.cpl(d.bt?.mae ?? 0)} on average, is wider than the gasoline one. The ${h.a('tomorrow', 'tomorrow page')} gives both for every city.</p>

<h2>Diesel in Kitchener-Waterloo</h2>
<p>Diesel is priced off a different refinery stream than gasoline, middle distillates rather than light products, and in this survey it is ${h.cpl(d.latest.value - r.latest.value)} above regular. Tax is not the reason. Ontario's fuel tax is 9 cents a litre on both, and the federal excise, when it applies, is lower on diesel, 4 cents against 10. The breakdown of a litre of diesel at the survey price shows where the money goes.</p>
${taxTable(h, ID, 'diesel')}
<p>Compared with a litre of regular, which carries ${h.cpl(brR.salesTax)} of HST, a litre of diesel carries ${h.cpl(brD.salesTax)}, simply because HST is a percentage of a higher price. The ${h.a('diesel', 'diesel page')} explains the separate market and how its estimate is built for every city.</p>

<h2>A standard SUV on gasoline or on diesel</h2>
<p>In the 2026 ratings, diesel versions are listed for ${h.n(nModelsD)} standard SUVs and ${h.n(K.VEHICLES['pickup-standard']?.diesel?.models ?? 0)} full-size pickups. Natural Resources Canada's 2026 ratings give a median combined consumption of ${h.n(qG, 1)} L/100 km for standard SUVs on gasoline and ${h.n(qD, 1)} L/100 km for the ${h.n(nModelsD)} diesel ones. Using the estimates for ${h.day(K.TOMORROW)} and ${h.n(KM)} km a year, a round example distance:</p>
${h.table(['Vehicle', 'L/100 km', 'Price used', `Fuel for ${h.n(KM)} km`], [['Standard SUV, gasoline', h.n(qG, 1), h.cpl(r.est.value), h.usd(yG, 0)], ['Standard SUV, diesel', h.n(qD, 1), h.cpl(d.est.value), h.usd(yD, 0)], ['Full-size pickup, gasoline', h.n(qPG, 1), h.cpl(r.est.value), h.usd(yPG, 0)], ['Full-size pickup, diesel', h.n(qPD, 1), h.cpl(d.est.value), h.usd(yPD, 0)]], `Kitchener-Waterloo, ${MKT}, medians of Natural Resources Canada 2026 ratings.`, ['l', 'r', 'r', 'r'])}
<p>The fuel saving of a diesel engine is real, but in Ontario right now it is ${cheaperDiesel ? 'enough to offset' : 'not enough to offset'} the higher price at the pump. The break-even sits at about ${h.cpl(breakEven)} for diesel with regular at its current estimate; below that line the diesel SUV is cheaper per kilometre, above it the gasoline one is. That comparison covers fuel only; purchase price, maintenance and resale value are left out.</p>
${h.mini('budget', { p: ['u', 'k', 'q'], d: { v: ID, u: 'suv-standard', k: KM }, t: 'An SUV fuel budget in Kitchener-Waterloo' })}

<h2>When the diesel excise comes back</h2>
<p>Finance Canada's draft legislation (proposed, not enacted) restores the federal excise on diesel at 2 cents on February 1, 2027 and 4 cents on April 1, 2027, against 5 and 10 cents for gasoline. With HST on top, the return weighs less on a diesel driver per litre.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'ON', c: 'diesel' }, t: 'Diesel excise return for an Ontario driver' })}

<h2>Recent surveys for Kitchener-Waterloo</h2>
${histTable(h, ID)}
<p>The same southern average serves ${h.a('hamilton', 'Hamilton')}; ${h.a('london', 'London')}, further west on Highway 401, has its own surveyed market.</p>
`,
  },
});
