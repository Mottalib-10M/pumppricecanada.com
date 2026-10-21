import { defineGuide } from '../../lib/page-types';
import type { Helpers } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const E = K.en;
const ids = K.PRICED_IDS.filter((id) => !K.city(id).proxy);
const hp = (id: string) => K.headline(K.fuelOf(id, 'regular')!).value;
const isEst = (id: string) => K.headline(K.fuelOf(id, 'regular')!).isEstimate;
const date = (id: string) => (isEst(id) ? K.TOMORROW : K.fuelOf(id, 'regular')!.latest.date);
const bd = (id: string) => K.cityBreakdown(id, 'regular', hp(id), date(id), 'en');
const tax = (id: string) => { const b = bd(id); return b.salesTax + b.fuelTaxes.reduce((a, t) => a + t.cpl, 0); };
const sorted = [...ids].sort((a, b) => hp(a) - hp(b));
const lo = sorted[0], hi = sorted[sorted.length - 1];
const gap = hp(hi) - hp(lo);
const byPre = [...ids].sort((a, b) => (hp(a) - tax(a)) - (hp(b) - tax(b)));
const preLo = byPre[0], preHi = byPre[byPre.length - 1];
const preGap = (hp(preHi) - tax(preHi)) - (hp(preLo) - tax(preLo));
const taxLo = [...ids].sort((a, b) => tax(a) - tax(b))[0], taxHi = [...ids].sort((a, b) => tax(b) - tax(a))[0];
const taxPart = tax(hi) - tax(lo);
const van = 'vancouver', torP = hp('toronto') - tax('toronto');
const nOnt = ids.filter((id) => K.city(id).prov === 'ON');
const ontS = [...nOnt].sort((a, b) => hp(a) - hp(b));

function ranking(h: Helpers) {
  const rows = sorted.map((id, i) => [h.n(i + 1), h.a(id, h.cn(id)), h.cpl(hp(id)), h.cpl(tax(id)), h.cpl(hp(id) - tax(id)), isEst(id) ? 'estimate' : h.when(K.fuelOf(id, 'regular')!)]);
  return h.table(['#', 'City', 'Regular', 'Taxes', 'Before taxes', 'Figure'], rows, 'Regular gasoline, cents per litre, cheapest first. Taxes = per-litre taxes in force plus sales tax. Monthly averages are shown as tomorrow’s estimate.', ['r', 'l', 'r', 'r', 'r', 'l']);
}

export default defineGuide({
  id: 'cheapest', group: 'outils', order: 5,
  tool: 'classement', toolArg: { z: 'all' },
  related: ['taxes', 'calgary', 'vancouver', 'tomorrow', 'diesel'],
  sources: ['ontario-retail', 'regie', 'statcan', 'nseb', 'nbeub', 'pubnl', 'ontario-rack'],
  en: {
    slug: 'cheapest-gas-canada',
    nav: 'Cheapest gas by city', card: 'Every city ranked, with the share of taxes in the gap',
    title: 'Cheapest Gas in Canada by City in 2026: Ranking and Taxes',
    description: `Cheapest gas in Canada in 2026: ${ids.length} cities ranked by regular price, with the part of each price that is tax and what the gap is worth on a fill-up or a year.`,
    h1: 'Cheapest gas in Canada, city by city',
    intro: `Today ${K.cityName(lo, 'en')} has the lowest figure, ${K.cpl(hp(lo), 'en')}, and ${K.cityName(hi, 'en')} the highest, ${K.cpl(hp(hi), 'en')}.`,
    resume: `Among the ${ids.length} cities with their own official figure, regular gasoline is cheapest in ${K.cityName(lo, 'en')} at ${K.cpl(hp(lo), 'en')} and most expensive in ${K.cityName(hi, 'en')} at ${K.cpl(hp(hi), 'en')}, a gap of ${K.cpl(gap, 'en')}, or ${K.dollars(gap * 0.55, 'en')} on a 55-litre fill-up. Taxes explain part of the ranking, not all of it: per-litre taxes and sales tax range from ${K.cpl(tax(taxLo), 'en')} in ${K.cityName(taxLo, 'en')} to ${K.cpl(tax(taxHi), 'en')} in ${K.cityName(taxHi, 'en')}. Before taxes, the spread between the cheapest and the dearest market is still ${K.cpl(preGap, 'en')}, so wholesale costs, distance from refineries and local margins weigh as much as tax rates. Figures mix sources of different dates: the Régie de l'énergie's daily survey in Quebec, Ontario's weekly survey, Atlantic regulators' maximums and, in the West, Statistics Canada monthly averages brought to tomorrow by the published estimate. Each row of the table gives its source date.`,
    faqs: [
      { q: 'Which Canadian city has the cheapest gas in 2026?', a: `On the figures of ${E.day(K.TODAY)}, ${K.cityName(lo, 'en')}, at ${K.cpl(hp(lo), 'en')} for regular. The ranking changes with each survey, and western figures are estimates built from a monthly average, so a gap of a cent or two between two cities is within the error of the method rather than a real difference.` },
      { q: 'Why is gas so expensive in Vancouver compared with the rest of Canada?', a: `For two reasons. Metro Vancouver pays 27 cents a litre of provincial and regional tax on regular, including 18.5 cents for TransLink, against 14.5 cents in most of British Columbia and 9 cents in Ontario. But even before taxes, the estimate for Vancouver is ${K.cpl(hp(van) - tax(van), 'en')}, against ${K.cpl(torP, 'en')} for Toronto: the West Coast market itself is dearer.` },
      { q: 'Is the cheapest city the same for diesel?', a: 'Not necessarily. Diesel has its own wholesale market and its own per-litre tax rates, higher than for gasoline in Quebec, New Brunswick and Newfoundland and Labrador. Switch the calculator at the top of this page to diesel to see the ranking for that fuel, built the same way and from the same sources.' },
    ],
    body: (h) => `
<h2>The ranking</h2>
<p>Each city appears once, with its latest official figure or, where the only open source is a monthly average, the estimate for tomorrow. The two columns on the right split the price into taxes and the rest, which is what the market, the wholesalers and the stations charge.</p>
${ranking(h)}
<p>The suburbs that share a market with a larger city, such as Mississauga or Surrey, are left out of the ranking because their figure is that of the neighbouring market. Kelowna has no official average that can be reused, so it is not ranked either.</p>
<h2>Taxes or market?</h2>
<p>Of the ${h.cpl(gap)} between ${h.cn(lo)} and ${h.cn(hi)}, taxes account for ${h.cpl(taxPart)}; the rest, ${h.cpl(gap - taxPart)}, is what the product and the margins cost in each place. Before taxes, the cheapest market is ${h.cn(preLo)} and the dearest ${h.cn(preHi)}, ${h.cpl(preGap)} apart. The heaviest tax load per litre is in ${h.cn(taxHi)}, the lightest in ${h.cn(taxLo)}.</p>
<p>Two tax facts weigh on the ranking right now. In Alberta, the provincial fuel tax has not been collected since October 1, 2026, which leaves Calgary and Edmonton with little more than GST. In Metro Vancouver, the TransLink levy adds 18.5 cents a litre to the provincial tax before GST, and Victoria pays a 5.5-cent regional tax of its own. Quebec combines a higher fuel tax with two sales taxes, GST and QST, applied on top of it.</p>
<p>The market side has its own order. Ranked before taxes, the three lowest figures today are those of ${byPre.slice(0, 3).map((id) => h.cn(id)).join(', ')}, and the three highest those of ${byPre.slice(-3).reverse().map((id) => h.cn(id)).join(', ')}. That order owes nothing to provincial policy: it is what remains once every tax in force on the date of each figure is taken out.</p>
<h2>Reading figures of different dates</h2>
<p>A ranking of this kind compares figures that were not all collected on the same day. Quebec's come from this morning's survey, Ontario's from the last Monday survey, the Atlantic maximums from the regulator's latest order, and the western ones from a monthly average carried forward by the estimate. When the market moves fast, a city surveyed a week ago can look cheaper or dearer than it is today. That is why the last column gives the date or the word estimate for every row, and why a difference of a cent or two between two cities should not be read as a real gap.</p>

${h.mini('taxes', { p: ['v'], d: { v: hi }, t: 'Taxes in the most expensive city' })}
<h2>Within Ontario</h2>
<p>Ontario has the same tax rate everywhere, so differences between its cities come from the market only. On the last weekly survey, ${h.cn(ontS[0])} was the cheapest of the Ontario cities followed here at ${h.cpl(hp(ontS[0]))}, and ${h.cn(ontS[ontS.length - 1])} the dearest at ${h.cpl(hp(ontS[ontS.length - 1]))}. That gap of ${h.cpl(hp(ontS[ontS.length - 1]) - hp(ontS[0]))} reflects distance from the refineries and terminals, local competition and the week of the survey, all of which move.</p>
${h.mini('comparer', { p: ['w'], d: { v: ontS[0], w: ontS[ontS.length - 1] }, t: 'Two Ontario cities side by side' })}
<h2>What the gap is worth</h2>
<p>A gap per litre only matters through the litres you buy. For a driver covering 15,000 km a year at 8.5 L/100 km, about 1,275 litres, the full gap between the first and last city of the ranking is worth ${h.usd(gap * 12.75)} a year. Few people can choose their city for fuel, but those who commute across a provincial or regional border, such as between Gatineau and Ottawa, or into Metro Vancouver from the Fraser Valley, face part of that gap every week. The ${h.a('taxes', 'gas taxes page')} explains each line of the tax column.</p>
`,
  },
});
