import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'regina';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const gst = K.salesRate('SK');
const sk = K.exciseAt(K.fuelSteps('SK'), K.TOMORROW, 'regular');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const pk = K.vehicleL100('pickup-standard', 'regular');
const km = 25000;
const lit = K.litresFor(km, pk);
const exFull = K.exciseAt(K.EXCISE, '2027-04-01', 'regular') * (1 + gst);
const wpg = K.fuelOf('winnipeg', 'regular')!;
const gapW = r.est.value - wpg.est.value;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 308, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['saskatoon', 'winnipeg', 'calgary', 'taxes', 'forecast'],
  sources: [...sourcesOf(ID), 'nrcan-weekly'],
  en: {
    slug: 'gas-prices-regina',
    nav: 'Regina', card: 'Saskatchewan 15-cent tax, pickup budget, proposed excise return',
    title: 'Gas Prices Regina 2026, Saskatchewan Tax and Truck Budget',
    description: 'Gas prices in Regina in 2026: the Statistics Canada monthly average, today\'s estimate, the 15-cent Saskatchewan fuel tax and a year of pickup driving.',
    h1: 'Gas prices in Regina',
    intro: `From a ${mon} average of ${c(r.latest.value)}, regular gasoline in Regina is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}.`,
    resume: `Statistics Canada publishes one open official gas price for Regina, a monthly average, and its most recent month is ${mon}, at ${c(r.latest.value)} a litre for regular and ${c(d.latest.value)} for diesel. To give a figure for today, the page adds the change in the Edmonton wholesale (rack) price since that month, with 5% GST: the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}. On ${r.bt?.n ?? 0} months of history, that estimate was off by ${c(r.bt?.mae ?? 0)} on average, against ${c(r.bt?.maeNaive ?? 0)} for assuming no change. Saskatchewan levies a fuel tax of ${K.num(sk, 'en')} cents a litre on gasoline and diesel and does not charge its provincial sales tax on road fuel, so a Regina litre carries that tax and GST: ${E.p(br.taxShare)} of the estimated price. The federal excise tax is suspended since April 20, 2026; when the draft schedule restores it in full on April 1, 2027, it will add ${c(exFull)} a litre with GST.`,
    faqs: [
      { q: 'How much is the gas tax in Regina?', a: 'Saskatchewan charges a fuel tax of 15 cents per litre on gasoline and on diesel, the same across the province, with no city or transit levy in Regina. The provincial sales tax does not apply to road fuel, but the 5% GST does, on the price that already includes the 15 cents. The federal excise is suspended since April 20, 2026.' },
      { q: 'What does a year of driving a pickup cost in Regina?', a: 'The budget calculator on this page answers with your own distance. It uses the median combined rating of 2026 full-size pickups from Natural Resources Canada and prices the litres at the Regina estimate for tomorrow. Choosing a smaller class or entering your own rating from the EnerGuide label changes the result immediately.' },
      { q: 'Is gas cheaper in Regina or in Winnipeg?', a: 'Both cities have their own monthly Statistics Canada series, and the page brings both forward with the same Edmonton rack price, so their estimates are comparable. Taxes differ: Saskatchewan charges 15 cents a litre and Manitoba 12.5 cents, both with 5% GST. The comparison calculator shows the current gap for a fill-up and for a year.' },
    ],
    body: (h) => `
<h2>The Regina figure and how old it is</h2>
<p>Regina's official benchmark is monthly. Statistics Canada publishes it a few weeks after each month closes, so on ${h.day(K.TODAY)} the newest month is ${mon}. The estimate column moves that figure with the Edmonton rack price, which the Government of Ontario publishes daily with about a week of delay, and with any tax change dated after the month.</p>
${facts(h, ID)}
<p>Weekly city prices from Natural Resources Canada exist, but their terms do not allow them to be copied here; the ${h.src('nrcan-weekly', 'NRCan weekly table')} can be read on its own site.</p>

<h2>Saskatchewan's fuel tax</h2>
<p>Saskatchewan's fuel tax is ${K.num(sk, 'en')} cents a litre for gasoline and diesel alike, and it is the same in Regina as anywhere else in the province: there is no transit or municipal surcharge. The provincial sales tax is not charged on road fuel. GST at 5% is, on the price that already includes the ${K.num(sk, 'en')} cents, which is ${h.cpl(br.salesTax)} at the estimated price.</p>
${taxTable(h, ID)}
<p>The ${h.a('taxes', 'tax page')} sets that rate against the other provinces. Compared with Alberta, where the provincial fuel tax is not collected at the moment, a Regina litre carries ${h.cpl(sk * (1 + gst))} more tax including GST.</p>

<h2>A year behind the wheel of a pickup</h2>
<p>For a driver who covers long distances in a truck, the yearly bill is what counts. A full-size pickup with the median 2026 rating of ${h.n(pk, 1)} L/100 km, driven ${h.n(km)} km a year, burns about ${h.n(lit)} litres. At the Regina estimate for ${h.day(K.TOMORROW)}, that is ${h.usd(K.fillCost(lit, r.est.value), 0)} a year, and each 10 cents per litre moves it by ${h.usd(lit * 0.1, 0)}.</p>
${h.mini('budget', { p: ['u', 'k'], d: { v: ID, u: 'pickup-standard', k: km }, t: 'Your year of fuel in Regina' })}
<p>The ratings come from Natural Resources Canada's fuel consumption guide for 2026 models. Towing, winter driving and gravel roads push real consumption above them.</p>

<h2>When the excise returns</h2>
<p>Finance Canada's draft legislation (proposed, not enacted) keeps the federal excise at zero until January 31, 2027, then charges half of it in February and March and all 10 cents from April 1, 2027. For the pickup above, the full rate with GST would add ${h.usd(lit * exFull / 100, 0)} over a year. The calculator measures it for your own monthly litres.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'SK' }, t: 'The excise return in Saskatchewan' })}
<p>The draft is not law yet; the ${h.a('forecast', 'forecast page')} follows it.</p>

<h2>Regina, Winnipeg and the past year</h2>
<p>At the estimates for ${h.day(K.TOMORROW)}, Regina is ${Math.abs(gapW) < 0.05 ? 'level with' : `${h.cpl(Math.abs(gapW))} ${gapW > 0 ? 'above' : 'below'}`} ${h.a('winnipeg', 'Winnipeg')}, the next capital to the east, and ${h.a('saskatoon', 'Saskatoon')} has its own page. The Statistics Canada series for Regina is published under the Open Government Licence:</p>
${histTable(h, ID)}
`,
  },
});
