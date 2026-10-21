import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'london';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brP = K.cityBreakdown(ID, 'premium', pr.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const spread = pr.latest.value - r.latest.value;
/** Exemple de kilométrage et de consommation (voiture intermédiaire, médiane RNCan). */
const KM = 15000, Q = K.vehicleL100('midsize', 'regular');
const extraYear = K.fillCost(K.litresFor(KM, Q), spread);
const CORR = ['windsor', 'london', 'kitchener', 'toronto'];
const corr = CORR.map((id) => ({ id, p: K.fuelOf(id, 'regular')!.latest.value }));
const w = K.fuelOf('windsor', 'regular')!.latest.value;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 108, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['windsor', 'kitchener', 'toronto', 'tomorrow', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-london-ontario',
    nav: 'London', card: 'London survey, premium against regular, the 401 corridor',
    title: 'Gas Prices London Ontario 2026: Regular, Premium, Diesel',
    description: 'Gas prices in London, Ontario in 2026: the weekly survey for regular, premium and diesel, tomorrow’s estimate, the premium gap and the Highway 401 corridor.',
    h1: 'Gas prices in London, Ontario',
    intro: `Regular gasoline in London averaged ${c(r.latest.value)} at the ${E.day(r.latest.date)} survey and is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}.`,
    resume: `London is surveyed as its own market by the Government of Ontario, which records self-serve prices there every Monday for three fuels. At the ${K.when(r, 'en')}, regular gasoline averaged ${c(r.latest.value)}, premium ${c(pr.latest.value)} and diesel ${c(d.latest.value)}, taxes included, so premium cost ${c(spread)} more than regular. Since the province publishes only once a week, the site moves Monday's figure forward with the pre-tax change in the Montreal survey that the Régie de l'énergie du Québec posts every morning, and adds HST; for ${E.day(K.TOMORROW)} that gives ${c(r.est.value)} for regular. Replayed on ${r.bt?.n ?? 0} past weeks of the London series, the estimate missed the next survey by ${c(r.bt?.mae ?? 0)} on average, while repeating the old price missed by ${c(r.bt?.maeNaive ?? 0)}. Out of a litre of regular, ${E.p(br.taxShare)} is tax, from Ontario's 9-cent gasoline tax and the 13% HST, the federal excise being suspended since April 20, 2026.`,
    faqs: [
      { q: 'How much more does premium gas cost in London, Ontario?', a: `At the latest survey premium was ${c(spread)} above regular in London. For a mid-size car rated at the class median and driven ${E.n(KM)} km a year, that gap adds up to ${K.dollars(extraYear, 'en', 0)} over the year. The owner's manual says whether premium is required or only recommended for your engine.` },
      { q: 'Is gas cheaper in London or in Windsor?', a: `Both have their own market in the Ontario survey. At the latest one London was at ${c(r.latest.value)} and Windsor at ${c(w)}, a gap of ${K.cents(w - r.latest.value, 'en')} for Windsor. The order changes from week to week, which the comparison calculator on this page shows for the latest data.` },
      { q: 'Does London, Ontario have its own official gas price?', a: `Yes. London is one of the markets that the Government of Ontario names in its weekly fuel price survey, with separate averages for regular, premium and diesel. That makes it different from cities such as Kitchener-Waterloo or Hamilton, which only appear in the broader southern Ontario average.` },
    ],
    body: (h) => `
<h2>London's weekly survey</h2>
<p>London appears under its own name in the provincial survey, so the figures below describe the city's stations rather than a regional mix. Each line gives the survey date, the estimate the method expects for ${h.day(K.TOMORROW)} and the size of its past errors.</p>
${facts(h, ID)}

<h2>Premium or regular in London</h2>
<p>The price gap between grades in London was ${h.cpl(spread)} at the latest survey. Very little of that is tax: the Ontario gasoline tax is 9 cents a litre on both grades, so only the HST, charged as a percentage, grows with the higher price. At the survey prices a litre of premium carries ${h.cpl(brP.salesTax)} of HST against ${h.cpl(br.salesTax)} for regular. The rest of the gap is set in the refinery market for high-octane blending components.</p>
<p>Over a year the difference becomes visible. With a mid-size car at the Natural Resources Canada class median of ${h.n(Q, 1)} L/100 km and ${h.n(KM)} km, a round example, choosing premium costs ${h.usd(extraYear, 0)} more. The owner's manual states whether the engine requires premium or only recommends it, which is the question to settle before paying the gap. Try your own numbers on a fill-up below.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(pr.latest.value * 10) / 10, r: K.P.tank.midsize }, t: 'A premium fill-up in London' })}

<h2>Along Highway 401</h2>
<p>London lies on Highway 401 between ${h.a('windsor', 'Windsor')} and ${h.a('toronto', 'Toronto')}, with ${h.a('kitchener', 'Kitchener-Waterloo')} on the way east. Each place is described by a different line of the provincial survey, which gives a quick view of the corridor on the latest Monday:</p>
${h.table(['City', 'Regular', 'Ontario figure used'], corr.map((x) => [K.cityName(x.id, 'en'), h.cpl(x.p), K.city(x.id).proxy ? K.proxyName(K.city(x.id).proxy!, 'en') : x.id === 'toronto' ? 'Toronto West and East, mean' : 'Own market']), `Regular gasoline, ${h.when(r)}.`, ['l', 'r', 'l'])}
<p>On this survey the spread between the cheapest and the dearest line of the corridor was ${h.cpl(Math.max(...corr.map((x) => x.p)) - Math.min(...corr.map((x) => x.p)))}. On a single long drive that is worth less than a detour, but if you pass through several of these cities regularly the ranking tells you where an average fill-up is cheapest.</p>
${h.mini('comparer', { p: ['w'], d: { v: ID, w: 'windsor' }, t: 'London against Windsor' })}

<h2>Tomorrow's figure for London, and diesel</h2>
<p>For regular and premium, the estimate for ${h.day(K.TOMORROW)} starts from Monday's London average and adds the movement since then in the eastern wholesale market, read through the Régie de l'énergie du Québec's daily survey with its taxes removed. Nine weeks out of ten in the replay, the regular estimate landed within ${h.cpl(r.bt?.p90 ?? 0)} of the next survey. Diesel is handled differently: no daily public price exists for it in the data the site uses, so its estimate waits for Ontario's wholesale (rack) series, published about a week late. At the moment the diesel estimate is ${h.cpl(d.est.value)}, against ${h.cpl(d.latest.value)} at the survey. The ${h.a('diesel', 'diesel page')} goes into the separate market for that fuel.</p>

<h2>Taxes in a London litre</h2>
<p>A litre of regular in London carries the same taxes as anywhere in Ontario: 9 cents of provincial gasoline tax and 13% HST on the full price. The federal excise line is at zero while the suspension lasts.</p>
${taxTable(h, ID)}

<h2>London surveys, week by week</h2>
<p>The Ontario series is open data, so the recent London surveys are reproduced here. For the tomorrow estimate in every city, see the ${h.a('tomorrow', 'tomorrow page')}; for the order of all cities, the ${h.a('cheapest', 'ranking')}.</p>
${histTable(h, ID)}
`,
  },
});
