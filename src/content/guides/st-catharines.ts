import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'st-catharines';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const br = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const NAME = K.cityName(ID, 'en');
const south = K.fuelOf('hamilton', 'regular')!.latest.value;
const SOUTH = K.proxyName(K.city('hamilton').proxy!, 'en');
// Variations d'une semaine à l'autre dans la série publiée.
const HV = K.HIST[ID]?.regular ?? [];
const moves = HV.slice(1).map(([dt, v], i) => [dt, v - HV[i][1]] as [string, number]);
const meanAbs = moves.length ? moves.reduce((a, [, m]) => a + Math.abs(m), 0) / moves.length : 0;
const bigUp = moves.length ? Math.max(...moves.map(([, m]) => m)) : 0, bigDown = moves.length ? Math.min(...moves.map(([, m]) => m)) : 0;
const onList = K.PRICED_IDS.filter((id) => K.city(id).prov === 'ON' && !K.city(id).proxy).map((id) => ({ id, p: K.fuelOf(id, 'regular')!.latest.value })).sort((a, b) => a.p - b.p);
const rank = onList.findIndex((x) => x.id === ID) + 1;
const rankTxt = rank === 1 ? 'the cheapest' : rank === onList.length ? 'the most expensive' : `number ${rank} from the cheapest`;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 110, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['hamilton', 'toronto', 'tomorrow', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-st-catharines',
    nav: 'St. Catharines', card: 'Niagara survey, weekly swings, Ontario ranking',
    title: 'Gas Prices St. Catharines and Niagara 2026: Weekly Survey',
    description: 'Gas prices in St. Catharines and Niagara in 2026: the weekly Ontario survey, how much the price moves each week, tomorrow’s estimate and the tax share.',
    h1: 'Gas prices in St. Catharines and Niagara',
    intro: `In St. Catharines and Niagara, regular averaged ${c(r.latest.value)} at the ${E.day(r.latest.date)} survey, and the estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}.`,
    resume: `The Government of Ontario surveys St. Catharines as its own market every Monday, and the figure stands for the Niagara area around it. At the ${K.when(r, 'en')}, regular gasoline there averaged ${c(r.latest.value)}, premium ${c(pr.latest.value)} and diesel ${c(d.latest.value)}, taxes included, which made Niagara ${rankTxt} of the ${onList.length} Ontario cities on this site with a surveyed market of their own. Over the last ${HV.length} surveys, the regular price moved by ${c(meanAbs)} a week on average. For ${E.day(K.TOMORROW)} the site estimates ${c(r.est.value)}, adding to Monday's price the pre-tax change in the Régie de l'énergie du Québec's daily Montreal survey with HST; replayed on ${r.bt?.n ?? 0} weeks, the method missed by ${c(r.bt?.mae ?? 0)} on average, a no-change guess by ${c(r.bt?.maeNaive ?? 0)}. Taxes, Ontario's 9 cents a litre plus 13% HST with the federal excise suspended since April 20, 2026, are ${E.p(br.taxShare)} of the price.`,
    faqs: [
      { q: 'Does the St. Catharines gas price cover Niagara Falls and Welland?', a: `The provincial survey labels the market St. Catharines, and it is the only market the province publishes for the Niagara Peninsula, so this page uses it for the area. It is an average, not a reading for each town: stations in Niagara Falls, Welland or Grimsby can post prices a few cents away from it in a given week.` },
      { q: 'How much do gas prices in St. Catharines change from week to week?', a: `Over the last ${HV.length} Ontario surveys, the regular price moved by ${c(meanAbs)} a week on average, with the largest rise at ${K.cents(bigUp, 'en')} and the largest drop at ${K.cents(bigDown, 'en')}. The estimate on this page tries to catch those moves before the next Monday survey, using the daily wholesale signal from Quebec.` },
      { q: 'Is gas in St. Catharines cheaper than the southern Ontario average?', a: `At the latest survey St. Catharines and Niagara was at ${c(r.latest.value)} and ${SOUTH} at ${c(south)}, a difference of ${K.cents(r.latest.value - south, 'en')}. The southern figure blends many towns, so the gap varies; the Hamilton page sets the two series side by side week by week.` },
    ],
    body: (h) => `
<h2>One market for the Niagara Peninsula</h2>
<p>The province's weekly survey has a market called St. Catharines, and it is the only one of its markets on the Niagara Peninsula. This page uses it for the whole area and labels it ${NAME}. Each figure in the table is dated and attributed; the estimate column is what the method expects for ${h.day(K.TOMORROW)}.</p>
${facts(h, ID)}

<h2>How much the price moves in a week</h2>
<p>A weekly survey hides how much ground the price covers between two Mondays. The published series shows it after the fact. Across the last ${h.n(moves.length)} weekly changes, the average move in either direction was ${h.cpl(meanAbs)}; the sharpest rise was ${h.cents(bigUp)} and the sharpest fall ${h.cents(bigDown)}.</p>
${h.table(['Survey', 'Regular', 'Change on the week'], [...moves].reverse().map(([dt, m]) => [h.day(dt), h.cpl(HV.find(([x]) => x === dt)![1]), h.cents(m)]), `${NAME}, Government of Ontario weekly survey, most recent first.`, ['l', 'r', 'r'])}
<p>Those swings set the bar for any estimate. Repeating last Monday's price would have missed by ${h.cpl(r.bt?.maeNaive ?? 0)} on average over ${h.n(r.bt?.n ?? 0)} weeks; the method used here, which follows the eastern wholesale market each day through the Québec survey, brought that down to ${h.cpl(r.bt?.mae ?? 0)}. That is good enough to tell whether the price is heading up or down, not to predict the posted price at a given station.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Tomorrow in St. Catharines and Niagara' })}

<h2>Niagara among Ontario cities</h2>
<p>Ranked by the latest Monday survey, Niagara was ${rankTxt} of the ${h.n(onList.length)} Ontario cities on this site with their own surveyed market. The order shifts often, as the weekly changes above suggest.</p>
${h.mini('classement', { p: ['c'], d: { z: 'ON' }, t: 'Ontario cities by price' })}
<p>For a closer neighbour, the ${h.a('hamilton', 'Hamilton page')} compares this market with ${SOUTH} week by week, and the ${h.a('toronto', 'Toronto page')} covers the two halves of the Greater Toronto Area.</p>

<h2>Fill-ups, premium and diesel in Niagara</h2>
<p>In money terms, a weekly move of ${h.cpl(meanAbs)} is worth ${h.usd(meanAbs * K.P.tank.midsize / 100)} on a ${K.P.tank.midsize}-litre fill-up, and the largest rise in the series ${h.usd(Math.abs(bigUp) * K.P.tank.midsize / 100)}. At the survey price the full ${K.P.tank.midsize} litres of regular cost ${h.usd(K.fillCost(K.P.tank.midsize, r.latest.value))}; a ${K.P.tank.pickup}-litre pickup tank of diesel, ${h.usd(K.fillCost(K.P.tank.pickup, d.latest.value))}. Premium was ${h.cpl(pr.latest.value - r.latest.value)} above regular and diesel ${h.cpl(d.latest.value - r.latest.value)} above it. Niagara sits on the border with New York State, but this site does not publish US prices; a comparison across the river needs a currency and a gallon conversion and has to count the bridge toll.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(r.latest.value * 10) / 10, r: K.P.tank.midsize }, t: 'Your fill-up in Niagara' })}

<h2>What is tax in a Niagara litre</h2>
<p>Every Ontario litre carries 9 cents of provincial gasoline tax and HST at 13% on the full price; Niagara has no extra local fuel tax. The breakdown at the latest survey:</p>
${taxTable(h, ID)}

<h2>The last Niagara surveys with diesel</h2>
${histTable(h, ID)}
<p>The ${h.a('cheapest', 'national ranking')} places this market among all Canadian cities covered.</p>
`,
  },
});
