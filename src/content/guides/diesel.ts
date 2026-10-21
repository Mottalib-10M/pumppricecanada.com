import { defineGuide } from '../../lib/page-types';
import type { Helpers } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const ids = K.PRICED_IDS.filter((id) => K.fuelOf(id, 'diesel') && !K.city(id).proxy);
const dz = (id: string) => K.headline(K.fuelOf(id, 'diesel')!).value;
const gz = (id: string) => K.headline(K.fuelOf(id, 'regular')!).value;
const sorted = [...ids].sort((a, b) => dz(a) - dz(b));
const lo = sorted[0], hi = sorted[sorted.length - 1];
const gaps = ids.map((id) => dz(id) - gz(id));
const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
const tor = K.fuelOf('toronto', 'diesel')!, torR = K.fuelOf('toronto', 'regular')!;
const rackD = K.SNAP.racks.torontoDiesel, rackG = K.SNAP.racks.toronto;
const pick = K.vehicleL100('pickup-standard', 'diesel'), pickG = K.vehicleL100('pickup-standard', 'regular');
const E = K.en;

function table(h: Helpers) {
  const rows = sorted.map((id) => { const d = K.fuelOf(id, 'diesel')!; const hd = K.headline(d); return [h.a(id, h.cn(id)), h.cpl(hd.value), h.cpl(gz(id)), h.cents(hd.value - gz(id)), hd.isEstimate ? 'estimate' : h.when(d)]; });
  return h.table(['City', 'Diesel', 'Regular', 'Gap', 'Figure'], rows, 'Diesel and regular, cents per litre, cheapest diesel first. Monthly averages are brought to tomorrow with the published method.', ['l', 'r', 'r', 'r', 'l']);
}

export default defineGuide({
  id: 'diesel', group: 'outils', order: 3,
  tool: 'ville', toolArg: { v: 'toronto', c: 'diesel' },
  related: ['taxes', 'tomorrow', 'cheapest', 'calgary', 'halifax'],
  sources: ['ontario-retail', 'ontario-rack', 'statcan', 'nseb', 'nbeub', 'pubnl', 'nrcan-fcr', 'excise'],
  en: {
    slug: 'diesel-prices',
    nav: 'Diesel prices', card: 'Diesel by city, the gap with gasoline, a pickup’s yearly cost',
    title: 'Diesel Prices in Canada by City Today and Tomorrow, 2026',
    description: 'Diesel prices in 2026 by Canadian city: the latest official figure, tomorrow’s estimate, the gap with regular gasoline, taxes and a pickup’s yearly fuel cost.',
    h1: 'Diesel prices by city',
    intro: `Diesel was ${K.cpl(tor.latest.value, 'en')} in Toronto at the ${E.day(tor.latest.date)} survey, ${K.cpl(tor.latest.value - torR.latest.value, 'en')} more than regular.`,
    resume: `Diesel costs more than regular gasoline in every city this site follows: on average ${K.cpl(avgGap, 'en')} more per litre today, from ${K.cpl(dz(lo), 'en')} in ${K.cityName(lo, 'en')} to ${K.cpl(dz(hi), 'en')} in ${K.cityName(hi, 'en')}. The gap comes from the wholesale market, not from taxes: at the Toronto rack, the last published price was ${K.cpl(rackD?.value ?? 0, 'en')} for diesel against ${K.cpl(rackG?.value ?? 0, 'en')} for gasoline (${E.day(rackD?.date ?? K.TODAY)}). Official diesel figures come from the same sources as gasoline: the weekly Ontario survey, the maximum prices of the Atlantic regulators and the monthly averages of Statistics Canada; the Régie de l'énergie's daily survey covers regular gasoline only. For the same reason, the estimate for tomorrow moves diesel only with rack prices, which Ontario publishes a week late, and on most days it equals the last official figure. Across Canada, Statistics Canada's monthly average for diesel is not used here; each city has its own figure and date.`,
    faqs: [
      { q: 'Why is diesel more expensive than gasoline in Canada in 2026?', a: `Because diesel is priced on its own wholesale market, the market for distillates that also supplies trucking, farming and heating oil. At the last published Toronto rack prices, diesel was ${K.cpl((rackD?.value ?? 0) - (rackG?.value ?? 0), 'en')} above gasoline before any tax. Per-litre taxes on diesel are similar to those on gasoline, and the federal excise is lower, so taxes do not explain the gap.` },
      { q: 'Is there a forecast for diesel prices tomorrow?', a: 'Each city page gives one, built with the same rule as for gasoline. But no open daily diesel survey exists, so the estimate moves only when Ontario publishes rack prices newer than the last survey, about a week late. On most days it therefore equals the last official figure, and its past error is the same as that of a “no change” guess, which the page says.' },
      { q: 'How much does a diesel pickup cost to run per year?', a: `Natural Resources Canada’s 2026 ratings give a median of ${E.n(pick, 1)} L/100 km for standard diesel pickups, against ${E.n(pickG, 1)} for gasoline ones. Over 20,000 km at Toronto’s diesel price that is about ${K.dollars(K.fillCost(K.litresFor(20000, pick), tor.est.value), 'en', 0)} a year, against ${K.dollars(K.fillCost(K.litresFor(20000, pickG), torR.est.value), 'en', 0)} for a gasoline pickup at the regular price.` },
    ],
    body: (h) => `
<h2>Diesel, city by city</h2>
<p>The table ranks the cities by diesel price and shows the gap with regular gasoline on the same basis. Cities that only have a monthly Statistics Canada average show the estimate for tomorrow, labelled as such; the others show their latest official figure, with its date.</p>
${table(h)}
<p>Two things stand out. First, the gap with gasoline is wide everywhere, which points to the wholesale market rather than to any provincial policy. Second, taxes shift the picture only a little: per-litre diesel taxes are higher than gasoline taxes in Quebec, New Brunswick and Newfoundland and Labrador, equal in Ontario, Alberta, Saskatchewan and Manitoba, and the 3-cent ARTM levy of the Montréal region applies to gasoline only.</p>
<h2>Why the estimate for diesel rarely moves</h2>
<p>For gasoline, this site carries the last official figure forward with a daily signal: the Régie de l'énergie's morning survey in the Montréal region, once its taxes are removed. No such daily survey is published for diesel. The only market data are the daily rack prices that Ontario publishes for Toronto, Thunder Bay and Edmonton, about a week after the fact. When those prices are newer than the last survey, which happens with monthly averages, the estimate moves; with a weekly survey, it usually does not.</p>
<p>The past error is printed regardless. For Toronto diesel, the method missed the next weekly survey by ${h.cpl(tor.bt?.mae ?? 0)} on average over ${tor.bt?.n ?? 0} weeks, the same as repeating the last price. Saying so is more useful than a confident number nobody can check.</p>
${h.mini('demain', { p: ['v'], d: { v: 'halifax', c: 'diesel' }, t: 'Diesel tomorrow in your city' })}
<h2>Diesel taxes</h2>
<p>The federal excise tax on diesel is 4 cents a litre, suspended since April 20, 2026 like the 10-cent tax on gasoline. Under Finance Canada's draft legislation (proposed, not enacted) it returns at 2 cents on February 1, 2027 and at 4 cents on April 1, 2027. Provincial rates on diesel are 9 cents in Ontario, 20.2 in Quebec, 15 in British Columbia outside the transit regions, 15 in Saskatchewan, 12.5 in Manitoba, 15.4 in Nova Scotia, 15.45 in New Brunswick and 9.5 in Newfoundland and Labrador. Alberta's 13-cent tax, on diesel as on gasoline, has not been collected since October 1, 2026. Sales tax applies on top, and businesses registered for GST or HST recover it as an input tax credit.</p>
${h.mini('taxes', { p: ['v'], d: { v: 'calgary', c: 'diesel' }, t: 'Taxes in a litre of diesel' })}
<h2>The cost of running on diesel</h2>
<p>Diesel engines use fewer litres for the same distance, which offsets part of the higher price. Natural Resources Canada's 2026 fuel consumption ratings give a median of ${h.n(pick, 1)} L/100 km for standard diesel pickups and ${h.n(pickG, 1)} for gasoline ones. Whether the diesel version costs less to run depends on the price gap in your city, which you can test with the budget calculator on the ${h.a('cheapest', 'city ranking page')} or the fill-up calculator below.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(tor.latest.value * 10) / 10, r: 90 }, t: 'A diesel pickup fill-up' })}
<h2>Fleet and farm use</h2>
<p>For a business, the useful price is the one before sales tax, since GST or HST paid on fuel is recovered as an input tax credit. The tax calculator above separates that line, so the net cost per litre can be read directly. Diesel used off the road, on farms or in fishing boats, is taxed under separate provincial rules that this site does not model: the figures here are road diesel at the pump. For a heavy vehicle, the monthly budget tool lets you enter the litres you buy and see how a one-cent move in the price changes the bill.</p>
<p>Atlantic regulators set the diesel maximum along with the gasoline one: in Halifax and Moncton the ceiling is reset on Fridays, in St. John's every day for now. A ceiling is not an average: stations may sell below it.</p>
`,
  },
});
