import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'winnipeg';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const gst = K.salesRate('MB');
const mb = K.exciseAt(K.fuelSteps('MB'), K.TOMORROW, 'regular');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const H = K.HIST[ID]?.regular ?? [];
const avg = H.length ? H.reduce((a, x) => a + x[1], 0) / H.length : 0;
const prem = pr.latest.value - r.latest.value;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 310, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['regina', 'saskatoon', 'toronto', 'taxes', 'tomorrow'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-winnipeg',
    nav: 'Winnipeg', card: 'Manitoba 12.5-cent tax, monthly average, east-west gap',
    title: 'Gas Prices Winnipeg 2026, Manitoba Fuel Tax and Estimate',
    description: 'Gas prices in Winnipeg in 2026: the Statistics Canada monthly average, tomorrow\'s estimate, the 12.5-cent Manitoba fuel tax and the gap with Toronto gas.',
    h1: 'Gas prices in Winnipeg',
    intro: `Regular gasoline in Winnipeg averaged ${c(r.latest.value)} in ${mon} and is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}.`,
    resume: `Winnipeg's official open gas price is a monthly one: Statistics Canada's average for ${mon} is ${c(r.latest.value)} a litre for regular, ${c(pr.latest.value)} for premium and ${c(d.latest.value)} for diesel, taxes included. Manitoba is the easternmost province whose estimate on this site follows the Edmonton wholesale price, published daily by the Government of Ontario; adding its change since ${mon}, with GST, gives ${c(r.est.value)} for ${E.day(K.TOMORROW)}. Checked against ${r.bt?.n ?? 0} past months, that estimate missed the next Statistics Canada average by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} for repeating the previous month. Manitoba's fuel tax is back at ${K.num(mb, 'en', 1)} cents a litre since the 2024 tax holiday ended on January 1, 2025; the provincial sales tax does not apply to fuel, and with the 5% GST the taxes make up ${E.p(br.taxShare)} of the estimated price. The federal excise tax has been suspended since April 20, 2026.`,
    faqs: [
      { q: 'Is the Manitoba gas tax holiday still in effect in Winnipeg?', a: 'No. Manitoba suspended its fuel tax for 2024 and the holiday ended on January 1, 2025, when the rate went back to 12.5 cents a litre. What is suspended in 2026 is the federal excise tax, since April 20, 2026, which applies across Canada. The tax table on this page shows both lines as they stand for tomorrow.' },
      { q: 'Why does the Winnipeg estimate follow Edmonton and not Toronto?', a: 'The page needs a daily wholesale price close to the market that supplies the city, and the open rack prices published by Ontario cover Toronto, Thunder Bay and Edmonton. The site treats Manitoba as part of the western market and uses the Edmonton price for it, as for Saskatchewan, Alberta and B.C. The measured error over past months is shown next to the estimate.' },
      { q: 'How does a Winnipeg litre compare with one in Toronto?', a: 'The two cities use different official sources: a monthly Statistics Canada average for Winnipeg, a weekly Ontario survey for Toronto. The comparison on this page uses the estimate for Winnipeg and the latest survey for Toronto, with their dates. On tax, Manitoba charges 12.5 cents and 5% GST, Ontario 9 cents and 13% HST.' },
    ],
    body: (h) => `
<h2>A monthly benchmark for Winnipeg</h2>
<p>Statistics Canada publishes Winnipeg's average retail price for each fuel once a month. The newest month on ${h.day(K.TODAY)} is ${mon}, and the table shows it with the source, the estimate for ${h.day(K.TOMORROW)} and the past error of the method.</p>
${facts(h, ID)}
<p>Premium sits ${h.cpl(prem)} above regular in the ${mon} averages. Because Manitoba's taxes per litre are the same for both grades of gasoline, that spread lies entirely in the product. Weekly prices compiled by Natural Resources Canada exist for Winnipeg but cannot be reproduced here.</p>

<h2>Where the estimate comes from</h2>
<p>Winnipeg is far from both refining centres used by the site, and the choice of reference matters. The page uses the Edmonton rack price, the same one that moves the estimates for the other Prairie cities. ${r.est.rackDelta ? `From its ${mon} average to its value of ${h.day(r.est.rackNowLast!)}, it moved by ${h.cents(r.est.rackDelta)}, or ${h.cents(r.est.rackDelta * (1 + gst))} at the pump with GST.` : 'No rack price newer than the month is available yet, so the estimate is the monthly figure.'} ${r.est.taxDelta ? `A dated tax change adds ${h.cents(r.est.taxDelta)}.` : 'No Manitoba tax changed between that month and tomorrow.'}</p>
<p>The ${h.a('tomorrow', 'tomorrow page')} gives the same breakdown for every city, and the ${h.a('method', 'method page')} explains how the error column is calculated.</p>

<h2>Manitoba's fuel tax after the holiday</h2>
<p>Manitoba stopped collecting its fuel tax for the whole of 2024, then brought it back on January 1, 2025 at ${K.num(mb, 'en', 1)} cents a litre for gasoline and diesel. That is the rate in force, with no city surcharge in Winnipeg. The provincial sales tax does not apply to road fuel; GST at 5% does, on the price that already includes the provincial cents, which is ${h.cpl(br.salesTax)} at the estimate.</p>
${taxTable(h, ID)}
<p>To see the tax in a litre at the price on the sign of your own station, enter it below.</p>
${h.mini('taxes', { p: ['p', 'c'], d: { v: ID, c: 'regular' }, t: 'Tax in a Winnipeg litre' })}
<p>The ${h.a('taxes', 'tax page')} sets Manitoba against the other provinces and follows the return of the federal excise, planned at half rate on February 1, 2027 and in full on April 1, 2027.</p>

<h2>Winnipeg against Toronto</h2>
<p>The comparison crosses the line between the two markets the site follows: the western one, measured monthly and carried forward with the Edmonton rack price, and the central one, surveyed every week by Ontario. Keep the dates in view when reading the gap, and remember that Ontario's lower per-litre tax is partly offset by its higher sales tax.</p>
${h.mini('comparer', { p: ['w', 'k'], d: { v: ID, w: 'toronto' }, t: 'Winnipeg and another city' })}

<h2>The past year in Winnipeg</h2>
<p>${H.length ? `Over the ${H.length} months below, Winnipeg regular averaged ${h.cpl(avg)}.` : ''} The Statistics Canada series is published under the Open Government Licence, and neighbouring ${h.a('regina', 'Regina')} and ${h.a('saskatoon', 'Saskatoon')} have their own pages.</p>
${histTable(h, ID)}
`,
  },
});
