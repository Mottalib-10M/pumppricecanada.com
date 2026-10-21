import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'laval';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const mtl = K.fuelOf('montreal', 'regular')!;
const gap = r.latest.value - mtl.latest.value;
const brE = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brF = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'fr');
const fixed = brE.lines.reduce((a, x) => a + x.cpl, 0);
const E = K.en, F = K.fr;
const c = (x: number) => K.cpl(x, 'en');
const cf = (x: number) => K.cpl(x, 'fr');
const flat = Math.abs(r.est.value - r.latest.value) < 0.05;
const sameDay = r.latest.date === mtl.latest.date;
const vsE = Math.abs(gap) < 0.05 ? 'exactly the Montreal figure' : `${K.cpl(Math.abs(gap), 'en')} ${gap < 0 ? 'below' : 'above'} the Montreal average`;
const vsF = Math.abs(gap) < 0.05 ? 'exactement le chiffre de Montréal' : `${K.cpl(Math.abs(gap), 'fr')} ${gap < 0 ? 'sous' : 'au-dessus de'} la moyenne de Montréal`;
const suv = K.vehicleL100('suv-small', 'regular');

export default defineGuide({
  id: ID, group: groupOf(ID), order: 201, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['montreal', 'quebec-city', 'sherbrooke', 'tomorrow', 'cheapest'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-laval',
    nav: 'Laval', card: 'Laval\'s own daily average, next to Montreal',
    title: 'Gas Prices Laval Today vs Montreal, Commute Cost 2026',
    description: 'Gas prices in Laval in 2026: the region\'s own daily Régie average, how it compares with Montreal, the taxes in a litre and a commuter\'s yearly fuel budget.',
    h1: 'Gas prices in Laval and the gap with Montreal',
    intro: `Regular gasoline averaged ${c(r.latest.value)} in Laval on ${E.day(r.latest.date)}, ${vsE}.`,
    resume: `Laval is not folded into Montreal in the official data: the Régie de l'énergie du Québec treats it as its own administrative region and publishes a separate daily average for it. On ${E.day(r.latest.date)} that average was ${c(r.latest.value)} for regular gasoline, ${vsE}${sameDay ? ' on the same day' : ''}. ${flat ? `Because no newer wholesale price has been published since the survey, the estimate for ${E.day(K.TOMORROW)} keeps ${c(r.est.value)}` : `The estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}`}, and over ${r.bt?.n ?? 0} past days that approach missed the next morning by ${c(r.bt?.mae ?? 0)} on average. Laval has no premium or diesel series of its own, so those lines reuse the Statistics Canada monthly average for Montreal. Taxes are the same as on the island: 19.2 cents of Quebec fuel tax, the 3-cent ARTM levy and GST plus QST, together ${E.p(brE.taxShare)} of the litre.`,
    faqs: [
      { q: 'Is gas cheaper in Laval than in Montreal?', a: 'It depends on the day. Both regions pay exactly the same taxes, since Laval is inside the ARTM territory and charges the same 3-cent transit levy as the island. The difference between the two daily averages of the Régie therefore reflects station prices only. This page shows both figures for the same morning, so the answer you read is the answer for today.' },
      { q: 'Why does Laval use Montreal prices for diesel?', a: 'The Régie de l\'énergie only surveys regular gasoline, and Statistics Canada publishes its monthly average for the Montreal area, not for Laval. Rather than invent a figure, the page uses that Montreal series for premium and diesel and labels it as such. For regular gasoline, Laval has its own daily average and that is the one shown.' },
      { q: 'How much does a commute from Laval cost in fuel?', a: 'It depends on the distance and the vehicle. The budget calculator on this page takes the kilometres you drive in a year and the median fuel consumption of 2026 models in your vehicle class, published by Natural Resources Canada, and prices them at the Laval estimate for tomorrow. Change the vehicle or the distance to see your own figure.' },
    ],
    body: (h) => `
<h2>Laval has its own number</h2>
<p>Laval sits on Île Jésus, across the Rivière des Prairies from Montreal, and in the eyes of the Régie de l'énergie it is a region in its own right. The Régie publishes a daily average for it, separate from the island's, which means a driver in Laval does not have to rely on a Montreal figure for regular gasoline. Premium and diesel are another story, as the table shows: neither the Régie nor Statistics Canada publishes them for Laval, so the Montreal monthly averages stand in.</p>
${facts(h, ID)}
<p>Those borrowed lines are clearly a monthly benchmark: their date is a month, not a day, and the figure in the estimate column brings them forward with the wholesale price. For regular, the figure is from this morning. The Régie's history is not under an open licence, so the page keeps only the day's value and links to the ${h.src('regie', 'Régie survey')} for earlier days.</p>

<h2>Laval or the island: where to fill up</h2>
<p>Because the two regions share their whole tax structure, any gap between them is a pure station-price gap. ${sameDay ? `This morning the Laval figure is ${vsE}.` : `The latest Laval figure is ${vsE}.`} The calculator below turns that difference into dollars for a fill-up and for a year of driving.</p>
${h.mini('comparer', { p: ['w', 'k'], d: { v: ID, w: 'montreal' }, t: 'Laval and Montreal, side by side' })}
<p>A gap of a cent or two rarely justifies a detour across a bridge: on a 55-litre tank, each cent per litre is worth ${h.usd(0.55)}. Regional averages also hide a spread between individual stations that is often wider than the gap between the two regions. For the whole province, the ${h.a('cheapest', 'city ranking')} lists every market with an official figure.</p>

<h2>A commuter's fuel budget</h2>
<p>For a driver who commutes from Laval into Montreal or toward the Laurentides, the yearly bill matters more than the price of one fill-up. A small SUV with the median 2026 rating of ${h.n(suv, 1)} L/100 km, driven 15,000 km a year, burns about ${h.n(K.litresFor(15000, suv))} litres; at the Laval estimate for ${h.day(K.TOMORROW)} that is ${h.usd(K.fillCost(K.litresFor(15000, suv), r.est.value), 0)} a year.</p>
${h.mini('budget', { p: ['u', 'k'], d: { v: ID, u: 'suv-small', k: 15000 }, t: 'Your year of driving from Laval' })}
<p>Real consumption in stop-and-go traffic is usually higher than the label, so the result is a floor rather than a ceiling. Each extra 10 cents per litre adds ${h.usd(K.litresFor(15000, suv) * 0.1, 0)} to that yearly total.</p>

<h2>What the tax adds in Laval</h2>
<p>Laval belongs to the territory of the Autorité régionale de transport métropolitain, so its gasoline carries the 3-cent ARTM levy in addition to the Quebec fuel tax of 19.2 cents. GST and QST, at a combined 14.975%, are then charged on a price that already includes both. Per litre this morning, that makes ${h.cpl(fixed)} of fixed tax and ${h.cpl(brE.salesTax)} of sales tax.</p>
${taxTable(h, ID)}
<p>The federal excise tax is suspended since April 20, 2026; if the draft schedule of Finance Canada is enacted, half of it returns on February 1, 2027 and all 10 cents on April 1, 2027. The ${h.a('tomorrow', 'tomorrow page')} shows how the estimate will absorb those dated changes.</p>
`,
  },
  fr: {
    slug: 'prix-essence-laval',
    nav: 'Laval', card: 'La moyenne quotidienne propre à Laval, à côté de Montréal',
    title: 'Prix essence Laval aujourd\'hui, écart avec Montréal 2026',
    description: 'Prix de l\'essence à Laval en 2026 : la moyenne quotidienne de la Régie, l\'écart avec Montréal, les taxes au litre et le budget carburant d\'un navetteur.',
    h1: 'Prix de l\'essence à Laval et écart avec Montréal',
    intro: `L'essence ordinaire valait ${cf(r.latest.value)} en moyenne à Laval le ${F.day(r.latest.date)}, ${vsF}.`,
    resume: `Dans les données officielles, Laval n'est pas noyée dans Montréal : la Régie de l'énergie du Québec la traite comme une région administrative à part entière et publie chaque jour une moyenne qui lui est propre. Le ${F.day(r.latest.date)}, cette moyenne était de ${cf(r.latest.value)} pour l'ordinaire, ${vsF}${sameDay ? ' le même jour' : ''}. ${flat ? `Faute de prix de gros publié depuis le relevé, l'estimation du ${F.day(K.TOMORROW)} conserve ${cf(r.est.value)}` : `L'estimation du ${F.day(K.TOMORROW)} est de ${cf(r.est.value)}`} ; rejouée sur ${r.bt?.n ?? 0} jours, cette approche a manqué le chiffre du lendemain de ${cf(r.bt?.mae ?? 0)} en moyenne. Laval n'a pas de série propre pour la super ni pour le diesel : ces lignes reprennent la moyenne mensuelle de Statistique Canada pour Montréal. Les taxes sont celles de l'île : 19,2 ¢ de taxe québécoise, 3 ¢ de taxe de l'ARTM, puis la TPS et la TVQ, soit ${F.p(brF.taxShare)} du litre.`,
    faqs: [
      { q: 'L\'essence est-elle moins chère à Laval qu\'à Montréal ?', a: 'Cela change d\'un jour à l\'autre. Les deux régions paient exactement les mêmes taxes, puisque Laval fait partie du territoire de l\'ARTM et supporte la même taxe de 3 ¢ que l\'île. L\'écart entre les deux moyennes quotidiennes de la Régie ne reflète donc que les prix des stations. Cette page affiche les deux chiffres du même matin : la réponse que vous lisez vaut pour aujourd\'hui.' },
      { q: 'Pourquoi Laval reprend-elle les prix du diesel de Montréal ?', a: 'La Régie de l\'énergie ne relève que l\'essence ordinaire, et Statistique Canada publie sa moyenne mensuelle pour la région de Montréal, pas pour Laval. Plutôt que d\'inventer un chiffre, la page utilise cette série montréalaise pour la super et le diesel, en l\'indiquant clairement. Pour l\'ordinaire, Laval a sa propre moyenne quotidienne, et c\'est elle qui est affichée.' },
      { q: 'Combien coûte en carburant un trajet quotidien depuis Laval ?', a: 'Tout dépend de la distance et du véhicule. Le calculateur de budget de cette page part des kilomètres parcourus en un an et de la consommation médiane des modèles 2026 de votre catégorie, publiée par Ressources naturelles Canada, puis les valorise à l\'estimation de demain pour Laval. Changez le véhicule ou la distance pour obtenir votre propre chiffre.' },
    ],
    body: (h) => `
<h2>Laval a son propre chiffre</h2>
<p>Laval occupe l'île Jésus, de l'autre côté de la rivière des Prairies, et la Régie de l'énergie la considère comme une région distincte. Elle publie pour elle une moyenne quotidienne séparée de celle de l'île de Montréal : pour l'essence ordinaire, un automobiliste lavallois n'a donc pas à se contenter d'un chiffre montréalais. La super et le diesel, c'est autre chose, comme le montre le tableau : ni la Régie ni Statistique Canada ne les publient pour Laval, et ce sont les moyennes mensuelles de Montréal qui prennent le relais.</p>
${facts(h, ID)}
<p>Ces lignes empruntées sont des repères mensuels : leur date est un mois et non un jour, et la colonne d'estimation les ramène à aujourd'hui avec le prix de gros. Pour l'ordinaire, le chiffre est celui de ce matin. L'historique de la Régie n'est pas sous licence ouverte : la page ne garde que la valeur du jour et renvoie au ${h.src('regie', 'relevé de la Régie')} pour les jours précédents.</p>

<h2>Faire le plein à Laval ou sur l'île ?</h2>
<p>Comme les deux régions partagent toute leur structure de taxes, l'écart entre elles est uniquement un écart de prix en station. ${sameDay ? `Ce matin, le chiffre de Laval se situe à ${vsF}.` : `Le dernier chiffre de Laval se situe à ${vsF}.`} Le calculateur traduit cet écart en dollars, pour un plein et pour une année de route.</p>
${h.mini('comparer', { p: ['w', 'k'], d: { v: ID, w: 'montreal' }, t: 'Laval et Montréal côte à côte' })}
<p>Un écart d'un ou deux cents justifie rarement de traverser un pont : sur un réservoir de 55 litres, chaque cent par litre vaut ${h.usd(0.55)}. Les moyennes régionales cachent aussi des différences entre stations souvent plus larges que l'écart entre les deux régions. Pour toute la province, le ${h.a('cheapest', 'classement des villes')} reprend chaque marché doté d'un chiffre officiel.</p>

<h2>Le budget carburant d'un navetteur</h2>
<p>Pour qui fait chaque jour la navette entre Laval et Montréal ou les Laurentides, la facture annuelle compte plus que le prix d'un plein. Un petit VUS à la cote médiane 2026 de ${h.n(suv, 1)} L/100 km, qui parcourt 15 000 km par an, consomme environ ${h.n(K.litresFor(15000, suv))} litres ; à l'estimation du ${h.day(K.TOMORROW)} pour Laval, cela fait ${h.usd(K.fillCost(K.litresFor(15000, suv), r.est.value), 0)} par an.</p>
${h.mini('budget', { p: ['u', 'k'], d: { v: ID, u: 'suv-small', k: 15000 }, t: 'Votre année de route depuis Laval' })}
<p>Dans la circulation dense, la consommation réelle dépasse souvent celle de l'étiquette : le résultat est un plancher plutôt qu'un plafond. Chaque hausse de 10 ¢ le litre ajoute ${h.usd(K.litresFor(15000, suv) * 0.1, 0)} à ce total annuel.</p>

<h2>Ce que pèsent les taxes à Laval</h2>
<p>Laval fait partie du territoire de l'Autorité régionale de transport métropolitain : son essence supporte la taxe de 3 ¢ de l'ARTM en plus des 19,2 ¢ de la taxe québécoise sur les carburants. La TPS et la TVQ, 14,975 % à elles deux, s'appliquent ensuite sur un prix qui contient déjà ces deux taxes. Au litre ce matin, cela représente ${h.cpl(fixed)} de taxes fixes et ${h.cpl(brF.salesTax)} de taxes de vente.</p>
${taxTable(h, ID)}
<p>La taxe d'accise fédérale est suspendue depuis le 20 avril 2026 ; si le calendrier de l'avant-projet de Finances Canada est adopté, la moitié revient le 1er février 2027 et les 10 ¢ au complet le 1er avril 2027. La page ${h.a('tomorrow', 'prix de demain')} montre comment l'estimation intégrera ces changements datés.</p>
`,
  },
});
