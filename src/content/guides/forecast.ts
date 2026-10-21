import { defineGuide } from '../../lib/page-types';
import type { Helpers } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const E = K.en;
const ex = (d: string, f: 'regular' | 'diesel' = 'regular') => K.exciseAt(K.EXCISE, d, f);
const exFull = ex('2027-04-01'), exHalf = ex('2027-02-01');
const on = exFull * (1 + K.salesRate('ON'));
const tor = K.fuelOf('toronto', 'regular')!;
const wk = (K.HIST.toronto?.regular ?? []).slice(-12);
const wkVals = wk.map(([, v]) => v);
const wkLo = Math.min(...wkVals), wkHi = Math.max(...wkVals);
const wkLoD = wk.find(([, v]) => v === wkLo)?.[0] ?? K.TODAY, wkHiD = wk.find(([, v]) => v === wkHi)?.[0] ?? K.TODAY;
const nat = K.SNAP.national as { date: string; value: number; prev: [string, number] };
const yoy = nat.value / nat.prev[1] - 1;
const pe = K.fuelSteps('PE'), peBack = pe[0].regular;
const ab = K.fuelSteps('AB')[0].regular;
const cal = K.fuelOf('calgary', 'regular')!;

function schedule(h: Helpers) {
  const rows = K.PROVS.map((p) => {
    const r = K.salesRate(p);
    return [K.provName(p, 'en'), h.cents(exHalf * (1 + r)), h.cents((exFull - exHalf) * (1 + r)), h.cents(exFull * (1 + r))];
  });
  return h.table(['Province', 'Feb. 1, 2027', 'Apr. 1, 2027', 'Total'], rows, 'Federal excise return on regular gasoline, cents per litre, sales tax included, under the draft legislation schedule.', ['l', 'r', 'r', 'r']);
}

export default defineGuide({
  id: 'forecast', group: 'outils', order: 2,
  tool: 'accise', toolArg: { pr: 'ON' },
  related: ['tomorrow', 'taxes', 'calgary', 'toronto', 'cheapest'],
  sources: ['excise', 'excise-draft', 'tax-ab', 'tax-pe', 'ontario-retail', 'statcan'],
  en: {
    slug: 'gas-price-forecast',
    nav: 'Gas price forecast', card: 'What is already scheduled for 2027: excise, Alberta, P.E.I.',
    title: 'Gas Price Forecast Canada 2026 and 2027: Dated Tax Changes',
    description: 'Gas price forecast for late 2026 and 2027 in Canada: dated return of the federal excise tax, the Alberta and P.E.I. tax pauses and what no source can predict.',
    h1: 'Gas price forecast: what is already dated',
    intro: `If the draft schedule is enacted, the federal excise tax will add ${K.cpl(on, 'en')} to a litre of regular in Ontario from April 1, 2027.`,
    resume: `Nobody can forecast the market price of gasoline months ahead: it follows crude oil, refinery margins and the exchange rate, none of which is known in advance. What can be forecast are the tax changes that already have a date. The largest is the federal excise tax, suspended since April 20, 2026: under Finance Canada's draft legislation it returns at ${K.cpl(exHalf, 'en', 0)} on February 1, 2027 and at ${K.cpl(exFull, 'en', 0)} on April 1, 2027, which, sales tax included, adds ${K.cpl(on, 'en')} to a litre of regular in Ontario. Prince Edward Island's ${K.cpl(peBack, 'en', 2)} gasoline tax is suspended until January 31, 2027, and Alberta's ${K.cpl(ab, 'en', 0)} tax is not collected until at least December 31, 2026; from 2027 it depends each quarter on the price of WTI oil. For context, the Statistics Canada average for ${K.month(nat.date, 'en')} was ${K.cpl(nat.value, 'en')}, ${E.p(yoy, 1)} above ${K.month(nat.prev[0], 'en')}.`,
    faqs: [
      { q: 'Will gas prices go up in Canada in 2027?', a: `Taxes will, on known dates, if the draft legislation is enacted: the federal excise returns in two steps, in February and April 2027, worth ${K.cpl(on, 'en')} a litre in Ontario with HST. Whether the pump price rises overall depends on the market, which may move by more than that in either direction over the same months.` },
      { q: 'Is there an official gas price forecast for Canada?', a: 'No federal or provincial agency publishes a forecast of pump prices by city. Statistics Canada, the provinces and the regulators publish what prices were, not what they will be. Any figure presented as a month-ahead city forecast is a model, and this site only estimates the next day, with its past error printed next to it.' },
      { q: 'When does the Alberta fuel tax come back?', a: `Not before January 1, 2027. Under the Fuel Tax Relief Program the ${K.cpl(ab, 'en', 0)} tax is not collected from October 1 to at least December 31, 2026. After that, the rate is set each quarter at 0, 4.5, 9 or 13 cents depending on the WTI oil price, and it can rise by 9 cents at most from one quarter to the next.` },
    ],
    body: (h) => `
<h2>The calendar of known changes</h2>
<p>Four dates are written into law or into published drafts. On January 1, 2027 at the earliest, Alberta may start collecting its fuel tax again, at a rate set by the oil price. On February 1, 2027, Prince Edward Island's suspension ends and the federal excise comes back at half rate. On April 1, 2027, the excise returns in full. Each step is entered in the site's tax tables with its date, so the estimate for the day it takes effect already includes it.</p>
<p>The table shows what the excise return means in each province, sales tax included. The provinces with a harmonized sales tax see a little more than the 10 cents, because HST is charged on the excise itself.</p>
${schedule(h)}
<p>These steps come from draft legislation: Parliament can still change the dates or the rates. When the law is enacted or amended, the table and the calculators follow the official text on the next daily update.</p>
${h.mini('accise', { p: ['pr', 'm'], d: { pr: 'NS', m: 150 }, t: 'Your extra cost from 2027' })}
<h2>The last twelve weeks</h2>
<p>To give a sense of scale, the weekly Ontario survey for Toronto ranged from ${h.cpl(wkLo)} (${h.day(wkLoD)}) to ${h.cpl(wkHi)} (${h.day(wkHiD)}) over the last twelve weeks published, without any tax change in that period. The market alone moved the price by ${h.cpl(wkHi - wkLo)}, more than the full return of the excise. Planning a budget on the tax calendar alone would therefore miss most of the variation.</p>
${h.mini('budget', { p: ['k', 'q'], d: { v: 'toronto', k: 15000, q: 8.5 }, t: 'A year of driving at today’s price' })}
<h2>Prince Edward Island, a double step in February</h2>
<p>February 1, 2027 is the day two changes meet on the Island. The provincial gasoline tax of ${h.cpl(peBack, 2)}, suspended since September 26, 2026, comes back the same day the federal excise returns at half rate. With HST at ${h.p(K.salesRate('PE'), 0)} on top, a litre of regular would carry ${h.cpl((peBack + exHalf) * (1 + K.salesRate('PE')))} more than in January, before any market move. This site follows the Island only through its tax tables for now: no open city average for Charlottetown is published, so there is no price to carry forward, only the tax part, which the calculator gives exactly.</p>
<p>Diesel follows the same calendar with smaller federal steps: ${h.cpl(ex('2027-02-01', 'diesel'), 0)} in February and ${h.cpl(ex('2027-04-01', 'diesel'), 0)} in April. The calculator above switches to diesel with the fuel choice.</p>
<h2>Alberta, a moving rate</h2>
<p>Alberta's relief program ties the provincial fuel tax to WTI oil: the higher the crude price, the lower the tax, with four possible rates and a cap of 9 cents of increase per quarter. The September Statistics Canada average for Calgary, ${h.cpl(cal.latest.value)}, still included the tax; the estimate for tomorrow removes it, which is why the ${h.a('calgary', 'Calgary page')} shows a figure well below the monthly average. The rate for the first quarter of 2027 is not known yet, and this site will not guess it.</p>
<h2>Why no market forecast</h2>
<p>Estimating tomorrow is possible because the wholesale prices of the past few days are already published and pass to the pump with a short delay. Beyond a few days, the method has nothing to work with: futures prices for gasoline exist, but they are not open data, and they are a poor guide to the price at a given station months away. So this page gives what is certain, the dated tax changes, and leaves the market part blank. For the next day, with its measured error, see the ${h.a('tomorrow', 'gas price tomorrow page')}.</p>
`,
  },
});
