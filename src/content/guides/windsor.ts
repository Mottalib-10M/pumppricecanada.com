import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'windsor';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const fixedTax = br.lines.reduce((a, x) => a + x.cpl, 0);
const HV = K.HIST[ID]?.regular ?? [];
const hi = HV.length ? HV.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
const lo = HV.length ? HV.reduce((a, b) => (b[1] < a[1] ? b : a)) : null;
const lon = K.fuelOf('london', 'regular')!.latest.value;
const onAvg = (() => { const ids = K.PRICED_IDS.filter((id) => K.city(id).prov === 'ON' && !K.city(id).proxy); return ids.reduce((a, id) => a + K.fuelOf(id, 'regular')!.latest.value, 0) / ids.length; })();
const dGain = d.bt ? d.bt.maeNaive - d.bt.mae : 0;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 109, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['london', 'toronto', 'tomorrow', 'diesel', 'taxes'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-windsor',
    nav: 'Windsor', card: 'Windsor survey, the Detroit question, diesel',
    title: 'Gas Prices Windsor 2026: Ontario Survey and Border Facts',
    description: 'Gas prices in Windsor, Ontario in 2026: the weekly provincial survey, tomorrow’s estimate, what to check before filling up in Detroit and the tax in each litre.',
    h1: 'Gas prices in Windsor, across from Detroit',
    intro: `Windsor's regular gasoline averaged ${c(r.latest.value)} at the ${E.day(r.latest.date)} Ontario survey; the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `Windsor has its own line in the Government of Ontario's Monday survey of self-serve stations, so its gas price is measured directly rather than borrowed from a regional average. The ${K.when(r, 'en')} found regular gasoline at ${c(r.latest.value)} and diesel at ${c(d.latest.value)}, taxes included. To bridge the days between surveys, the site adds the pre-tax change in the Régie de l'énergie du Québec's daily Montreal price, with HST, which puts regular at ${c(r.est.value)} for ${E.day(K.TOMORROW)}. Over ${r.bt?.n ?? 0} replayed weeks that estimate erred by ${c(r.bt?.mae ?? 0)} on average, compared with ${c(r.bt?.maeNaive ?? 0)} for assuming no change. Of the pump price, ${E.p(br.taxShare)} is tax: ${E.n(fixedTax, 0)} cents of Ontario gasoline tax and ${c(br.salesTax)} of 13% HST, the federal excise having been suspended since April 20, 2026. Prices on the Detroit side are quoted in US dollars per US gallon and are not covered by any Canadian survey, so this page does not publish them.`,
    faqs: [
      { q: 'Is it cheaper to buy gas in Detroit than in Windsor?', a: 'This site does not publish US prices, so it cannot answer with a figure. To compare yourself, convert the Detroit price from US dollars per gallon to Canadian cents per litre using the day’s exchange rate and the litres in a US gallon, then count the bridge or tunnel toll and the time at the border. A few cents per litre of apparent saving can disappear once all of that is counted.' },
      { q: 'How does the Windsor gas price compare with the rest of Ontario?', a: `At the latest survey Windsor was at ${c(r.latest.value)}, against ${c(onAvg)} for the mean of the Ontario cities on this site that have their own surveyed market, and ${c(lon)} in London. Windsor's position in that order changes from week to week, so check the comparison on the page for the current gap.` },
      { q: 'How reliable is the diesel estimate for Windsor?', a: `Less than the gasoline one. Replayed over ${d.bt?.n ?? 0} weeks, it missed by ${c(d.bt?.mae ?? 0)} on average, ${dGain > 0.05 ? `${c(dGain)} better than` : 'no better than'} simply repeating the last survey. The daily Québec survey that drives the gasoline estimate only covers regular, so diesel depends on Ontario's wholesale series, which arrives about a week late.` },
    ],
    body: (h) => `
<h2>Windsor's own line in the survey</h2>
<p>Windsor is among the Ontario cities that the province surveys under their own name. The numbers below therefore describe Windsor's stations, not a wider average, and each one carries the date of the Monday survey it comes from.</p>
${facts(h, ID)}
<p>Over the last ${h.n(HV.length)} surveys, Windsor's regular price ran from ${lo ? `${h.cpl(lo[1])} on ${h.day(lo[0])}` : ''} to ${hi ? `${h.cpl(hi[1])} on ${h.day(hi[0])}` : ''}. That range is a reminder that a single Monday figure is a snapshot, and that a one-off comparison with another city can say more about the week than about the city.</p>

<h2>The Detroit question</h2>
<p>Windsor faces Detroit across the Detroit River, and filling up on the other side is a natural question. This site has no US price data and does not publish any, so it cannot settle it with a number. What it can do is list what a fair comparison needs. US pumps show US dollars per US gallon, so the price has to be converted twice, for the currency at the day's rate and for the volume, a US gallon being several litres. The crossing itself has a cost: the bridge or tunnel toll, and time at the border both ways. A gap of a few cents a litre on one tank can vanish once those are counted.</p>
<p>On the Canadian side, the tax content of a Windsor litre is known precisely. Ontario's gasoline tax is ${h.n(fixedTax, 0)} cents a litre and HST at 13% adds ${h.cpl(br.salesTax)} at the survey price; the 10-cent federal excise is suspended until at least January 31, 2027.</p>
${taxTable(h, ID)}

<h2>Windsor against London</h2>
<p>For drivers heading east on Highway 401, ${h.a('london', 'London')} is the next surveyed market. On the latest survey it was at ${h.cpl(lon)}, so ${h.cents(lon - r.latest.value)} relative to Windsor.</p>
${h.mini('comparer', { p: ['w', 'c'], d: { v: ID, w: 'london' }, t: 'Windsor against London' })}

<h2>Diesel and the estimate</h2>
<p>Diesel in Windsor was ${h.cpl(d.latest.value - r.latest.value)} above regular at the survey. Its estimate is the weakest on the page because no daily price signal exists for diesel in the sources the site uses; it changes only when Ontario's rack price is more recent than the survey. The regular estimate does better, with nine misses out of ten below ${h.cpl(r.bt?.p90 ?? 0)} in the replay. Details for diesel are on the ${h.a('diesel', 'diesel page')} and the daily figures on the ${h.a('tomorrow', 'tomorrow page')}.</p>

<h2>Windsor surveys over the last weeks</h2>
${histTable(h, ID)}
<p>The weekly series comes from the Government of Ontario's open data, which allows it to be shown in full. Tax rates in other provinces are compared on the ${h.a('taxes', 'tax page')}.</p>
`,
  },
});
