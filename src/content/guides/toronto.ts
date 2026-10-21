import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'toronto';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');

export default defineGuide({
  id: ID, group: groupOf(ID), order: 100, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['mississauga', 'brampton', 'oshawa', 'tomorrow', 'taxes'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-toronto',
    nav: 'Toronto', card: 'Weekly Ontario survey, tomorrow’s estimate, fill-up cost',
    title: 'Gas Prices Toronto Today and Tomorrow, Fill-Up Cost 2026',
    description: 'Gas prices in Toronto in 2026: the latest Ontario survey, an estimate for tomorrow with its measured error, what a fill-up costs and how much of a litre is tax.',
    h1: 'Gas prices in Toronto today and tomorrow',
    intro: `Regular gasoline averaged ${c(r.latest.value)} in Toronto at the ${E.day(r.latest.date)} survey; the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `Toronto's official pump price comes from the Government of Ontario, which surveys self-serve stations every Monday and publishes one average for Toronto West and one for Toronto East; this page uses the mean of the two. The latest survey, dated ${E.day(r.latest.date)}, puts regular gasoline at ${c(r.latest.value)} and diesel at ${c(d.latest.value)}, taxes included. Between two Monday surveys the price moves with the wholesale market, so the page carries the figure forward with the daily survey of the Régie de l'énergie du Québec, which follows the same New York Harbor market and is published every morning. For ${E.day(K.TOMORROW)} that gives ${c(r.est.value)}. Replayed over ${r.bt?.n ?? 0} past weeks, this method missed the next Monday survey by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} for simply repeating the last price. Taxes take ${E.p(br.taxShare)} of a litre: Ontario's 9-cent gasoline tax and the 13% HST, the federal excise tax being suspended since April 20, 2026.`,
    faqs: [
      { q: 'Why does Toronto have two official gas price averages?', a: 'The Government of Ontario reports the city as two markets in its weekly survey, Toronto West and Toronto East, each with its own regular, premium and diesel average. Neither is the whole city on its own, so this page takes the mean of the two on every survey date where both are published, and shows that blended figure as the Toronto price.' },
      { q: 'What day of the week do Toronto gas prices change?', a: 'Stations can change their posted price at any hour, and many do so overnight when their supplier changes the wholesale (rack) price. The official Ontario figure, however, is a Monday snapshot. That is why the tomorrow estimate on this page starts from Monday and adds the market movement published since, rather than pretending to know what a given station will post.' },
      { q: 'Is the Toronto price the same in Mississauga and Brampton?', a: 'Ontario does not publish separate averages for Mississauga or Brampton. Both sit in the Toronto West market of the provincial survey, so their pages use the Toronto West average alone, while this Toronto page blends West and East. Real station prices along Highway 401 or in Brampton can still differ by a few cents from the regional average.' },
    ],
    body: (h) => `
<h2>The official figures for Toronto</h2>
<p>Every figure below is dated and comes from a public source. The Ontario survey is weekly, so on a Thursday the newest official number is already three days old; the estimate column is what the published method expects for ${h.day(K.TOMORROW)}.</p>
${facts(h, ID)}
<p>Premium costs ${h.cpl(K.fuelOf(ID, 'premium')!.latest.value - r.latest.value)} more than regular at the latest survey, a spread that comes from the refinery market for higher-octane blends rather than from taxes, which are the same per litre for both grades. Diesel is priced on its own market, and with no daily open signal for it the estimate only moves when the Ontario rack price is newer than the survey.</p>

<h2>How the estimate for tomorrow is built</h2>
<p>The method starts from the Monday average, then asks what the wholesale market has done since. Ontario publishes the Toronto rack price every business day, but with about a week of delay, so on most days it stops before the survey date and cannot add anything. The Régie de l'énergie du Québec publishes its Montréal survey every morning; once its sales taxes and fuel taxes are removed, what is left moves with the same refinery and import market that supplies the Greater Toronto Area. The change in that pre-tax number since Monday, multiplied by 1.13 for HST, is added to Toronto's Monday price.</p>
<p>It is a reasonable signal, not a forecast of what one station on Lake Shore Boulevard will post. Over the weeks replayed, its average miss was ${h.p(r.bt ? 1 - r.bt.mae / r.bt.maeNaive : 0, 0)} smaller than that of the naive guess of "no change". The full rules, including how tax changes are dated, are on the ${h.a('method', 'method page')}.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Tomorrow in Toronto, by fuel' })}

<h2>Where a Toronto litre goes</h2>
<p>At today's price the sales tax alone is ${h.cpl(br.salesTax)}. Ontario's gasoline tax has stayed at 9 cents since it was cut from 14.7 cents in July 2022, and the province made that rate permanent on July 1, 2025. The federal excise tax of 10 cents has been suspended since April 20, 2026; Finance Canada's draft legislation (proposed, not enacted) extends the suspension to January 31, 2027, then brings back half of it in February and March 2027 and all of it on April 1, 2027.</p>
${taxTable(h, ID)}
<p>Whatever remains after taxes pays for the gasoline itself, the pipeline and truck to the station, the wholesaler and the retailer. That share is what changes from week to week; the taxes per litre do not.</p>

<h2>The last weeks in Toronto</h2>
<p>The Ontario series is published under the Open Government Licence, so its recent surveys can be shown in full. They give a sense of how far the price travels in a quarter.</p>
${histTable(h, ID)}

<h2>What a fill-up costs</h2>
<p>A compact car with a 45-litre tank costs ${h.usd(K.fillCost(45, r.latest.value))} to fill at the last survey price, a small SUV with 60 litres ${h.usd(K.fillCost(60, r.latest.value))}. A one-cent move changes those fill-ups by 45 and 60 cents. If you are deciding between filling up today or tomorrow, the gap between the survey and the estimate on a 55-litre fill-up is ${h.usd(Math.abs(r.est.value - r.latest.value) * 0.55)}.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(r.latest.value * 10) / 10 }, t: 'Your fill-up at the Toronto price' })}
<p>Commuters who drive from ${h.a('oshawa', 'Durham Region')} or ${h.a('brampton', 'Peel')} into the city can compare the two regional averages with the ${h.a('cheapest', 'city ranking')}.</p>
`,
  },
});
