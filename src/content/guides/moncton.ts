import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'moncton';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brD = K.cityBreakdown(ID, 'diesel', d.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const REG = K.P.regulators.nb;
const nbTax = K.exciseAt(K.fuelSteps('NB'), K.TOMORROW, 'regular'), nbTaxD = K.exciseAt(K.fuelSteps('NB'), K.TOMORROW, 'diesel');
/** Frais de livraison maximaux autorisés en plus du prix plafond (note de params-2026.json). */
const DELIV = 4.75;
const nextReset = (() => { const t = new Date(`${K.TODAY}T12:00:00Z`); for (let i = 1; i <= 7; i++) { const x = new Date(t.getTime() + i * 864e5); if (REG.changeDays.includes(x.getUTCDay())) return x.toISOString().slice(0, 10); } return K.TOMORROW; })();
const sc = r.monthly;
const SJ = K.proxyName('saint-john', 'en');
const hfx = K.fuelOf('halifax', 'regular')!.latest.value;
const TANK = K.P.tank.midsize;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 401, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['halifax', 'st-johns', 'taxes', 'tomorrow'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-moncton',
    nav: 'Moncton', card: 'One New Brunswick maximum, delivery charge, Friday reset',
    title: 'Gas Prices Moncton 2026: New Brunswick Maximum This Week',
    description: 'Gas prices in Moncton in 2026: the province-wide maximum set each Friday by the New Brunswick Energy and Utilities Board, the delivery charge and the tax.',
    h1: 'Gas prices in Moncton and the New Brunswick maximum',
    intro: `In Moncton the maximum price for self-serve regular is ${c(r.latest.value)} this week, set on ${E.day(r.latest.date)} for all of New Brunswick.`,
    resume: `Moncton has no gas price average of its own because New Brunswick regulates the price instead. Each Friday at 12:01 a.m. the New Brunswick Energy and Utilities Board sets one maximum for the whole province, so Moncton, Saint John and Fredericton share the same ceiling. The maximum in force since ${E.day(r.latest.date)} is ${c(r.latest.value)} for self-serve regular, ${c(pr.latest.value)} for premium and ${c(d.latest.value)} for diesel, taxes included. A retailer may add a delivery charge of up to ${E.n(DELIV, 2)} cents, so the highest legal posted price for regular is ${c(r.latest.value + DELIV)}, while a station may also sell below the cap. ${r.regChangesTomorrow === false ? `No reset falls on ${E.day(K.TOMORROW)}, so tomorrow's estimate is the current cap;` : `A reset is due on ${E.day(K.TOMORROW)};`} the next scheduled one is ${E.day(nextReset)}. Tested on ${r.bt?.n ?? 0} months of Statistics Canada's ${SJ} series, the estimation method missed by ${c(r.bt?.mae ?? 0)} on average. Of the regular cap, ${E.p(br.taxShare)} is tax: ${E.n(nbTax, 2)} cents of provincial tax and 15% HST, the federal excise being suspended since April 20, 2026.`,
    faqs: [
      { q: 'Is the gas price in Moncton the same as in Saint John and Fredericton?', a: `The maximum is the same. The New Brunswick Energy and Utilities Board sets one ceiling for the whole province every Friday, so Moncton, Saint John and Fredericton share it. Posted prices can still differ: a station may sell below the cap, and may add a delivery charge of up to ${E.n(DELIV, 2)} cents a litre on top of it.` },
      { q: 'What is the delivery charge on gas in Moncton?', a: `New Brunswick's rules allow a retailer to add up to ${E.n(DELIV, 2)} cents a litre to the regulated maximum to cover delivery. With it, the most a Moncton station can legally post for regular this week is ${c(r.latest.value + DELIV)}. On a ${TANK}-litre fill-up, the full charge would add ${K.dollars(DELIV * TANK / 100, 'en')}.` },
      { q: 'What day do gas prices change in Moncton?', a: `Friday. The Board publishes the new maximums for the week and they take effect at 12:01 a.m. that day. The current cap has applied since ${E.day(r.latest.date)}, and the next scheduled change is on ${E.day(nextReset)}. Between those dates, stations may lower their posted price but not raise it above the cap.` },
    ],
    body: (h) => `
<h2>One ceiling for the whole province</h2>
<p>New Brunswick is one of the provinces that regulates pump prices, and it does so with a single maximum for all of its territory. The New Brunswick Energy and Utilities Board publishes it every Friday. Moncton has no other official price: the figures below are those caps, taxes included, dated from the Friday they took effect.</p>
${facts(h, ID)}
<p>Because the number is a ceiling, it describes the most a station may charge, not what most stations charge. ${sc ? `Statistics Canada's monthly average for ${SJ}, the closest measure of prices actually paid, was ${h.cpl(sc.value)} for ${K.month(sc.date, 'en')}, ${h.cents(sc.value - r.latest.value)} from the cap now in force; the two cover different periods.` : ''}</p>

<h2>The delivery charge on top of the cap</h2>
<p>New Brunswick's rules let a retailer add a delivery charge of up to ${h.n(DELIV, 2)} cents a litre to the regulated maximum. It does not have to be charged, and the Board's figure does not include it. That gives a range for this week in Moncton:</p>
${h.table(['Fuel', 'Maximum', 'With the full delivery charge', `${TANK} L at the full ceiling`], [['Regular', h.cpl(r.latest.value), h.cpl(r.latest.value + DELIV), h.usd(K.fillCost(TANK, r.latest.value + DELIV))], ['Premium', h.cpl(pr.latest.value), h.cpl(pr.latest.value + DELIV), h.usd(K.fillCost(TANK, pr.latest.value + DELIV))], ['Diesel', h.cpl(d.latest.value), h.cpl(d.latest.value + DELIV), h.usd(K.fillCost(TANK, d.latest.value + DELIV))]], `New Brunswick, maximums in force since ${h.day(r.latest.date)}.`, ['l', 'r', 'r', 'r'])}
<p>The fill-up calculator below takes the price on the sign, which already includes any delivery charge the station applies.</p>
${h.mini('plein', { p: ['p', 'r', 'e'], d: { p: Math.round(r.latest.value * 10) / 10, r: TANK }, t: 'A fill-up in Moncton' })}

<h2>The weekly cycle</h2>
<p>The Board sets the new maximums on Friday at 12:01 a.m. The current ones date from ${h.day(r.latest.date)}, and the next scheduled change is on ${h.day(nextReset)}. ${r.regChangesTomorrow === false ? `For ${h.day(K.TOMORROW)} there is no reset, so the estimate repeats the cap.` : ''} Because each new ceiling follows the wholesale market of the previous days, the ${h.a('tomorrow', 'tomorrow page')} and the wholesale trend give a hint of the direction of the next one, but only the Board's publication fixes it.</p>

<p>The cap also moves with tax changes dated in advance. The return of the federal excise, at half rate on February 1, 2027 and in full on April 1, 2027 under Finance Canada's draft legislation, would raise the ceiling itself, since the published maximum includes every tax, with HST at 15% charged on top of the excise.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'NB' }, t: 'The 2027 excise return in New Brunswick' })}

<h2>What a Moncton litre pays in tax</h2>
<p>New Brunswick's gasoline tax is ${h.n(nbTax, 2)} cents a litre and its motive fuel tax on diesel ${h.n(nbTaxD, 2)} cents. HST at 15% applies to the full price. At the current caps, taxes are ${h.p(br.taxShare)} of a litre of regular and ${h.p(brD.taxShare)} of a litre of diesel.</p>
${taxTable(h, ID)}

<h2>Moncton against Halifax</h2>
<p>Nova Scotia regulates too, by zone. The Halifax cap for regular is ${h.cpl(hfx)}, which is ${h.cents(hfx - r.latest.value)} relative to New Brunswick's. The two provinces tax fuel differently, and the comparison is between ceilings, not averages. See the ${h.a('halifax', 'Halifax page')}, the ${h.a('st-johns', 'St. John’s page')} and the provincial ${h.a('taxes', 'tax comparison')}.</p>
${h.mini('classement', { p: ['c'], d: { z: 'A' }, t: 'Atlantic cities by price' })}
`,
  },
});
