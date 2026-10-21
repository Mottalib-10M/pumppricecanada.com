import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, histTable, groupOf, sourcesOf } from './_ville';

const ID = 'edmonton';
const r = K.fuelOf(ID, 'regular')!, d = K.fuelOf(ID, 'diesel')!;
const cal = K.fuelOf('calgary', 'regular')!;
const E = K.en;
const c = (x: number) => K.cpl(x, 'en');
const mon = K.month(r.latest.date, 'en');
const gst = K.salesRate('AB');
const br = K.cityBreakdown(ID, 'regular', r.est.value, K.TOMORROW, 'en');
const WEST = K.PRICED_IDS.filter((id) => ['BC', 'AB', 'SK', 'MB'].includes(K.city(id).prov) && !K.city(id).proxy).map((id) => ({ id, p: K.headline(K.fuelOf(id, 'regular')!).value })).sort((a, b) => a.p - b.p);
const pos = WEST.findIndex((x) => x.id === ID) + 1;
const posTxt = pos === 1 ? 'the cheapest' : `number ${pos}`;
const gapCal = cal.est.value - r.est.value;
const dGap = d.est.value - r.est.value;
const H = K.HIST[ID]?.diesel ?? [];

export default defineGuide({
  id: ID, group: groupOf(ID), order: 307, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['calgary', 'saskatoon', 'regina', 'cheapest', 'diesel'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-edmonton',
    nav: 'Edmonton', card: 'The western wholesale hub, rank in the West, diesel',
    title: 'Gas Prices Edmonton 2026, Wholesale Hub and Diesel Cost',
    description: 'Gas prices in Edmonton in 2026: the Statistics Canada monthly average, today\'s estimate from the local rack price, its rank in the West and the diesel gap.',
    h1: 'Gas prices in Edmonton',
    intro: `Edmonton regular gasoline is estimated at ${c(r.est.value)} for ${E.day(K.TOMORROW)}, ${posTxt} of the ${WEST.length} western cities with their own official series.`,
    resume: `Edmonton plays two roles on this site. Like every western city, its official open price is the Statistics Canada monthly average, ${c(r.latest.value)} a litre for regular and ${c(d.latest.value)} for diesel in ${mon}. It is also the wholesale reference: the Government of Ontario publishes a daily rack price for Edmonton, and that price is what carries every western monthly average forward to today. For Edmonton itself, the rack change since ${mon} and any dated tax change, such as the suspension of the 13-cent Alberta fuel tax on October 1, 2026, give an estimate of ${c(r.est.value)} for ${E.day(K.TOMORROW)}. Tested on ${r.bt?.n ?? 0} months, this method was off by ${c(r.bt?.mae ?? 0)} on average, where repeating the previous month was off by ${c(r.bt?.maeNaive ?? 0)}. That puts Edmonton ${posTxt} among the ${WEST.length} western cities with a series of their own. While the Alberta tax and the federal excise are not collected, GST is the only tax in the litre: ${E.p(br.taxShare)} of the estimate.`,
    faqs: [
      { q: 'Why does this site use the Edmonton rack price for western cities?', a: 'Edmonton is the refining and pipeline hub of the Prairies, and the Government of Ontario publishes a daily wholesale (rack) price for it under an open licence. This site has found no other open daily price for Western Canada. The estimate for Vancouver, Calgary, Regina or Winnipeg adds the change in that Edmonton price since the last monthly average, so it captures market moves without inventing a local figure.' },
      { q: 'Is gas cheaper in Edmonton than in Calgary?', a: 'The two cities pay exactly the same taxes, so the difference is in the product and retail margins. The comparison on this page uses the estimates for both cities, built from the same monthly source and the same rack price, so the gap it shows is like for like. Station prices within each city vary by more than that average gap.' },
      { q: 'How much more does diesel cost than gasoline in Edmonton?', a: 'Diesel follows its own refinery market, and in Alberta it pays the same taxes as gasoline per litre while the provincial fuel tax and the federal excise are at zero. So the whole gap between the two fuels in Edmonton comes from the product. The page shows that gap at today\'s estimates and the monthly diesel averages of Statistics Canada for the past year.' },
    ],
    body: (h) => `
<h2>The wholesale hub behind every western estimate</h2>
<p>A monthly average is a good benchmark and a poor price for today. To bring it forward, the site needs a daily market signal for Western Canada, and the only open one is the Edmonton rack price published by the Government of Ontario. ${r.est.rackDelta ? `Its value on ${h.day(r.est.rackNowLast!)} was ${h.cents(r.est.rackDelta)} away from its ${mon} average, which becomes ${h.cents(r.est.rackDelta * (1 + gst))} at an Alberta pump once GST is added.` : `No rack value newer than ${mon} is available yet, so the estimate keeps the monthly level for now.`} The same movement feeds the estimates for Vancouver, Calgary, Regina, Saskatoon and Winnipeg.</p>
${facts(h, ID)}
<p>The rack price is published about a week late, so the estimate knows the market up to that day and not beyond. Its measured error, shown in the last column, is the honest test of that limitation: it compares each past estimate with the Statistics Canada average that followed.</p>

<h2>Where Edmonton ranks in the West</h2>
<p>Among the ${WEST.length} western cities that have a Statistics Canada series of their own, Edmonton is ${posTxt} at the estimates for ${h.day(K.TOMORROW)}, with ${h.cn(WEST[0].id)} lowest at ${h.cpl(WEST[0].p)} and ${h.cn(WEST[WEST.length - 1].id)} highest at ${h.cpl(WEST[WEST.length - 1].p)}. Tax is a large part of that spread: Alberta currently charges only GST, while B.C. cities carry transit fuel taxes and Saskatchewan and Manitoba charge their own provincial rates.</p>
${h.mini('classement', { p: ['c'], d: { z: 'W' }, t: 'Western cities, cheapest first' })}
<p>The full ${h.a('cheapest', 'Canada ranking')} adds Ontario, Quebec and the Atlantic provinces.</p>

<h2>Edmonton and Calgary</h2>
<p>Both Alberta cities pay identical taxes, and their estimates rely on the same rack price, so the comparison isolates the retail market. At the estimates for ${h.day(K.TOMORROW)}, ${Math.abs(gapCal) < 0.05 ? 'the two cities are level' : `${gapCal > 0 ? 'Calgary' : 'Edmonton'} is ${h.cpl(Math.abs(gapCal))} higher`}.</p>
${h.mini('comparer', { p: ['w', 'k'], d: { v: ID, w: 'calgary' }, t: 'Edmonton against Calgary or another city' })}
<p>The ${h.a('calgary', 'Calgary page')} looks in detail at the Alberta fuel tax relief, which stopped the 13-cent provincial tax on October 1, 2026, and at what the oil-price formula could mean from January 2027.</p>

<h2>Tax in an Edmonton litre</h2>
<p>For now, an Edmonton litre of gasoline carries no per-litre tax at all: the Alberta fuel tax is not collected under the relief program and the federal excise has been suspended since April 20, 2026. The 5% GST, ${h.cpl(br.salesTax)} at the estimated price, is the only line left.</p>
${taxTable(h, ID)}

<h2>Diesel in Edmonton</h2>
<p>At the estimates for ${h.day(K.TOMORROW)}, diesel costs ${h.cpl(Math.abs(dGap))} ${dGap >= 0 ? 'more' : 'less'} than regular in Edmonton. With the same per-litre taxes on both fuels in Alberta at the moment, that gap is entirely the product. The monthly diesel series below shows how it has moved; ${H.length > 1 ? `from ${K.month(H[0][0], 'en')} to ${K.month(H[H.length - 1][0], 'en')}, the Edmonton diesel average changed by ${h.cents(H[H.length - 1][1] - H[0][1])}.` : ''}</p>
${histTable(h, ID)}
<p>The ${h.a('diesel', 'diesel page')} compares that spread across Canada, and the ${h.a('saskatoon', 'Saskatoon page')} covers the nearest market to the east.</p>
`,
  },
});
