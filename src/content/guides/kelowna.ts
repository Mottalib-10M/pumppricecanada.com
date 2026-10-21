import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { groupOf, sourcesOf } from './_ville';

const ID = 'kelowna';
const E = K.en;
const c = (x: number, dd = 1) => K.cpl(x, 'en', dd);
const RG = K.P.taxes.regional as Record<string, { regular: number; diesel: number; total?: { regular: number; diesel: number }; transit_share?: number }>;
const TL = RG['bc-translink'], VI = RG['bc-victoria'];
const gst = K.salesRate('BC');
const lines = K.perLitreTaxes(ID, 'regular', K.TOMORROW, 'en');
const linesD = K.perLitreTaxes(ID, 'diesel', K.TOMORROW, 'en');
const sum = (l: typeof lines) => l.reduce((a, x) => a + x.cpl, 0);
const kel = sum(lines), kelD = sum(linesD);
const prov = lines.find((x) => x.id === 'prov')!.cpl, provD = linesD.find((x) => x.id === 'prov')!.cpl;
const van = K.fuelOf('vancouver', 'regular')!, vic = K.fuelOf('victoria', 'regular')!;
const vanP = K.headline(van).value, vicP = K.headline(vic).value;
const gapVan = TL.regular * (1 + gst), gapVic = VI.regular * (1 + gst);
const exFull = K.exciseAt(K.EXCISE, '2027-04-01', 'regular'), exHalf = K.exciseAt(K.EXCISE, '2027-02-01', 'regular');
/** Le simulateur s'ouvre au prix estimé de Vancouver, à remplacer par le prix affiché (dit dans le texte). */
const START = Math.round(vanP * 10) / 10;
const TANK = K.P.tank.suv;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 305, city: ID,
  tool: 'plein', toolArg: { p: START },
  related: ['vancouver', 'victoria', 'calgary', 'taxes', 'forecast'],
  sources: [...sourcesOf(ID), 'nrcan-weekly'],
  en: {
    slug: 'gas-prices-kelowna',
    nav: 'Kelowna', card: 'No open average: B.C. taxes, Okanagan fill-up, Vancouver gap',
    title: 'Gas Prices Kelowna 2026: Taxes per Litre and Fill-Up Cost',
    description: 'Gas prices in Kelowna in 2026: why no open official average exists, the B.C. fuel tax and GST in each litre, the tax gap with Vancouver and Victoria, a fill-up.',
    h1: 'Gas prices in Kelowna: what is known, and what is not',
    intro: `Kelowna has no freely reusable official gas price, but each litre carries a known ${E.n(kel, 1)} cents of B.C. fuel tax plus ${E.r(gst)} GST, less than in Vancouver or Victoria.`,
    resume: `No public agency publishes a Kelowna gas price under a licence that allows it to be reproduced. Statistics Canada's monthly averages cover Vancouver and Victoria in British Columbia, not the Okanagan, and Natural Resources Canada's weekly city averages, which do list Kelowna, may be consulted but not republished, so this page links to them instead of copying them. What can be stated precisely is the tax. Outside Metro Vancouver and the Victoria area, a litre of gasoline in B.C. carries the provincial motor fuel tax of ${E.n(prov, 1)} cents, with no transit levy, and 5% GST is charged on the full price; the federal excise tax is at zero since April 20, 2026 and the B.C. carbon tax ended on April 1, 2025. That puts Kelowna ${E.n(TL.regular, 1)} cents a litre below Metro Vancouver's ${TL.total?.regular} cents and ${E.n(VI.regular, 1)} cents below the Victoria area's ${VI.total?.regular} cents before GST, or ${c(gapVan, 2)} and ${c(gapVic, 2)} with it. For a price, use the calculator with the figure on the sign: it opens at the Vancouver estimate of ${c(vanP)} only as a starting point.`,
    faqs: [
      { q: 'Why is there no official average gas price for Kelowna on this page?', a: 'Statistics Canada publishes monthly averages for Vancouver and Victoria only in British Columbia. Natural Resources Canada does publish weekly averages that include Kelowna, but their terms do not allow them to be reproduced, so the page links to them. Rather than invent a figure, it gives the exact taxes and a calculator for the price you see posted.' },
      { q: 'How much tax is in a litre of gas in Kelowna?', a: `B.C.'s motor fuel tax is ${E.n(prov, 1)} cents a litre on gasoline and ${E.n(provD, 1)} cents on diesel in Kelowna, with no regional transit tax. GST at 5% is added on the full price, which at a posted ${c(START)} is ${c(START * gst / (1 + gst), 2)}. The federal excise is suspended until at least January 31, 2027.` },
      { q: 'Should gas in Kelowna be cheaper than in Vancouver?', a: `On tax alone, yes: Metro Vancouver adds a ${E.n(TL.regular, 1)}-cent TransLink tax that Kelowna does not pay, worth ${c(gapVan, 2)} with GST. The pump price also depends on transport from the supply terminal, local competition and retail margins, which this site cannot measure for Kelowna, so the real gap can be smaller or larger.` },
      { q: 'How much will the 2027 excise return add in Kelowna?', a: `Under Finance Canada's draft legislation the federal excise on gasoline comes back at ${E.n(exHalf)} cents on February 1, 2027 and ${E.n(exFull)} cents on April 1, 2027. With 5% GST on top, that is ${c(exHalf * (1 + gst), 2)} and then ${c(exFull * (1 + gst), 2)} in Kelowna, the same as anywhere in B.C.` },
    ],
    body: (h) => `
<h2>Why this page has no Kelowna average</h2>
<p>A price page is only as good as its source. For Kelowna, the open sources run out. Statistics Canada's table 18-10-0001-01, the monthly series this site uses for western cities, includes Vancouver and Victoria for British Columbia but not the Okanagan. Natural Resources Canada does collect weekly averages by city, Kelowna among them, but those figures are not published under a licence that lets this site republish them. You can read them directly at the source: ${h.src('nrcan-weekly', 'Natural Resources Canada, average retail prices by city')}.</p>
<p>The page therefore does three things it can do with certainty: it states the tax that applies in Kelowna, it compares that tax with the two B.C. areas that pay more, and it turns the price on a sign into the cost of a fill-up.</p>

<h2>The tax in a Kelowna litre</h2>
<p>Kelowna is outside both B.C. transit tax areas, so only the provincial motor fuel tax applies per litre. GST then applies on the full price, including that tax. Provincial sales tax does not apply to road fuel in British Columbia.</p>
${h.table(['Tax', 'Regular gasoline', 'Diesel'], [...lines.map((x, i) => [x.label, h.cpl(x.cpl, 2), h.cpl(linesD[i].cpl, 2)]), [`<strong>Per-litre taxes before GST</strong>`, `<strong>${h.cpl(kel, 2)}</strong>`, `<strong>${h.cpl(kelD, 2)}</strong>`], [`GST (${h.r(gst)})`, 'on the full price', 'on the full price']], `Kelowna, B.C. tax rates applicable on ${h.day(K.TOMORROW)}.`, ['l', 'r', 'r'])}
<p>To find the GST inside a posted price, divide it by ${h.n((1 + gst) / gst)}: at ${h.cpl(START)}, it is ${h.cpl(START * gst / (1 + gst), 2)}. The share of tax in the price then follows from what you pay; at that same price, it would be ${h.p((kel + START * gst / (1 + gst)) / START)}.</p>

<h2>Kelowna against Vancouver and Victoria</h2>
<p>The two other B.C. regions add their own transit tax to the provincial rate. The comparison below is for tax only, not for the pump price.</p>
${h.table(['Area', 'Fuel tax per litre (regular)', 'Difference with Kelowna, GST included'], [['Kelowna (rest of B.C.)', h.cpl(kel, 1), ''], ['Metro Vancouver', h.cpl(TL.total?.regular ?? 0, 1), h.cents(gapVan, 2)], ['Victoria area', h.cpl(VI.total?.regular ?? 0, 1), h.cents(gapVic, 2)]], 'B.C. motor fuel tax, TransLink and BC Transit taxes, 5% GST.', ['l', 'r', 'r'])}
<p>For reference, the site's estimates for ${h.day(K.TOMORROW)} are ${h.cpl(vanP)} in ${h.a('vancouver', 'Vancouver')} and ${h.cpl(vicP)} in ${h.a('victoria', 'Victoria')}, both brought forward from a Statistics Canada monthly average. Subtracting the tax gap from them does not give a Kelowna price: transport from the supply terminals, competition among stations and retail margins differ in the Okanagan, and no open data measures them.</p>

<h2>Your fill-up in Kelowna</h2>
<p>The calculator at the top of the page and the one below start from the Vancouver estimate only so that they show a realistic result; replace it with the price on the sign. A ${TANK}-litre SUV tank at ${h.cpl(START)} costs ${h.usd(K.fillCost(TANK, START))}, and every cent per litre changes that by ${h.usd(TANK / 100)}.</p>
${h.mini('plein', { p: ['p', 'r', 'e'], d: { p: START, r: TANK }, t: 'A fill-up at the price posted in Kelowna' })}

<h2>The excise in 2027</h2>
<p>The federal excise tax, ${h.n(K.exciseAt(K.EXCISE, '2026-01-01', 'regular'))} cents a litre on gasoline before April 20, 2026, is planned to return at half rate on February 1, 2027 and in full on April 1, 2027. With GST, the full return adds ${h.cpl(exFull * (1 + gst), 2)} in Kelowna.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'BC' }, t: 'The excise return in British Columbia' })}
<p>For western cities that do have a published average, see ${h.a('calgary', 'Calgary')}, where Alberta's fuel tax relief changes the picture, and the ${h.a('taxes', 'provincial tax comparison')}.</p>
`,
  },
});
