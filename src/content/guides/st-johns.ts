import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'st-johns';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brD = K.cityBreakdown(ID, 'diesel', d.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const nlTax = K.exciseAt(K.fuelSteps('NL'), K.TOMORROW, 'regular'), nlTaxD = K.exciseAt(K.fuelSteps('NL'), K.TOMORROW, 'diesel');
const daily = r.regChangesTomorrow === true;
const sc = r.monthly;
const hfx = K.fuelOf('halifax', 'regular')!.latest.value, mon = K.fuelOf('moncton', 'regular')!.latest.value;
const rate = K.salesRate('NL');
const exFullD = K.exciseAt(K.EXCISE, '2027-04-01', 'diesel') * (1 + rate), exFullR = K.exciseAt(K.EXCISE, '2027-04-01', 'regular') * (1 + rate);
const TANK = K.P.tank.pickup;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 402, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['halifax', 'moncton', 'taxes', 'diesel'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-st-johns',
    nav: 'St. John’s', card: 'Avalon Zone 1 maximum, reset daily for now, diesel',
    title: 'Gas Prices St. John’s 2026: Avalon Zone 1 Maximum Price',
    description: 'Gas prices in St. John’s in 2026: the Zone 1 maximum set by the Public Utilities Board, reset daily for now, diesel, premium from Statistics Canada and taxes.',
    h1: 'Gas prices in St. John’s: the Avalon maximum',
    intro: `The maximum price for self-serve regular in St. John's is ${c(r.latest.value)}, set by the Public Utilities Board for Zone 1 on ${E.day(r.latest.date)}.`,
    resume: `St. John's gas prices are capped by the Board of Commissioners of Public Utilities of Newfoundland and Labrador, which sets a maximum for each zone; St. John's is in Zone 1, the Avalon Peninsula. The figure here is that ceiling, taxes included, and stations may sell below it. The cap dated ${E.day(r.latest.date)} is ${c(r.latest.value)} for self-serve regular and ${c(d.latest.value)} for diesel. The Board normally resets prices every Friday, but since October 2026 it has been setting them every day because of market volatility, so ${daily ? `a new maximum is expected for ${E.day(K.TOMORROW)} and the page repeats the current one until it is published` : `the current cap also stands as the estimate for ${E.day(K.TOMORROW)}`}. Premium is taken from Statistics Canada's monthly average for St. John's, ${c(pr.latest.value)} for ${K.month(pr.latest.date, 'en')}, brought to ${c(pr.est.value)} with the wholesale change; over ${pr.bt?.n ?? 0} months the method erred by ${c(pr.bt?.mae ?? 0)} on average. Tax is ${E.p(br.taxShare)} of a litre of regular: ${E.n(nlTax, 1)} cents of provincial gasoline tax and 15% HST, the federal excise being suspended since April 20, 2026.`,
    faqs: [
      { q: 'Why do gas prices in St. John’s change every day right now?', a: 'The Public Utilities Board normally sets new maximum prices once a week, on Friday. Since October 2026 it has been setting them every day, citing volatility in the market. As long as that lasts, the cap for St. John’s and the rest of the Avalon can change overnight, and the figure on this page is dated so you can see which day it belongs to.' },
      { q: 'What is the maximum diesel price in St. John’s today?', a: `The Zone 1 cap for diesel, dated ${E.day(d.latest.date)}, is ${c(d.latest.value)}, taxes included. Newfoundland and Labrador taxes diesel at ${E.n(nlTaxD, 1)} cents a litre before HST, more than gasoline. A ${TANK}-litre pickup tank filled at the full cap costs ${K.dollars(K.fillCost(TANK, d.latest.value), 'en')}.` },
      { q: 'Is gas more expensive in St. John’s than in Halifax or Moncton?', a: `On the current caps, St. John's regular at ${c(r.latest.value)} is ${K.cents(r.latest.value - hfx, 'en')} against Halifax and ${K.cents(r.latest.value - mon, 'en')} against New Brunswick. All three are regulated maximums set on different schedules, so the comparison holds for the dates shown and can shift with the next reset in any of the three provinces.` },
    ],
    body: (h) => `
<h2>The Zone 1 cap</h2>
<p>Newfoundland and Labrador divides the province into pricing zones, and the Board of Commissioners of Public Utilities sets a maximum retail price in each. St. John's belongs to Zone 1, on the Avalon Peninsula. The price on a sign in the city can be lower than this cap, never higher, and the cap already includes all taxes.</p>
${facts(h, ID)}
${sc ? `<p>For a measure of what was actually paid, Statistics Canada's monthly average for regular in St. John's was ${h.cpl(sc.value)} for ${K.month(sc.date, 'en')}. Set against the cap dated ${h.day(r.latest.date)}, that is ${h.cents(sc.value - r.latest.value)}, but the two describe different periods, a past month and the current day.</p>` : ''}

<h2>A daily reset, for now</h2>
<p>The Board's usual rhythm is weekly, with new maximums each Friday. Since October 2026 it has been resetting them every day because of market volatility, which means the St. John's cap can change overnight. ${daily ? `A new maximum is therefore expected for ${h.day(K.TOMORROW)}. Until it is published, the page keeps the cap in force rather than guessing the next one.` : ''} When the Board returns to its weekly schedule, the page will follow it.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'St. John’s: the cap tomorrow' })}

<h2>Diesel on the Avalon</h2>
<p>Diesel is capped at ${h.cpl(d.latest.value)}, ${h.cpl(d.latest.value - r.latest.value)} above regular. Part of the gap is tax: the province charges ${h.n(nlTaxD, 1)} cents a litre on diesel against ${h.n(nlTax, 1)} on gasoline, rates made permanent by a statute assented on March 30, 2026, and HST at 15% then applies to a higher base. Taxes are ${h.p(brD.taxShare)} of the diesel cap.</p>
${taxTable(h, ID, 'diesel')}
<p>The federal excise on diesel, 4 cents a litre before its suspension, is lower than on gasoline. When it returns in full on April 1, 2027 under Finance Canada's draft legislation, it adds ${h.cpl(exFullD, 2)} with HST on diesel and ${h.cpl(exFullR, 2)} on gasoline. The ${h.a('diesel', 'diesel page')} covers the fuel nationally.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'NL', c: 'diesel' }, t: 'The excise return in Newfoundland and Labrador' })}

<h2>Premium, from a different source</h2>
<p>The Zone 1 cap the site reads covers regular and diesel only, so premium comes from Statistics Canada's monthly average for St. John's: ${h.cpl(pr.latest.value)} for ${K.month(pr.latest.date, 'en')}, carried to ${h.cpl(pr.est.value)} with the wholesale change since then. It is an estimate and is labelled so.</p>

<h2>Filling up at the cap</h2>
<p>Because the cap is the highest price allowed, it gives an upper bound on what a fill-up can cost in St. John's this week. A ${K.P.tank.midsize}-litre tank of regular costs at most ${h.usd(K.fillCost(K.P.tank.midsize, r.latest.value))}, a ${TANK}-litre pickup tank of diesel at most ${h.usd(K.fillCost(TANK, d.latest.value))}. If the sign shows less, enter it below to see the actual bill.</p>
${h.mini('plein', { p: ['p', 'r', 'e'], d: { p: Math.round(r.latest.value * 10) / 10, r: K.P.tank.midsize }, t: 'A fill-up in St. John’s' })}

<h2>St. John's in the Atlantic</h2>
<p>Nova Scotia and New Brunswick regulate too. Their current caps for regular are ${h.cpl(hfx)} in ${h.a('halifax', 'Halifax')} and ${h.cpl(mon)} across ${h.a('moncton', 'New Brunswick')}. The provincial rates are compared on the ${h.a('taxes', 'tax page')}.</p>
${h.mini('classement', { p: ['c'], d: { z: 'A' }, t: 'Atlantic caps, cheapest first' })}
`,
  },
});
