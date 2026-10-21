import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'oshawa';
const W = 'mississauga'; // même série que Toronto Ouest
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const rw = K.fuelOf(W, 'regular')!, dw = K.fuelOf(W, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const EAST = K.proxyName(K.city(ID).proxy!, 'en');
const WEST = K.proxyName(K.city(W).proxy!, 'en');
// Semaines communes des deux séries publiées (HIST) : combien de fois l'Est a été moins cher que l'Ouest.
const he = new Map(K.HIST[ID]?.regular ?? []), hw = K.HIST[W]?.regular ?? [];
const pairs = hw.filter(([dt]) => he.has(dt)).map(([dt, v]) => [dt, he.get(dt)! - v] as [string, number]);
const nE = pairs.filter(([, g]) => g < -0.05).length, nW = pairs.filter(([, g]) => g > 0.05).length;
const avgGap = pairs.length ? pairs.reduce((a, [, g]) => a + g, 0) / pairs.length : 0;
const gapNow = r.latest.value - rw.latest.value;
const side = (g: number) => (g < -0.05 ? `${EAST} was cheaper by ${K.cpl(-g, 'en')}` : g > 0.05 ? `${WEST} was cheaper by ${K.cpl(g, 'en')}` : 'the two halves were level');

export default defineGuide({
  id: ID, group: groupOf(ID), order: 103, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['toronto', 'mississauga', 'brampton', 'tomorrow', 'taxes'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-oshawa',
    nav: 'Oshawa', card: 'Toronto East average, East against West, tomorrow',
    title: 'Gas Prices Oshawa 2026: Toronto East Average vs West',
    description: 'Gas prices in Oshawa and Durham Region in 2026: the Toronto East survey, how it compares with Toronto West week by week, tomorrow’s estimate and the tax share.',
    h1: 'Gas prices in Oshawa: Toronto East against West',
    intro: `Oshawa takes the Toronto East average, ${c(r.latest.value)} for regular at the ${E.day(r.latest.date)} survey, and ${c(r.est.value)} is the estimate for ${E.day(K.TOMORROW)}.`,
    resume: `The Government of Ontario does not publish an Oshawa average. Its weekly survey splits the Greater Toronto Area into two markets, and Durham Region falls into ${EAST}, so the figures here are that market's. At the ${K.when(r, 'en')}, regular gasoline averaged ${c(r.latest.value)} and diesel ${c(d.latest.value)} with all taxes. On the same date ${WEST}, the market used for Mississauga and Brampton, was at ${c(rw.latest.value)}: ${side(gapNow)}. The site's estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}, built from Monday's survey and the wholesale change that the daily Québec survey has shown since; tried on ${r.bt?.n ?? 0} past weeks, it missed the next survey by ${c(r.bt?.mae ?? 0)} on average, compared with ${c(r.bt?.maeNaive ?? 0)} for carrying the old price. Tax is ${E.p(br.taxShare)} of each litre, made of Ontario's 9-cent gasoline tax and 13% HST; the federal excise has been suspended since April 20, 2026.`,
    faqs: [
      { q: 'Which official gas price applies to Oshawa?', a: `The Toronto East average from the Government of Ontario's Monday survey of self-serve stations. Oshawa and the rest of Durham Region are not surveyed separately, so this page uses the eastern half of the Toronto market and says so in every table. Individual stations in Oshawa, Whitby or Ajax can post prices a little above or below that average.` },
      { q: 'Is gas usually cheaper in Oshawa than in Mississauga?', a: `Over the ${pairs.length} recent surveys published for both markets, ${EAST} came in cheaper ${nE} times and ${WEST} ${nW} times, with an average gap of ${K.cents(avgGap, 'en')} for the East. The gap is small and changes sign, so it is not a reason to plan a trip across the region for fuel.` },
      { q: 'Why is Oshawa diesel priced so far above regular gasoline?', a: `At the latest survey diesel in ${EAST} was ${c(d.latest.value)}, which is ${c(d.latest.value - r.latest.value)} above regular. Taxes do not explain it: Ontario charges 9 cents a litre on both fuels. The difference comes from the distillate market, which has its own supply and demand, and it is passed on with HST at the pump.` },
    ],
    body: (h) => `
<h2>Durham Region in the provincial survey</h2>
<p>The province publishes averages for markets, not for municipalities. For the area around Lake Ontario's north shore east of the city, from Pickering out to Oshawa, the relevant market is ${EAST}. Every figure in this table belongs to it and is dated by the survey that produced it.</p>
${facts(h, ID)}

<h2>Toronto East against Toronto West</h2>
<p>Because the Toronto page blends the two halves of the region, the comparison between them gets lost there. Here it is laid out on its own. On the latest survey, ${side(gapNow)}. For diesel the two markets stood at ${h.cpl(d.latest.value)} and ${h.cpl(dw.latest.value)}.</p>
${h.table(['Survey', EAST, WEST, 'East minus West'], [...pairs].reverse().map(([dt, g]) => [h.day(dt), h.cpl(he.get(dt)!), h.cpl(he.get(dt)! - g), h.cents(g)]), 'Regular gasoline, Government of Ontario weekly survey, most recent first.', ['l', 'r', 'r', 'r'])}
<p>Across those ${h.n(pairs.length)} weeks the East was the cheaper side ${h.n(nE)} times and the West ${h.n(nW)} times. The average difference, ${h.cents(avgGap)} for the East, ${Math.abs(avgGap) < (r.bt?.mae ?? 0) ? 'is smaller than the method’s own typical error on a single week, which says something useful: the two halves of the region move almost in step, and the data files tie both to the same Toronto wholesale (rack) price.' : 'is larger than the method’s typical error on a single week, so the side of the region does matter at the moment, even though both halves are tied to the same Toronto wholesale (rack) price.'} Within one market, the station you pick can matter as much as the regional average.</p>
${h.mini('comparer', { p: ['w', 'c'], d: { v: ID, w: W }, t: 'Toronto East (Oshawa) against Toronto West (Mississauga)' })}

<h2>The estimate for ${h.day(K.TOMORROW)}</h2>
<p>Ontario surveys on Monday and publishes once. To fill the days between, the site takes the pre-tax change in the Montreal market reported each morning by the Régie de l'énergie du Québec and adds it, HST included, to the ${EAST} average. Nine weeks in ten during the replay, the miss stayed under ${h.cpl(r.bt?.p90 ?? 0)}. The rules are described on the ${h.a('method', 'method page')}.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Tomorrow in Oshawa' })}

<h2>The tax in an Oshawa litre</h2>
<p>Ontario taxes gasoline at 9 cents a litre and adds 13% HST to the full price, so at the ${EAST} average the HST alone is ${h.cpl(br.salesTax)}. That HST share is the only tax that moves with the market; the per-litre taxes are set in cents and stay put whatever the price does. The ${h.a('taxes', 'tax page')} compares this with the other provinces.</p>
<p>One change is already on the calendar. The federal excise tax, 10 cents a litre on gasoline before its suspension on April 20, 2026, is due back at half rate on February 1, 2027 and in full on April 1, 2027 under Finance Canada's draft legislation (proposed, not enacted). With HST charged on top, a driver in Durham buying a full tank every week would feel it at every fill-up; the calculator below turns it into a monthly figure.</p>
${h.mini('accise', { p: ['m'], d: { pr: 'ON' }, t: 'The excise return for an Oshawa driver' })}
${taxTable(h, ID)}

<h2>The ${EAST} series</h2>
${histTable(h, ID)}
<p>The weekly series is published under the Open Government Licence of Ontario, which is why the full list can be reproduced here.</p>
`,
  },
});
