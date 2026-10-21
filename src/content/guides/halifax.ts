import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'halifax';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const REG = K.P.regulators['ns-zone1'];
const nsTax = K.exciseAt(K.fuelSteps('NS'), K.TOMORROW, 'regular'), nsTaxD = K.exciseAt(K.fuelSteps('NS'), K.TOMORROW, 'diesel');
/** Prochain jour où le régulateur refixe le maximum (changeDays, 0 = dimanche). */
const nextReset = (() => { const t = new Date(`${K.TODAY}T12:00:00Z`); for (let i = 1; i <= 7; i++) { const x = new Date(t.getTime() + i * 864e5); if (REG.changeDays.includes(x.getUTCDay())) return x.toISOString().slice(0, 10); } return K.TOMORROW; })();
const sc = r.monthly;
const mon = K.fuelOf('moncton', 'regular')!.latest.value;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 400, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['moncton', 'st-johns', 'taxes', 'forecast'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-halifax',
    nav: 'Halifax', card: 'Regulated maximum price, Friday reset, premium monthly',
    title: 'Gas Prices Halifax 2026: Maximum Price Set Each Friday',
    description: 'Gas prices in Halifax in 2026: the maximum pump price set by the Nova Scotia Energy Board for Zone 1, when it changes, premium from Statistics Canada and taxes.',
    h1: 'Gas prices in Halifax: the regulated maximum',
    intro: `The maximum price for regular gasoline in Halifax is ${c(r.latest.value)}, in force since ${E.day(r.latest.date)}; the next scheduled reset is on ${E.day(nextReset)}.`,
    resume: `Gasoline and diesel prices in Halifax are capped. The Nova Scotia Energy Board sets a maximum pump price for each zone of the province, and Halifax is in Zone 1; the figure on this page is that maximum, taxes included, not an average of what stations charge, and a station may sell for less. The maximum in force since ${E.day(r.latest.date)} is ${c(r.latest.value)} for self-serve regular and ${c(d.latest.value)} for diesel. The Board sets new prices every Friday at 12:01 a.m. and sometimes mid-week, so ${r.regChangesTomorrow === false ? `no change is scheduled for ${E.day(K.TOMORROW)} and the current cap is also the estimate for that day` : `a new maximum may apply on ${E.day(K.TOMORROW)}`}. Premium is not on the list used here: its figure is the Statistics Canada monthly average, ${c(pr.latest.value)} for ${K.month(pr.latest.date, 'en')}, brought forward to ${c(pr.est.value)} with the wholesale price. The method, replayed on ${pr.bt?.n ?? 0} months of that series, erred by ${c(pr.bt?.mae ?? 0)} on average. Taxes are ${E.p(br.taxShare)} of the regular price: ${E.n(nsTax, 1)} cents of Nova Scotia fuel tax and 14% HST, the federal excise being suspended since April 20, 2026.`,
    faqs: [
      { q: 'When do gas prices change in Halifax?', a: `The Nova Scotia Energy Board resets the maximum price every Friday at 12:01 a.m., and sometimes adjusts it mid-week as well. Stations may change their own price at any time as long as they stay at or below the maximum. The current Zone 1 cap has been in force since ${E.day(r.latest.date)}.` },
      { q: 'Can a Halifax gas station charge less than the maximum price?', a: `Yes. The regulated figure is a ceiling, not a fixed price. Stations in Halifax are free to sell below it, and nothing in the public data says how far below any one of them sits. That is why this page calls the number a maximum and never an average price paid at the pump.` },
      { q: 'Why does Halifax premium gas use a different source?', a: `The page draws its Zone 1 maximums for regular and diesel from the Board, and does not read a premium maximum from that feed. For premium it uses Statistics Canada's monthly Halifax average instead, ${c(pr.latest.value)} for ${K.month(pr.latest.date, 'en')}, and brings it forward to today with the wholesale price and the dated taxes. It is an estimate, labelled as one.` },
    ],
    body: (h) => `
<h2>A price ceiling, not an average</h2>
<p>Nova Scotia regulates gasoline and diesel prices. The Nova Scotia Energy Board publishes a maximum retail price for each zone of the province, and the Halifax area is Zone 1. That changes how to read the number: it is the highest price a station may post for self-serve fuel, taxes included, and the price you see on the sign can be lower but not higher. The table below states the source and date of each figure.</p>
${facts(h, ID)}
${sc ? `<p>Statistics Canada's monthly average for regular in Halifax, a measure of prices actually charged, was ${h.cpl(sc.value)} for ${K.month(sc.date, 'en')}. Set against the cap now in force, that is ${h.cents(sc.value - r.latest.value)}, though the two cover different periods: a month of prices paid on one side, a ceiling for the current week on the other.</p>` : ''}

<h2>The Friday reset</h2>
<p>The Board resets prices every Friday at 12:01 a.m., and sometimes mid-week as well when the market moves enough. The current cap took effect on ${h.day(r.latest.date)}; the next scheduled reset falls on ${h.day(nextReset)}. ${r.regChangesTomorrow === false ? `Since no reset is scheduled for ${h.day(K.TOMORROW)}, the estimate for that day is simply the cap in force.` : `A reset is possible on ${h.day(K.TOMORROW)}, so the cap shown may be replaced.`} Between resets, stations can change their price as they like, as long as it stays at or below the maximum.</p>
<p>For a Halifax driver the practical consequence is timing. Because the cap is reset from wholesale prices, a week of falling wholesale prices points to a lower cap on Friday and a week of rising ones to a higher cap; filling only what you need before a reset that looks lower can save a little. The ${h.a('forecast', 'outlook page')} follows the wholesale trend.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Halifax: the cap tomorrow' })}

<h2>Premium in Halifax</h2>
<p>The cap the site reads for Zone 1 covers regular and diesel. For premium the page falls back on Statistics Canada's monthly average, ${h.cpl(pr.latest.value)} for ${K.month(pr.latest.date, 'en')}. The month is over, so the figure is carried to today with the change in the wholesale price and any dated tax change, which gives ${h.cpl(pr.est.value)}. It is an estimate, and labelled as one.</p>

<h2>Taxes in a Halifax litre</h2>
<p>Nova Scotia charges ${h.n(nsTax, 1)} cents a litre of motive fuel tax on gasoline and ${h.n(nsTaxD, 1)} cents on diesel, and HST has been 14% since April 1, 2025. The federal excise tax is suspended for now and due back in two steps in 2027.</p>
${taxTable(h, ID)}
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'NS' }, t: 'The 2027 excise return in Nova Scotia' })}

<h2>Halifax against Moncton</h2>
<p>New Brunswick also caps prices, with one maximum for the whole province. The current New Brunswick cap for regular is ${h.cpl(mon)}, so ${h.cents(mon - r.latest.value)} relative to Halifax. Both are ceilings, so the comparison is between two maximums, not two averages. ${h.a('moncton', 'Moncton')} and ${h.a('st-johns', 'St. John’s')} have their own pages.</p>
${h.mini('comparer', { p: ['w', 'c'], d: { v: ID, w: 'moncton' }, t: 'Halifax against Moncton' })}
`,
  },
});
