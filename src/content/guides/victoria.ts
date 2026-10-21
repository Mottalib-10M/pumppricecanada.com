import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'victoria';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
type Reg = { total: { regular: number; diesel: number }; transit_share: number };
const RG = K.P.taxes.regional as Record<string, Reg>;
const VI = RG['bc-victoria'], TL = RG['bc-translink'];
const me = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const vr = K.fuelOf('vancouver', 'regular')!;
const va = K.cityBreakdown('vancouver', 'regular', vr.latest.value, K.TOMORROW, 'en');
const taxOf = (b: typeof me) => b.salesTax + b.lines.reduce((a, x) => a + x.cpl, 0);
const prodGap = me.product - va.product;
const priceGap = r.latest.value - vr.latest.value;
const brT = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');

export default defineGuide({
  id: ID, group: groupOf(ID), order: 302, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['vancouver', 'surrey', 'kelowna', 'taxes', 'forecast'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-victoria-bc',
    nav: 'Victoria', card: 'Island prices, the 20-cent Victoria fuel tax, excise return',
    title: 'Gas Prices Victoria BC 2026, Island Price and Fuel Tax',
    description: 'Gas prices in Victoria, B.C. in 2026: the Statistics Canada monthly average, today\'s estimate, the 20-cent BC Transit area tax and the gap with Vancouver.',
    h1: 'Gas prices in Victoria, B.C.',
    intro: `Regular gasoline averaged ${c(r.latest.value)} in Victoria in ${mon}; brought to ${E.day(K.TOMORROW)}, the estimate is ${c(r.est.value)}.`,
    resume: `Victoria has its own Statistics Canada series, published monthly, and its latest month is ${mon}: ${c(r.latest.value)} a litre for regular gasoline and ${c(d.latest.value)} for diesel, taxes included. That is ${Math.abs(priceGap) < 0.05 ? 'level with' : `${c(Math.abs(priceGap))} ${priceGap > 0 ? 'above' : 'below'}`} Vancouver the same month, even though a Victoria litre pays ${VI.total.regular} cents of motor fuel tax against ${TL.total.regular} on the mainland: before tax, the island's fuel costs more. The page moves the monthly average to ${E.day(K.TOMORROW)} with the Edmonton wholesale price and dated tax changes, which gives ${c(r.est.value)}; over ${r.bt?.n ?? 0} months of history, this estimate was off by ${c(r.bt?.mae ?? 0)} on average, compared with ${c(r.bt?.maeNaive ?? 0)} for a simple repeat of the last month. Of the ${VI.total.regular} cents, ${VI.transit_share} fund BC Transit in the Victoria region; GST at 5% comes on top, and taxes make up ${E.p(brT.taxShare)} of the estimate.`,
    faqs: [
      { q: 'Why is gas so expensive in Victoria when its tax is lower than Vancouver?', a: 'Victoria\'s motor fuel tax is 20 cents a litre, 7 cents below Metro Vancouver, yet its average pump price can be close to Vancouver\'s. When it is, the difference sits in the product share: once taxes are removed, a litre on southern Vancouver Island costs more than one on the mainland. No official source breaks that pre-tax cost down by city, so the page shows the gap without guessing its causes.' },
      { q: 'What is the BC Transit gas tax in Victoria?', a: 'In the Victoria regional transit area, 5.5 cents of every litre of gasoline go to BC Transit. Added to the 14.5-cent provincial motor fuel tax, that makes 20 cents per litre, before GST. The rate is the same for every station in the area, so it does not explain price differences between stations, only the gap with the rest of the province.' },
      { q: 'How much would the proposed federal excise return add to gas in Victoria?', a: `Under Finance Canada\'s draft legislation (proposed, not enacted), the 10-cent federal excise tax on gasoline, suspended since April 20, 2026, returns at half rate on February 1, 2027 and in full on April 1, 2027. With 5% GST on top, the full rate adds ${K.cpl(K.exciseAt(K.EXCISE, '2027-04-01', 'regular') * (1 + K.salesRate('BC')), 'en', 2)} per litre in B.C. The calculator on this page turns that into dollars a month for your own consumption.` },
    ],
    body: (h) => `
<h2>Victoria's own monthly series</h2>
<p>Victoria is a separate line in the Statistics Canada table of retail fuel prices. It is a monthly average, so the newest figure always trails by several weeks; on ${h.day(K.TODAY)} it is the ${mon} average. The table gives each fuel with that month and the estimate for ${h.day(K.TOMORROW)}.</p>
${facts(h, ID)}
<p>The estimate starts from the month and adds the change in the Edmonton rack price published since, plus GST, and any tax change dated in between. ${r.est.taxDelta ? `A dated tax change worth ${h.cents(r.est.taxDelta)} is included this time.` : 'No B.C. tax changed between that month and tomorrow, so for Victoria the estimate moves with the wholesale market only.'}</p>

<h2>Island price, lower tax</h2>
<p>The two B.C. cities with a transit fuel tax make a useful comparison, because their tax is known to the tenth of a cent. At the ${mon} averages, tax takes ${h.cpl(taxOf(me))} of a Victoria litre and ${h.cpl(taxOf(va))} of a Vancouver litre. ${Math.abs(prodGap) < 0.05 ? 'What remains, the product and margins, is the same in both cities.' : `What remains, the product and margins, is ${h.cpl(Math.abs(prodGap))} ${prodGap > 0 ? 'higher' : 'lower'} in Victoria.`} That pre-tax gap is what drivers on the island pay for their market, and it explains why a lower tax does not always mean a lower pump price.</p>
${h.mini('comparer', { p: ['w'], d: { v: ID, w: 'vancouver' }, t: 'Victoria against the mainland' })}
<p>The comparison uses the estimates for both cities, built from the same Edmonton rack price, so the gap it shows is the one between the two monthly averages carried forward. For cities in the Okanagan and the north, which pay neither transit levy, see the ${h.a('kelowna', 'Kelowna page')}.</p>

<h2>Where the 20 cents go</h2>
<p>Gasoline sold in the Victoria regional transit area pays ${VI.total.regular} cents of motor fuel tax per litre: the provincial rate of 14.5 cents charged throughout B.C., and ${VI.transit_share} cents for BC Transit. Diesel pays ${VI.total.diesel} cents. GST at 5% is charged on the price including those cents, and B.C. charges no provincial sales tax on fuel.</p>
${taxTable(h, ID)}
<p>The B.C. carbon tax, which used to be a separate line, was eliminated on April 1, 2025. The federal excise tax has been suspended since April 20, 2026, and its return is the next dated change that will move the Victoria price.</p>

<h2>The proposed excise return</h2>
<p>Finance Canada's draft legislation (proposed, not enacted) extends the suspension to January 31, 2027, then charges half the excise in February and March 2027 and all of it from April 1, 2027: 10 cents a litre on gasoline and 4 on diesel, before GST. For a household that buys a given number of litres each month, the calculator shows the extra cost.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'BC' }, t: 'The excise return for a B.C. driver' })}
<p>The draft schedule is not yet law; the ${h.a('forecast', 'forecast page')} follows it, and the ${h.a('taxes', 'tax page')} lists every rate by province.</p>

<h2>Thirteen months in Victoria</h2>
<p>The Statistics Canada series is under the Open Government Licence, so its recent months are shown below, newest first.</p>
${histTable(h, ID)}
`,
  },
});
