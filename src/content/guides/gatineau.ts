import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'gatineau';
const r = K.fuelOf(ID, 'regular')!;
const ott = K.fuelOf('ottawa', 'regular')!;
const pOtt = K.headline(ott).value;
const brE = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brF = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'fr');
const tax = (b: typeof brE) => b.salesTax + b.lines.reduce((a, x) => a + x.cpl, 0);
const ottB = K.cityBreakdown('ottawa', 'regular', pOtt, K.TOMORROW, 'en');
const qcRate = K.perLitreTaxes(ID, 'regular', K.TOMORROW, 'en').filter((x) => x.id !== 'excise').reduce((a, x) => a + x.cpl, 0);
const saved = Math.abs(K.perLitreTaxes(ID, 'regular', K.TOMORROW, 'en').find((x) => x.id === 'zone')?.cpl ?? 0) * (1 + K.salesRate('QC'));
const gap = r.latest.value - pOtt;
const E = K.en, F = K.fr;
const c = (x: number) => K.cpl(x, 'en');
const cf = (x: number) => K.cpl(x, 'fr');
const flat = Math.abs(r.est.value - r.latest.value) < 0.05;
const sideE = Math.abs(gap) < 0.05 ? 'level with Ottawa' : `${c(Math.abs(gap))} ${gap > 0 ? 'above' : 'below'} the latest Ottawa survey`;
const sideF = Math.abs(gap) < 0.05 ? 'au niveau d\'Ottawa' : `${cf(Math.abs(gap))} ${gap > 0 ? 'au-dessus du' : 'sous le'} dernier relevé d'Ottawa`;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 203, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['ottawa', 'montreal', 'sherbrooke', 'taxes', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-gatineau',
    nav: 'Gatineau', card: 'Daily Régie figure, 6-cent border reduction, Ottawa gap',
    title: 'Gas Prices Gatineau Today vs Ottawa, Border Tax Cut 2026',
    description: 'Gas prices in Gatineau in 2026: the daily Régie de l\'énergie average, the 6-cent Quebec tax reduction near Ontario and how a fill-up compares with Ottawa.',
    h1: 'Gas prices in Gatineau, across the river from Ottawa',
    intro: `Regular gasoline averaged ${c(r.latest.value)} in Gatineau on ${E.day(r.latest.date)}, ${sideE}.`,
    resume: `Gatineau's official gas price is the daily average that the Régie de l'énergie du Québec publishes for the region every morning. On ${E.day(r.latest.date)} it was ${c(r.latest.value)} for regular gasoline, taxes included, ${sideE} (${E.day(ott.latest.date)}). ${flat ? `No wholesale price newer than the survey is available yet, so the estimate for ${E.day(K.TOMORROW)} repeats ${c(r.est.value)}` : `The estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}`}; the Gatineau series is too recent on this site to measure the method's past error. Because the city sits on the Ontario border, Quebec cuts its fuel tax by 6 cents a litre within 15 km of Ontario, so a Gatineau litre pays ${c(qcRate)} of provincial tax instead of 19.2 cents, plus GST and QST: ${E.p(brE.taxShare)} of the price in all. The Régie survey covers regular only, and no open official source publishes premium or diesel for Gatineau, so this page shows regular gasoline alone.`,
    faqs: [
      { q: 'Why is Quebec gas tax lower in Gatineau?', a: 'Quebec reduces its fuel tax for stations close to its borders, to limit the incentive to cross over to fill up. Within 15 km of the Ontario border, the reduction on gasoline is 6 cents a litre, which brings the 19.2-cent rate down for Gatineau stations near the Ottawa River. GST and QST are then charged on that lower base, which saves a little more than the 6 cents.' },
      { q: 'Is it cheaper to fill up in Gatineau or in Ottawa?', a: 'The answer changes with the market, and the two official figures are not published on the same rhythm: the Régie gives Gatineau a daily average, while Ontario surveys Ottawa every Monday. The comparison on this page uses the newest figure of each, with its date. Ontario\'s taxes per litre are lower, but the Quebec border reduction narrows that difference.' },
      { q: 'Are diesel prices published for Gatineau?', a: 'Not in an open official source. The Régie de l\'énergie surveys regular gasoline only, and Statistics Canada does not publish a Gatineau series for diesel or premium. Rather than borrow another city\'s number, this page leaves those grades out. For diesel near the border, the Ottawa page has the weekly Ontario figure, which reflects Ontario taxes.' },
    ],
    body: (h) => `
<h2>A border city with a daily price</h2>
<p>Gatineau faces Ottawa across the Ottawa River, and the price of a litre on each side is set by two different provincial tax systems. On the Quebec side, the Régie de l'énergie publishes an average every morning, which makes Gatineau's official figure fresher than Ottawa's weekly Ontario survey.</p>
${facts(h, ID)}
<p>The table has a single line because the Régie surveys regular gasoline only and no other open source covers Gatineau. The "past error" column is still empty: the Gatineau series on this site does not yet cover enough days to replay the estimate. The ${h.src('regie', 'Régie\'s regional survey')} keeps the history of previous days.</p>

<h2>The 6-cent border reduction</h2>
<p>Quebec's fuel tax is 19.2 cents a litre of gasoline in most of the province. Near its borders, the province lowers it so that stations are not left at a disadvantage against their neighbours: within 15 km of Ontario, the reduction is 6 cents. The page applies that band to Gatineau, which leaves ${h.cpl(qcRate)} of Quebec tax in each litre. With GST and QST at a combined 14.975% charged on top, the reduction is worth ${h.cpl(saved, 2)} at the pump.</p>
${taxTable(h, ID)}
<p>The reduction depends on the distance between a station and the border, so a station well inside the province can be taxed differently from one close to the river. The federal excise tax, suspended since April 20, 2026, is the same on both banks; the ${h.a('taxes', 'tax page')} has its planned return in 2027.</p>

<h2>Gatineau and Ottawa, litre for litre</h2>
<p>At their latest official figures, tax takes ${h.cpl(tax(brE))} of a Gatineau litre and ${h.cpl(tax(ottB))} of an Ottawa litre. Ontario charges 9 cents of gasoline tax and 13% HST; Quebec, even after the border reduction, charges more per litre and a higher sales tax. Whatever is left between the two pump prices after that is the product and the retail margin.</p>
${h.mini('comparer', { p: ['w', 'r'], d: { v: ID, w: 'ottawa' }, t: 'Gatineau against Ottawa' })}
<p>Keep the dates in mind when reading the result: the Gatineau figure is from this morning, the Ottawa one from the Monday survey. Ottawa's own estimate for tomorrow uses the Régie's daily Montreal figure as its market signal, which is shown on the ${h.a('ottawa', 'Ottawa page')}.</p>

<h2>Your fill-up in Gatineau</h2>
<p>A 50-litre fill-up at this morning's Gatineau average costs ${h.usd(K.fillCost(50, r.latest.value))}. If you read a different price on a station sign, enter it below to see the cost of your own tank.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(r.latest.value * 10) / 10 }, t: 'A fill-up at a Gatineau station' })}
<p>Each cent per litre on that 50-litre tank is worth ${h.usd(0.5)}. The ${h.a('cheapest', 'city ranking')} places Gatineau among the other Quebec markets with an official figure.</p>
`,
  },
  fr: {
    slug: 'prix-essence-gatineau',
    nav: 'Gatineau', card: 'Chiffre quotidien de la Régie, réduction frontalière de 6 ¢, écart avec Ottawa',
    title: 'Prix essence Gatineau aujourd\'hui, écart avec Ottawa 2026',
    description: 'Prix de l\'essence à Gatineau en 2026 : moyenne quotidienne de la Régie, taxe réduite de 6 ¢ près de l\'Ontario et comparaison d\'un plein avec celui d\'Ottawa.',
    h1: 'Prix de l\'essence à Gatineau, face à Ottawa',
    intro: `L'essence ordinaire s'affichait en moyenne à ${cf(r.latest.value)} à Gatineau le ${F.day(r.latest.date)}, ${sideF}.`,
    resume: `Le prix officiel de l'essence à Gatineau est la moyenne quotidienne que la Régie de l'énergie du Québec publie chaque matin pour la région. Le ${F.day(r.latest.date)}, elle s'établissait à ${cf(r.latest.value)} pour l'ordinaire, taxes comprises, ${sideF} (${F.day(ott.latest.date)}). ${flat ? `Faute de prix de gros plus récent que le relevé, l'estimation du ${F.day(K.TOMORROW)} reprend ${cf(r.est.value)}` : `L'estimation du ${F.day(K.TOMORROW)} est de ${cf(r.est.value)}`} ; la série de Gatineau est encore trop récente sur ce site pour mesurer l'écart passé de la méthode. Comme la ville borde l'Ontario, Québec réduit sa taxe sur les carburants de 6 ¢ le litre à moins de 15 km de la frontière : un litre vendu à Gatineau paie ${cf(qcRate)} de taxe provinciale au lieu de 19,2 ¢, puis la TPS et la TVQ, soit ${F.p(brF.taxShare)} du prix. Le relevé de la Régie ne porte que sur l'ordinaire et aucune source officielle ouverte ne publie la super ni le diesel pour Gatineau : la page s'en tient donc à l'essence ordinaire.`,
    faqs: [
      { q: 'Pourquoi la taxe sur l\'essence est-elle plus basse à Gatineau ?', a: 'Le Québec réduit sa taxe sur les carburants pour les stations proches de ses frontières, afin de limiter l\'intérêt d\'aller faire le plein de l\'autre côté. À moins de 15 km de l\'Ontario, la réduction sur l\'essence est de 6 ¢ le litre, ce qui abaisse le taux de 19,2 ¢ pour les stations gatinoises proches de la rivière des Outaouais. La TPS et la TVQ portent ensuite sur cette base réduite : l\'économie dépasse légèrement les 6 ¢.' },
      { q: 'Vaut-il mieux faire le plein à Gatineau ou à Ottawa ?', a: 'La réponse dépend du marché, et les deux chiffres officiels ne paraissent pas au même rythme : la Régie donne une moyenne quotidienne pour Gatineau, alors que l\'Ontario relève Ottawa chaque lundi. La comparaison de cette page prend le chiffre le plus récent de chaque côté, avec sa date. Les taxes ontariennes au litre sont plus basses, mais la réduction frontalière québécoise réduit cet écart.' },
      { q: 'Le prix du diesel est-il publié pour Gatineau ?', a: 'Pas dans une source officielle ouverte. La Régie de l\'énergie ne relève que l\'essence ordinaire, et Statistique Canada ne publie aucune série de Gatineau pour le diesel ni pour la super. Plutôt que d\'emprunter le chiffre d\'une autre ville, cette page laisse ces carburants de côté. Pour le diesel près de la frontière, la page d\'Ottawa donne le relevé hebdomadaire de l\'Ontario, taxes ontariennes comprises.' },
    ],
    body: (h) => `
<h2>Une ville frontalière au prix quotidien</h2>
<p>Gatineau fait face à Ottawa, de l'autre côté de la rivière des Outaouais, et le prix du litre sur chaque rive dépend de deux régimes fiscaux provinciaux distincts. Côté québécois, la Régie de l'énergie publie une moyenne tous les matins : le chiffre officiel de Gatineau est donc plus frais que le relevé hebdomadaire de l'Ontario pour Ottawa.</p>
${facts(h, ID)}
<p>Le tableau ne compte qu'une ligne : la Régie ne relève que l'essence ordinaire et aucune autre source ouverte ne couvre Gatineau. La colonne de l'écart passé reste vide, car la série de Gatineau sur ce site ne couvre pas encore assez de jours pour rejouer l'estimation. Le ${h.src('regie', 'relevé régional de la Régie')} conserve l'historique des jours précédents.</p>

<h2>La réduction frontalière de 6 ¢</h2>
<p>Dans la plus grande partie du Québec, la taxe sur les carburants est de 19,2 ¢ le litre d'essence. Près des frontières, la province l'abaisse pour ne pas désavantager ses stations face à leurs voisines : à moins de 15 km de l'Ontario, la réduction atteint 6 ¢. La page applique cette tranche à Gatineau, ce qui laisse ${h.cpl(qcRate)} de taxe québécoise dans chaque litre. Avec la TPS et la TVQ, 14,975 % à elles deux, calculées par-dessus, la réduction vaut ${h.cpl(saved, 2)} à la pompe.</p>
${taxTable(h, ID)}
<p>La réduction dépend de la distance entre la station et la frontière : une station située loin à l'intérieur de la province peut être taxée autrement qu'une station proche de la rivière. La taxe d'accise fédérale, suspendue depuis le 20 avril 2026, est la même sur les deux rives ; la page ${h.a('taxes', 'des taxes')} présente son retour prévu en 2027.</p>

<h2>Gatineau et Ottawa, litre contre litre</h2>
<p>Aux derniers chiffres officiels, les taxes prennent ${h.cpl(tax(brF))} d'un litre à Gatineau et ${h.cpl(tax(ottB))} d'un litre à Ottawa. L'Ontario prélève 9 ¢ de taxe sur l'essence et une TVH de 13 % ; le Québec, même après la réduction frontalière, perçoit davantage au litre et une taxe de vente plus élevée. Ce qui reste entre les deux prix à la pompe tient au produit et à la marge des détaillants.</p>
${h.mini('comparer', { p: ['w', 'r'], d: { v: ID, w: 'ottawa' }, t: 'Gatineau face à Ottawa' })}
<p>Gardez les dates en tête en lisant le résultat : le chiffre de Gatineau date de ce matin, celui d'Ottawa du relevé du lundi. L'estimation du lendemain pour Ottawa s'appuie d'ailleurs sur le chiffre quotidien de la Régie à Montréal comme signal du marché, ce que montre la page ${h.a('ottawa', 'd\'Ottawa')}.</p>

<h2>Votre plein à Gatineau</h2>
<p>Un plein de 50 litres à la moyenne gatinoise de ce matin coûte ${h.usd(K.fillCost(50, r.latest.value))}. Si le panneau de votre station affiche un autre prix, entrez-le ci-dessous pour connaître le coût de votre propre réservoir.</p>
${h.mini('plein', { p: ['p', 'r'], d: { p: Math.round(r.latest.value * 10) / 10 }, t: 'Un plein dans une station de Gatineau' })}
<p>Chaque cent par litre sur ce réservoir de 50 litres vaut ${h.usd(0.5)}. Le ${h.a('cheapest', 'classement des villes')} situe Gatineau parmi les autres marchés québécois dotés d'un chiffre officiel.</p>
`,
  },
});
