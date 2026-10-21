import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'saskatoon';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const reg = K.fuelOf('regina', 'regular')!, regD = K.fuelOf('regina', 'diesel')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const H = K.HIST[ID]?.regular ?? [], HR = K.HIST.regina?.regular ?? [];
const both = H.filter(([m]) => HR.some(([m2]) => m2 === m));
const higher = both.filter(([m, v]) => v > (HR.find(([m2]) => m2 === m)![1])).length;
const g = r.latest.value - reg.latest.value, gD = d.latest.value - regD.latest.value;
const first = H[0], last = H[H.length - 1];
const side = (x: number) => (Math.abs(x) < 0.05 ? 'level with Regina' : `${c(Math.abs(x))} ${x > 0 ? 'above' : 'below'} Regina`);

export default defineGuide({
  id: ID, group: groupOf(ID), order: 309, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['regina', 'edmonton', 'winnipeg', 'tomorrow', 'diesel'],
  sources: [...sourcesOf(ID), 'nrcan-weekly'],
  en: {
    slug: 'gas-prices-saskatoon',
    nav: 'Saskatoon', card: 'Monthly average, gap with Regina, year in review',
    title: 'Gas Prices Saskatoon 2026, Regina Gap and Fill-Up Cost',
    description: 'Gas prices in Saskatoon in 2026: the latest Statistics Canada average, today\'s estimate, the gap with Regina for gas and diesel, and the cost of a fill-up.',
    h1: 'Gas prices in Saskatoon',
    intro: `Saskatoon averaged ${c(r.latest.value)} for regular in ${mon}, ${side(g)}; the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `Saskatoon and Regina pay the same Saskatchewan taxes, yet Statistics Canada publishes a separate monthly average for each, and the two do not always agree. In ${mon}, regular gasoline averaged ${c(r.latest.value)} in Saskatoon, ${side(g)}, while diesel was ${c(d.latest.value)}, ${side(gD)}. Because a monthly figure is several weeks old by the time it appears, this page moves it to ${E.day(K.TOMORROW)} using the change in the Edmonton rack price with GST and any dated tax change, which gives ${c(r.est.value)} for regular. Run over ${r.bt?.n ?? 0} earlier months, the method was off by ${c(r.bt?.mae ?? 0)} on average, while assuming no change from one month to the next was off by ${c(r.bt?.maeNaive ?? 0)}. In a Saskatoon litre, the 15-cent provincial fuel tax and the 5% GST make up ${E.p(br.taxShare)} of the estimate; Saskatchewan does not charge its sales tax on road fuel, and the federal excise is suspended since April 20, 2026.`,
    faqs: [
      { q: 'Is gas more expensive in Saskatoon than in Regina?', a: 'It depends on the month. The two cities pay identical taxes, so any gap between their Statistics Canada averages comes from the product and retail margins. This page counts, month by month over the period it shows, how often Saskatoon was the higher of the two, and compares the two estimates for tomorrow with the same method.' },
      { q: 'How much does a fill-up cost in Saskatoon today?', a: 'At the estimate for tomorrow, the page gives the cost of a 55-litre fill-up, and the calculator lets you enter the price on the station sign and the size of your tank. Each cent per litre is worth 55 cents on such a tank, so a station a few cents below the average saves a dollar or two per fill-up, not more.' },
      { q: 'How have Saskatoon gas prices changed over the past year?', a: 'The page shows the last thirteen monthly averages published by Statistics Canada for Saskatoon, newest first, and the change between the first and the last of them. Those months include one dated tax change: the suspension of the 10-cent federal excise tax on April 20, 2026. The rest of the movement follows the wholesale market.' },
    ],
    body: (h) => `
<h2>Two cities, one tax system, two averages</h2>
<p>Saskatchewan has two cities in the Statistics Canada table of retail fuel prices, and because they share every tax, comparing them shows how much retail markets can differ inside one province. ${both.length ? `In the ${both.length} months shown on this site, Saskatoon's regular average was above Regina's ${higher} times.` : ''} The table gives this city's latest month, its source and its estimate for ${h.day(K.TOMORROW)}. Natural Resources Canada also compiles weekly city prices, but they cannot be reproduced here; its ${h.src('nrcan-weekly', 'weekly table')} is the place to read them.</p>
${facts(h, ID)}
<p>The estimate uses the same Edmonton rack price as Regina's, so the two estimates keep the gap of their last monthly averages. The ${h.a('tomorrow', 'tomorrow page')} lists that estimate for every city.</p>

<h2>Saskatoon or Regina, per tank</h2>
<p>For drivers who travel between the two cities on Highway 11, the useful question is what the gap is worth. The calculator puts it in dollars per tank and per year.</p>
${h.mini('comparer', { p: ['w', 'r'], d: { v: ID, w: 'regina' }, t: 'Saskatoon and Regina' })}
<p>Diesel can tell a different story from gasoline: in ${mon}, Saskatoon diesel was ${side(gD)}, against ${side(g)} for regular. The two fuels come from different refinery markets, so the city that is cheaper for one is not always cheaper for the other. The ${h.a('diesel', 'diesel page')} has the national picture.</p>

<h2>The tax in a Saskatoon litre</h2>
<p>Saskatoon pays Saskatchewan's fuel tax of 15 cents a litre and GST at 5%, ${h.cpl(br.salesTax)} at the estimated price. No municipal or transit levy applies, and the provincial sales tax is not charged on road fuel.</p>
${taxTable(h, ID)}
<p>Between its neighbours, Saskatoon sits in the middle on tax: Alberta collects no provincial fuel tax under its relief program for now, and Manitoba charges 12.5 cents. With GST, the Saskatchewan rate is worth ${h.cpl(K.exciseAt(K.fuelSteps('SK'), K.TOMORROW, 'regular') * (1 + K.salesRate('SK')), 2)} at the pump, which is part of why prices in Saskatoon and Edmonton differ even though both estimates follow the same wholesale price.</p>
<p>The next dated change is federal: the excise tax, suspended since April 20, 2026, returns at half rate on February 1, 2027 and in full on April 1, 2027 under Finance Canada's draft legislation.</p>

<h2>Thirteen months of Saskatoon prices</h2>
<p>${first && last ? `From ${K.month(first[0], 'en')} to ${K.month(last[0], 'en')}, the Saskatoon regular average went from ${h.cpl(first[1])} to ${h.cpl(last[1])}, a change of ${h.cents(last[1] - first[1])}.` : ''} The series is under the Open Government Licence and appears below with diesel.</p>
${histTable(h, ID)}

<h2>Your next fill-up</h2>
<p>A 55-litre fill-up at the estimate for ${h.day(K.TOMORROW)} costs ${h.usd(K.fillCost(55, r.est.value))}. Enter the price on the sign at your station to get your own figure.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(r.est.value * 10) / 10 }, t: 'A Saskatoon fill-up' })}
<p>For the market to the west, the ${h.a('edmonton', 'Edmonton page')} explains the wholesale price that drives these estimates; to the east, see ${h.a('winnipeg', 'Winnipeg')}.</p>
`,
  },
});
