import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'vancouver';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const perL = br.lines.reduce((a, x) => a + x.cpl, 0);
const TL = (K.P.taxes.regional as Record<string, { total: { regular: number; diesel: number }; transit_share: number }>)['bc-translink'];
const gst = K.salesRate('BC');
const cal = K.fuelOf('calgary', 'regular')!;
const H = K.HIST[ID]?.regular ?? [];
const yr = H.length > 1 ? H[H.length - 1][1] - H[0][1] : 0;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 300, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['surrey', 'victoria', 'calgary', 'forecast', 'diesel'],
  sources: [...sourcesOf(ID), 'nrcan-weekly'],
  en: {
    slug: 'gas-prices-vancouver',
    nav: 'Vancouver', card: 'Monthly Statistics Canada average, TransLink tax, estimate for today',
    title: 'Gas Prices Vancouver 2026, TransLink Tax and Estimate',
    description: 'Gas prices in Vancouver in 2026: the latest Statistics Canada monthly average, an estimate for today, the 27-cent Metro Vancouver fuel tax and diesel.',
    h1: 'Gas prices in Vancouver',
    intro: `Regular gasoline in Vancouver is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}, from a ${mon} average of ${c(r.latest.value)}.`,
    resume: `The only official Vancouver gas price that can be reused freely is the monthly average of Statistics Canada, and its latest month is ${mon}: ${c(r.latest.value)} for regular gasoline, ${c(d.latest.value)} for diesel, taxes included. A month-old number is not a price for today, so this page brings it forward. It adds the change in the Edmonton wholesale (rack) price since that month, with GST, and any tax change dated in between; for ${E.day(K.TOMORROW)} that gives ${c(r.est.value)} for regular. Replayed over ${r.bt?.n ?? 0} past months, the same method missed the next Statistics Canada average by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} for repeating the previous month. In Metro Vancouver a litre of gasoline carries ${TL.total.regular} cents of motor fuel tax, ${TL.transit_share} of them for TransLink, and 5% GST: ${E.p(br.taxShare)} of the estimated price. B.C.'s carbon tax ended on April 1, 2025, and the federal excise tax is suspended since April 20, 2026.`,
    faqs: [
      { q: 'Why is the fuel tax per litre so high in Vancouver?', a: 'Metro Vancouver is the region of B.C. where a transit authority takes the largest share of the fuel tax. Of the 27 cents per litre of motor fuel tax charged on gasoline in the TransLink service area, 18.5 cents fund TransLink. Elsewhere in B.C. the provincial rate is 14.5 cents, and in the Victoria area 20 cents. GST at 5% is then charged on top.' },
      { q: 'Why is the Vancouver gas price on this page an estimate?', a: 'Statistics Canada publishes Vancouver prices once a month, a few weeks after the month ends. Weekly city averages exist at Natural Resources Canada, but their terms do not allow republishing them. So the page starts from the last monthly average and moves it with the Edmonton wholesale price, which is published daily, and with dated tax changes. The past error of that method is shown next to the figure.' },
      { q: 'How much did gas prices in Vancouver change over the past year?', a: 'The Statistics Canada series shown on this page covers the last thirteen published months. The difference between the first and the last month of that table is the change over a year. Two dated tax changes matter when reading it: the federal excise tax was suspended on April 20, 2026, and the B.C. carbon tax had already ended in April 2025.' },
    ],
    body: (h) => `
<h2>From a monthly average to today's price</h2>
<p>Statistics Canada publishes a monthly average retail price for each fuel in Vancouver. That is the open, official benchmark, and the starting point of every figure on this page. Its weakness is age: on ${h.day(K.TODAY)} the newest month available is ${mon}. The table shows that month and, next to it, the estimate brought to ${h.day(K.TOMORROW)}.</p>
${facts(h, ID)}
<p>The estimate column comes from a simple rule. The Government of Ontario publishes a daily wholesale (rack) price for Edmonton, the refining hub that supplies much of Western Canada. ${r.est.rackDelta ? `Between the ${mon} average of that rack price and its last value of ${h.day(r.est.rackNowLast!)}, it moved by ${h.cents(r.est.rackDelta)}; with GST that is ${h.cents(r.est.rackDelta * (1 + gst))} at the pump.` : 'When no rack price newer than the month is available, the estimate stays at the monthly average.'} Natural Resources Canada does publish weekly city averages, but they cannot be reproduced here; you can read them on its ${h.src('nrcan-weekly', 'weekly price page')}.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'How the Vancouver estimate is built' })}

<h2>The 27-cent fuel tax of Metro Vancouver</h2>
<p>A litre of gasoline sold in the TransLink service area carries ${TL.total.regular} cents of motor fuel tax, of which ${TL.transit_share} cents go to the regional transit authority. In the table below, that total appears as the 14.5-cent provincial rate charged across B.C. plus the Metro Vancouver surcharge on top of it. GST at 5% is calculated on the price including those cents; there is no provincial sales tax on road fuel in B.C.</p>
${taxTable(h, ID)}
<p>At the estimated price, the fixed tax is ${h.cpl(perL)} and GST ${h.cpl(br.salesTax)}. Two taxes that used to weigh on a Vancouver litre are gone for now: the B.C. carbon tax was eliminated on April 1, 2025, and the federal excise tax of 10 cents has been suspended since April 20, 2026. The excise is scheduled to come back in 2027, half on February 1 and in full on April 1, under Finance Canada's draft legislation.</p>

<h2>A year of Statistics Canada averages</h2>
<p>Because the Statistics Canada series is published under the Open Government Licence, its recent months can be shown in full. ${H.length > 1 ? `From ${K.month(H[0][0], 'en')} to ${K.month(H[H.length - 1][0], 'en')}, regular gasoline in Vancouver moved by ${h.cents(yr)}.` : ''}</p>
${histTable(h, ID)}
<p>Diesel follows its own refinery market, so its path in the table can differ widely from that of gasoline. At the estimates for ${h.day(K.TOMORROW)}, diesel costs ${h.cpl(d.est.value - r.est.value)} more than regular in Vancouver; the ${h.a('diesel', 'diesel page')} compares that gap with other cities.</p>

<h2>Vancouver and Calgary</h2>
<p>The gap between the two largest western cities is mostly a tax gap. Calgary pays no Alberta fuel tax while the province's relief program runs, and no transit levy; Vancouver pays ${TL.total.regular} cents. Both estimates use the same Edmonton rack price, so the comparison below is consistent: ${h.cpl(Math.abs(r.est.value - cal.est.value))} per litre separates the two estimates today.</p>
${h.mini('comparer', { p: ['w', 'k'], d: { v: ID, w: 'calgary' }, t: 'Vancouver against another city' })}
<p>For the outlook beyond tomorrow, including the dated tax changes of 2027, see the ${h.a('forecast', 'forecast page')}. Drivers in the suburbs will find the same figures on the ${h.a('surrey', 'Surrey page')}, which shares the Vancouver average.</p>
`,
  },
});
