import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'barrie';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const usd = (x: number, dd = 2) => K.dollars(x, 'en', dd);
const MKT = K.proxyName(K.city(ID).proxy!, 'en');
const tor = K.fuelOf('toronto', 'regular')!.latest.value;
/** Exemple : un plein de VUS (réservoir d'exemple du site) chaque semaine. */
const TANK = K.P.tank.suv;
const PER_MONTH = TANK * 52 / 12;
const month = K.fillCost(PER_MONTH, r.est.value);
const rate = K.salesRate('ON');
const exHalf = K.exciseAt(K.EXCISE, '2027-02-01', 'regular') * (1 + rate);
const exFull = K.exciseAt(K.EXCISE, '2027-04-01', 'regular') * (1 + rate);
const gapTor = r.latest.value - tor;
const rel = Math.abs(gapTor) < 0.05 ? 'level with' : `${K.cpl(Math.abs(gapTor), 'en')} ${gapTor < 0 ? 'below' : 'above'}`;
const HV = (K.HIST[ID]?.regular ?? []).map(([, v]) => v);
const range = HV.length ? Math.max(...HV) - Math.min(...HV) : 0;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 106, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['toronto', 'brampton', 'hamilton', 'forecast', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-barrie',
    nav: 'Barrie', card: 'Highway 400 commute, monthly budget, proposed excise return',
    title: 'Gas Prices Barrie 2026: Highway 400 Commute and Budget',
    description: 'Gas prices in Barrie for 2026: the southern Ontario average, tomorrow’s estimate, a monthly budget for a Highway 400 commute and the proposed excise return.',
    h1: 'Gas prices in Barrie and the Highway 400 budget',
    intro: `Barrie's reference price, ${MKT}, was ${c(r.latest.value)} for regular on ${E.day(r.latest.date)}, with ${c(r.est.value)} estimated for ${E.day(K.TOMORROW)}.`,
    resume: `There is no official Barrie gas price: the Government of Ontario's Monday survey of self-serve stations does not list the city, and the published figure that covers it is ${MKT}. At the ${K.when(r, 'en')}, it stood at ${c(r.latest.value)} for regular and ${c(pr.latest.value)} for premium, taxes included, which is ${rel} the blended Toronto figure on the same day. For ${E.day(K.TOMORROW)} the estimate is ${c(r.est.value)}, obtained by adding to Monday's average the wholesale change since then in the Régie de l'énergie du Québec's daily Montreal survey; over ${r.bt?.n ?? 0} replayed weeks its average error was ${c(r.bt?.mae ?? 0)}, where a no-change guess erred by ${c(r.bt?.maeNaive ?? 0)}. For a driver who fills a ${TANK}-litre tank once a week, that price comes to about ${usd(month, 0)} a month. Taxes are ${E.p(br.taxShare)} of the pump price (Ontario's 9 cents and 13% HST), and the federal excise suspended since April 20, 2026 is due back in 2027.`,
    faqs: [
      { q: 'Is gas cheaper in Barrie than in Toronto?', a: `On the published averages the difference is small. The southern Ontario figure used for Barrie was ${c(r.latest.value)} at the latest survey and the Toronto blend ${c(tor)}, so the Barrie figure was ${rel} Toronto's. That compares a regional average with a city one, so treat it as a rough guide rather than a rule for where to fill up.` },
      { q: 'How much does a weekly Highway 400 commute from Barrie cost in fuel?', a: `It depends on your distance and vehicle, so the page gives an example: one ${TANK}-litre fill-up a week is about ${E.n(PER_MONTH)} litres a month, or ${usd(month, 0)} at tomorrow's estimate. The calculator lets you replace that with your own kilometres and consumption to get a yearly and monthly figure.` },
      { q: 'How would the proposed excise return change gas prices in Barrie?', a: `Under Finance Canada's draft legislation (proposed, not enacted) the federal excise on gasoline returns at 5 cents on February 1, 2027 and 10 cents on April 1, 2027. With 13% HST charged on top, that is ${K.cents(exHalf, 'en', 2)} and then ${K.cents(exFull, 'en', 2)} a litre in Barrie, all else being equal, or ${usd(exFull * PER_MONTH / 100, 0)} a month for the weekly fill-up in the example.` },
    ],
    body: (h) => `
<h2>Where Barrie's figure comes from</h2>
<p>Barrie sits on Highway 400 north of Toronto, at the edge of Lake Simcoe, outside both of the Toronto markets in the provincial survey. The province publishes ${MKT} every Monday, and that is the number that applies here. It is an average of a wide area, so local stations can be cheaper or more expensive than it in a given week.</p>
${facts(h, ID)}

<h2>A Highway 400 commute in a monthly budget</h2>
<p>For a driver who heads down the 400 to the Greater Toronto Area several times a week, the useful unit is the month. Take one ${TANK}-litre fill-up a week as a simple example. That is about ${h.n(PER_MONTH)} litres a month, which at the estimate for ${h.day(K.TOMORROW)} comes to ${h.usd(month, 0)}. Each cent per litre moves that monthly bill by ${h.usd(PER_MONTH / 100)}, and over the last ${h.n(HV.length)} surveys the average ranged across ${h.cpl(range)}, which on this budget is a difference of ${h.usd(PER_MONTH * range / 100, 0)} a month between the cheapest and the dearest week.</p>
<p>A budget built this way is easier to hold to than a price watch. Knowing that the commute costs roughly a fixed amount a month, and how much a ten-cent move shifts it, tells you whether a cheaper station on the way is worth the stop. Enter your own vehicle and yearly kilometres below; the result also gives the cost per 100 km.</p>
${h.mini('budget', { p: ['u', 'k', 'q'], d: { v: ID, u: 'suv-small', k: 25000 }, t: 'A Barrie commuter’s fuel budget' })}

<h2>Barrie against Toronto</h2>
<p>Commuters can fill up at either end of the trip. The published averages put the southern Ontario figure ${rel} the Toronto blend at the latest survey. On a ${TANK}-litre fill-up that is ${h.usd(Math.abs(gapTor) * TANK / 100)}, rarely worth a detour.</p>
${h.mini('comparer', { p: ['w'], d: { v: ID, w: 'toronto' }, t: 'Barrie against Toronto' })}

<h2>The proposed excise return in the commuter's budget</h2>
<p>The federal excise tax on gasoline, 10 cents a litre, has been suspended since April 20, 2026. Finance Canada's draft legislation (proposed, not enacted) extends the suspension to January 31, 2027, brings back 5 cents on February 1, 2027 and the full 10 cents on April 1, 2027. HST is charged on top of it, so in Barrie the return is worth ${h.cpl(exHalf, 2)} and then ${h.cpl(exFull, 2)} if nothing else moves. For the weekly fill-up in the example, that adds ${h.usd(exFull * PER_MONTH / 100, 0)} a month from April 2027. The ${h.a('forecast', 'outlook page')} follows the schedule.</p>
${h.mini('accise', { p: ['m'], d: { pr: 'ON', m: Math.round(PER_MONTH) }, t: 'What the excise return adds each month' })}

<h2>Taxes in a Barrie litre today</h2>
<p>Until then, a litre of regular in Barrie carries Ontario's 9-cent gasoline tax and HST at 13% on the whole price, nothing more. The excise line reads zero for as long as the suspension lasts.</p>
${taxTable(h, ID)}

<h2>The last southern Ontario surveys</h2>
${histTable(h, ID)}
<p>${h.a('hamilton', 'Hamilton')} and ${h.a('kitchener', 'Kitchener-Waterloo')} share this average; the ${h.a('cheapest', 'ranking')} shows where it falls among Canadian cities.</p>
`,
  },
});
