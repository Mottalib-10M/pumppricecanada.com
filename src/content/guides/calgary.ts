import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'calgary';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const gst = K.salesRate('AB');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const abNow = K.exciseAt(K.fuelSteps('AB'), K.TOMORROW, 'regular');
const abBefore = K.exciseAt(K.fuelSteps('AB'), `${r.latest.date}-15`, 'regular');
const stale = abBefore > abNow;
const relief = stale ? -r.est.taxDelta : 0;
const H = K.HIST[ID]?.regular ?? [];
const hi = H.length ? H.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
const lo = H.length ? H.reduce((a, b) => (b[1] < a[1] ? b : a)) : null;
const ED = K.HIST.edmonton?.regular ?? [];
const above = H.filter(([m, v]) => ED.some(([m2, v2]) => m2 === m && v > v2)).length;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 306, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['edmonton', 'vancouver', 'regina', 'tomorrow', 'forecast'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-calgary',
    nav: 'Calgary', card: 'Alberta fuel tax relief, monthly average, estimate for today',
    title: 'Gas Prices Calgary 2026, Alberta Fuel Tax Relief Estimate',
    description: 'Gas prices in Calgary in 2026: the Statistics Canada monthly average, today\'s estimate without the suspended 13-cent Alberta fuel tax, and the 2027 outlook.',
    h1: 'Gas prices in Calgary and the Alberta tax relief',
    intro: `With the Alberta fuel tax not collected, regular gasoline in Calgary is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}, against a ${mon} average of ${c(r.latest.value)}.`,
    resume: `Calgary's open official gas price is the Statistics Canada monthly average, and the latest month published is ${mon}: ${c(r.latest.value)} a litre for regular, ${c(pr.latest.value)} for premium and ${c(d.latest.value)} for diesel. ${stale ? `Since then, one thing has changed by law: under Alberta's Fuel Tax Relief Program, the 13-cent provincial fuel tax is not collected from October 1, 2026 to at least December 31, 2026. With GST, that removes ${c(relief)} from a litre.` : `That month already reflects Alberta's Fuel Tax Relief Program, under which the 13-cent provincial fuel tax is not collected from October 1, 2026 to at least December 31, 2026.`} The page also moves the monthly figure with the Edmonton wholesale price, and the result for ${E.day(K.TOMORROW)} is ${c(r.est.value)} for regular. Over ${r.bt?.n ?? 0} past months, the method missed the next Statistics Canada figure by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} for repeating the last month. With the Alberta tax and the federal excise both at zero for now, the only tax left in a Calgary litre is the 5% GST, ${E.p(br.taxShare)} of the estimated price.`,
    faqs: [
      { q: 'Is the Alberta fuel tax still suspended in Calgary?', a: 'Yes, for now. Under the Fuel Tax Relief Program, the 13-cent tax is not collected from October 1 to at least December 31, 2026. From January 1, 2027 at the earliest, the rate will depend on the price of WTI oil: 0, 4.5, 9 or 13 cents, and it can rise by no more than 9 cents in one quarter. The page dates each step as the province confirms it.' },
      { q: 'Why is the Calgary estimate lower than the last Statistics Canada average?', a: 'Because the last average is for a month when the Alberta fuel tax was still collected. The estimate removes that tax, with the GST charged on it, from the day it stopped. It also adds the change in the Edmonton wholesale price since that month, which can push the figure up or down. The tomorrow calculator on this page shows each part separately.' },
      { q: 'Are Calgary gas prices higher than Edmonton?', a: `In ${above} of the ${H.length} monthly Statistics Canada averages shown on this page, Calgary was above Edmonton. Both cities pay exactly the same taxes, so any gap is in the product and the retail margins. The Edmonton page compares the two cities with today's estimates and explains why Edmonton's wholesale price is the reference for every western estimate on this site.` },
    ],
    body: (h) => `
<h2>A tax holiday the monthly average cannot see</h2>
<p>Statistics Canada publishes Calgary's average pump price once a month, weeks after the month ends. ${stale ? `Its latest figure, for ${mon}, still includes the Alberta fuel tax of 13 cents a litre. That tax stopped on October 1, 2026 under the province's Fuel Tax Relief Program, so any reading of the ${mon} number as "today's price" would overstate it. The estimate column corrects for that.` : `Its latest figure, for ${mon}, already falls under the province's Fuel Tax Relief Program, which stopped the 13-cent Alberta fuel tax on October 1, 2026. The estimate column brings it to today.`}</p>
${facts(h, ID)}
<p>${stale ? `For regular, the correction for the tax is ${h.cents(-relief)} at the pump, GST included. ` : ''}The Edmonton rack price, published every business day by the Government of Ontario, then adds ${h.cents(r.est.rackDelta * (1 + gst))} for the wholesale movement since ${mon}. The calculator below lists those parts with their dates.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Calgary tomorrow, part by part' })}

<h2>The Fuel Tax Relief Program</h2>
<p>Alberta ties its fuel tax to the price of oil. While the relief program applies, the 13-cent rate is not collected, and the province has said that will last until at least December 31, 2026. From January 1, 2027 at the earliest, the rate will be set at 0, 4.5, 9 or 13 cents depending on the price of WTI crude, and it cannot climb by more than 9 cents from one quarter to the next.</p>
${taxTable(h, ID)}
<p>That leaves a Calgary litre with the 5% GST as its only tax for the moment: ${h.cpl(br.salesTax)} at the estimated price. No transit levy applies in Alberta and there is no provincial sales tax. This page will show the new Alberta rate as soon as it is published, and the ${h.a('forecast', 'forecast page')} follows both dated changes coming in 2027.</p>

<h2>Two taxes that could come back in 2027</h2>
<p>The federal excise tax of 10 cents a litre on gasoline has been suspended since April 20, 2026. Finance Canada's draft legislation brings it back at half rate on February 1, 2027 and in full on April 1, 2027. In Alberta, that return could coincide with a quarterly reset of the provincial tax, so a Calgary driver may see two increases in the first half of 2027. The calculator below measures the federal part alone for your monthly consumption.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'AB' }, t: 'The excise return for an Alberta driver' })}
<p>If Alberta restores its full 13 cents at some point, the combined effect with the full excise would be ${h.cpl((13 + K.exciseAt(K.EXCISE, '2027-04-01', 'regular')) * (1 + gst), 2)} per litre with GST, all else equal. Whether and when that happens depends on the oil price and the province's quarterly decisions.</p>

<h2>Calgary over the last thirteen months</h2>
<p>The Statistics Canada series is published under the Open Government Licence and appears in full below. ${hi && lo ? `Over the period, the highest monthly average was ${h.cpl(hi[1])} in ${K.month(hi[0], 'en')} and the lowest ${h.cpl(lo[1])} in ${K.month(lo[0], 'en')}.` : ''}</p>
${histTable(h, ID)}
<p>For the latest tomorrow figures of every city, see the ${h.a('tomorrow', 'tomorrow page')}; for a side-by-side with the capital, the ${h.a('edmonton', 'Edmonton page')}.</p>
`,
  },
});
