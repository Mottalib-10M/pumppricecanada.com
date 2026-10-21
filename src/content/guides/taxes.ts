import { defineGuide } from '../../lib/page-types';
import type { Helpers } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const T = K.TOMORROW;
const tor = K.fuelOf('toronto', 'regular')!, mtl = K.fuelOf('montreal', 'regular')!, van = K.fuelOf('vancouver', 'regular')!, cal = K.fuelOf('calgary', 'regular')!;
const bTor = K.cityBreakdown('toronto', 'regular', tor.latest.value, T, 'en');
const bMtl = K.cityBreakdown('montreal', 'regular', mtl.latest.value, T, 'en');
const bVan = K.cityBreakdown('vancouver', 'regular', K.headline(van).value, T, 'en');
const bCal = K.cityBreakdown('calgary', 'regular', K.headline(cal).value, T, 'en');
const sum = (b: typeof bTor) => b.salesTax + b.lines.reduce((a, x) => a + x.cpl, 0);
const E = K.en, F = K.fr;

/** Tableau des taxes par province : taux au litre en vigueur demain et taxe de vente. */
function provTable(h: Helpers) {
  const rows = K.PROVS.map((p) => [K.provName(p, h.lang), h.cpl(K.exciseAt(K.fuelSteps(p), T, 'regular'), 2), h.cpl(K.exciseAt(K.fuelSteps(p), T, 'diesel'), 2), `${K.salesLabel(p, h.lang)} ${h.r(K.salesRate(p))}`]);
  return h.table([h.lang === 'fr' ? 'Province' : 'Province', h.lang === 'fr' ? 'Essence' : 'Gasoline', 'Diesel', h.lang === 'fr' ? 'Taxe de vente' : 'Sales tax'], rows,
    h.lang === 'fr' ? `Taxe provinciale sur les carburants en vigueur le ${h.day(T)}, en cents par litre, hors taxes régionales. Accise fédérale : 0 ¢.` : `Provincial fuel tax in force on ${h.day(T)}, cents per litre, regional taxes excluded. Federal excise: 0¢.`, ['l', 'r', 'r', 'l']);
}
function cityTable(h: Helpers) {
  const ids = ['toronto', 'montreal', 'vancouver', 'calgary', 'winnipeg', 'halifax', 'st-johns'];
  const rows = ids.map((id) => { const d = K.fuelOf(id, 'regular')!; const p = K.headline(d).value; const b = K.cityBreakdown(id, 'regular', p, T, h.lang); return [h.cn(id), h.cpl(p), h.cpl(sum(b)), h.p(b.taxShare)]; });
  return h.table([h.lang === 'fr' ? 'Ville' : 'City', h.lang === 'fr' ? 'Prix' : 'Price', h.lang === 'fr' ? 'Taxes par litre' : 'Taxes per litre', h.lang === 'fr' ? 'Part' : 'Share'], rows,
    h.lang === 'fr' ? 'Essence ordinaire, prix du jour ou estimation du lendemain, taxes provinciales, régionales et de vente.' : 'Regular gasoline, price of the day or tomorrow’s estimate, provincial, regional and sales taxes.', ['l', 'r', 'r', 'r']);
}

export default defineGuide({
  id: 'taxes', group: 'outils', order: 4,
  tool: 'taxes', toolArg: { v: 'toronto' },
  related: ['tomorrow', 'diesel', 'montreal', 'vancouver', 'calgary'],
  sources: ['excise', 'excise-draft', 'carbon', 'tax-on', 'tax-qc', 'tax-bc', 'tax-ab', 'tax-ns', 'tax-nl', 'nrcan-levies'],
  en: {
    slug: 'gas-taxes-canada',
    nav: 'Gas taxes by province', card: 'Per-litre taxes, sales tax and the proposed excise return',
    title: 'Gas Taxes by Province: What a Litre Pays in Canada, 2026',
    description: 'Gas taxes in Canada in 2026: provincial fuel tax, regional transit levies, GST, HST or QST, the excise holiday until January 2027 and its return, city by city.',
    h1: 'Gas taxes by province and city',
    intro: `In Toronto ${E.p(bTor.taxShare)} of a litre of regular is tax, in Montreal ${E.p(bMtl.taxShare)}, in Calgary ${E.p(bCal.taxShare)}.`,
    resume: `A litre of gasoline in Canada carries up to three layers of tax on top of its product cost: a provincial fuel tax in cents per litre, sometimes a regional transit levy, and a sales tax applied to everything including the first two. The federal excise tax of 10 cents on gasoline and 4 cents on diesel, the fourth layer, has been suspended since April 20, 2026, and the federal consumer carbon charge has been zero since April 1, 2025. At today's prices that leaves ${K.cpl(sum(bTor), 'en')} of tax in a Toronto litre (Ontario's 9 cents plus 13% HST), ${K.cpl(sum(bMtl), 'en')} in Montreal (19.2 cents of Quebec fuel tax, 3 cents for the ARTM, then GST and QST), ${K.cpl(sum(bVan), 'en')} in Vancouver (27 cents of provincial and TransLink tax plus GST) and ${K.cpl(sum(bCal), 'en')} in Calgary, where Alberta stopped collecting its 13-cent tax on October 1, 2026. Under Finance Canada's draft legislation (proposed, not enacted), the excise returns at half rate on February 1, 2027 and in full on April 1, 2027.`,
    faqs: [
      { q: 'Is GST or HST charged on top of the gas tax in Canada?', a: 'Yes. GST, HST, and in Quebec GST plus QST, are calculated on the pump price including the provincial fuel tax, any regional levy and the federal excise tax when it applies. So a tax change of 10 cents a litre moves the price by 11.3 cents in Ontario, where HST is 13%, and by just under 11.5 cents in Quebec.' },
      { q: 'Which province has the highest gas tax per litre?', a: `Among the cities this site follows, Metro Vancouver carries the highest per-litre fuel tax, 27 cents including 18.5 cents for TransLink, followed by the Montreal area, where the Quebec tax of 19.2 cents and the 3-cent ARTM levy add up to 22.2 cents. Alberta is the lowest in late 2026, with its provincial tax at zero.` },
      { q: 'How much will the excise tax return add to a fill-up?', a: `With 13% HST, the full 10-cent return on April 1, 2027 (proposed, not enacted) would add ${K.cpl(10 * 1.13, 'en', 2)} a litre in Ontario, about ${K.dollars(10 * 1.13 * 0.55, 'en')} on a 55-litre fill-up. In Alberta, with GST only, it adds ${K.cpl(10 * 1.05, 'en', 2)} a litre. February and March 2027 carry half of those amounts if the draft legislation passes unchanged.` },
      { q: 'Does Quebec’s carbon market add a separate tax at the pump?', a: 'No separate line appears. The cost of Quebec’s cap-and-trade system, which distributors must cover, is already included in the wholesale price, as the Régie de l’énergie notes on its Montréal rack price publication. It therefore sits in the product part of the breakdown on this page, not in the tax lines.' },
    ],
    body: (h) => `
<h2>Four layers, in order</h2>
<p>The order matters because the sales tax is charged last, on a base that already includes the other taxes. Start from the price of the refined product delivered to the station, with the wholesaler's and retailer's margins. Add the provincial fuel tax, a fixed amount per litre that does not move with the price. Add the regional levy where one exists: 3 cents on gasoline in the Montreal metropolitan transit territory, the TransLink and BC Transit shares of the British Columbia motor fuel tax around Vancouver and Victoria. Add the federal excise tax, zero since April 20, 2026. Then apply the sales tax of the province: 5% GST in the West, 13% HST in Ontario, 14% in Nova Scotia since April 1, 2025, 15% in New Brunswick, Newfoundland and Labrador and Prince Edward Island, and 5% GST plus 9.975% QST in Quebec.</p>
${provTable(h)}
<h2>Diesel is taxed on its own scale</h2>
<p>Diesel carries different per-litre rates from gasoline in most provinces: 15.45 cents against 10.87 in New Brunswick, 9.5 against 7.5 in Newfoundland and Labrador, 20.2 against 19.2 in Quebec, where the 3-cent ARTM levy applies to gasoline only. The federal excise tax on diesel is 4 cents, not 10, so its proposed return in 2027 (proposed, not enacted) weighs less on a truck than on a car. Because diesel sells well above gasoline in late 2026, the sales tax on a litre of diesel is higher in cents even where the fixed tax is the same, and the overall share of tax in the price is lower.</p>
<h2>What it comes to in a few cities</h2>
<p>Because the per-litre taxes are fixed and the sales tax is a percentage, the share of tax in a litre falls when the price rises. That is why two cities with the same provincial tax can show slightly different tax shares on the same day. The table uses the price of the day where an official daily or weekly figure exists, and the estimate for tomorrow where the latest figure is a monthly average.</p>
${cityTable(h)}
${h.mini('taxes', { p: ['v', 'c'], d: { v: 'vancouver' }, t: 'Break down a litre in your city' })}
<h2>Taxes that changed in 2025 and 2026</h2>
<p>Several of the layers moved recently, which is why year-old breakdowns found elsewhere are wrong. The federal consumer carbon charge, which had reached 17.61 cents a litre on gasoline, was set to zero on April 1, 2025, and British Columbia eliminated its own carbon tax the same day. Nova Scotia's HST fell from 15% to 14% on April 1, 2025. Ontario made its 9-cent gasoline tax permanent on July 1, 2025. Manitoba's 2024 fuel tax holiday ended on January 1, 2025. The federal excise tax was suspended on April 20, 2026. Prince Edward Island suspended its provincial tax from September 26, 2026 to January 31, 2027, and Alberta paused its 13-cent tax from October 1, 2026 to at least December 31, 2026.</p>
<h2>What is scheduled next</h2>
<p>Two changes are already dated. Under Finance Canada's September 2026 draft legislation (proposed, not enacted), the excise tax comes back at 5 cents on gasoline and 2 cents on diesel from February 1 to March 31, 2027, then at its full 10 and 4 cents on April 1, 2027. In Alberta, the quarterly rate from January 1, 2027 will be 0, 4.5, 9 or 13 cents depending on the average price of WTI oil, and it cannot rise by more than 9 cents in one quarter. The estimate on this site adds a dated change on the day it takes effect, sales tax included.</p>
${h.mini('accise', { p: ['pr', 'm'], d: { pr: 'ON' }, t: 'What the excise return costs you' })}
`,
  },
  fr: {
    slug: 'taxes-essence',
    nav: 'Taxes sur l’essence', card: 'Taxes au litre, taxe de vente et retour prévu de l’accise',
    title: 'Taxes sur l’essence par province : ce que paie le litre 2026',
    description: 'Taxes sur l’essence en 2026 : taxe provinciale, taxe régionale, TPS, TVH ou TVQ, pause de l’accise jusqu’en janvier 2027 et son retour, ville par ville.',
    h1: 'Les taxes sur l’essence, par province et par ville',
    intro: `À Montréal, ${F.p(bMtl.taxShare)} d’un litre d’ordinaire est fait de taxes ; à Toronto, ${F.p(bTor.taxShare)} ; à Calgary, ${F.p(bCal.taxShare)}.`,
    resume: `Un litre d’essence au Canada porte jusqu’à trois couches de taxes en plus du coût du produit : une taxe provinciale en cents par litre, parfois une taxe régionale pour le transport collectif, et une taxe de vente calculée sur le tout, ces deux premières comprises. La taxe d’accise fédérale de 10 cents sur l’essence et de 4 cents sur le diesel, quatrième couche, est suspendue depuis le 20 avril 2026, et la redevance carbone fédérale des consommateurs est à zéro depuis le 1er avril 2025. Aux prix du jour, il reste ainsi ${K.cpl(sum(bMtl), 'fr')} de taxes dans un litre à Montréal (19,2 cents de taxe québécoise, 3 cents pour l’ARTM, puis la TPS et la TVQ), ${K.cpl(sum(bTor), 'fr')} à Toronto (9 cents de taxe ontarienne et TVH de 13 %), ${K.cpl(sum(bVan), 'fr')} à Vancouver (27 cents de taxe provinciale et de TransLink plus la TPS) et ${K.cpl(sum(bCal), 'fr')} à Calgary, où l’Alberta ne perçoit plus sa taxe de 13 cents depuis le 1er octobre 2026. Selon l’avant-projet de loi de Finances Canada (projet de loi, non adopté), l’accise revient à demi-taux le 1er février 2027 et en entier le 1er avril 2027.`,
    faqs: [
      { q: 'La TPS et la TVQ s’appliquent-elles sur la taxe sur l’essence ?', a: 'Oui. La TPS et la TVQ au Québec, la TVH ou la TPS ailleurs, sont calculées sur le prix à la pompe qui comprend déjà la taxe provinciale sur les carburants, la taxe régionale éventuelle et l’accise fédérale quand elle s’applique. Une hausse de taxe de 10 cents le litre déplace donc le prix d’un peu moins de 11,5 cents au Québec et de 11,3 cents en Ontario.' },
      { q: 'Quelle province taxe le plus l’essence au litre ?', a: 'Parmi les villes suivies par ce site, le Grand Vancouver porte la taxe au litre la plus forte, 27 cents dont 18,5 cents pour TransLink, suivi de la région de Montréal, où la taxe québécoise de 19,2 cents et la taxe de 3 cents de l’ARTM font 22,2 cents. L’Alberta est la plus basse à la fin de 2026, avec sa taxe provinciale ramenée à zéro.' },
      { q: 'Combien le retour de l’accise ajoutera-t-il au Québec ?', a: `Avec la TPS et la TVQ, le retour complet des 10 cents le 1er avril 2027 (projet de loi, non adopté) ajouterait ${K.cpl(10 * 1.14975, 'fr', 2)} par litre au Québec, environ ${K.dollars(10 * 1.14975 * 0.55, 'fr')} sur un plein de 55 litres. Février et mars 2027 portent la moitié de ces montants si l’avant-projet de loi est adopté sans changement.` },
      { q: 'Le marché du carbone du Québec ajoute-t-il une taxe à la pompe ?', a: 'Aucune ligne distincte n’apparaît. Le coût du système de plafonnement et d’échange de droits d’émission (SPEDE), que les distributeurs doivent couvrir, est déjà compris dans le prix de gros, comme le précise la Régie de l’énergie dans sa publication des prix à la rampe de Montréal. Il se trouve donc dans la part « produit » de la décomposition, pas dans les taxes.' },
    ],
    body: (h) => `
<h2>Quatre couches, dans l’ordre</h2>
<p>L’ordre compte, parce que la taxe de vente vient en dernier, sur une base qui comprend déjà les autres taxes. On part du prix du produit raffiné livré à la station, avec les marges du grossiste et du détaillant. On ajoute la taxe provinciale sur les carburants, un montant fixe par litre qui ne bouge pas avec le prix. On ajoute la taxe régionale quand elle existe : 3 cents sur l’essence dans le territoire de l’Autorité régionale de transport métropolitain, les parts TransLink et BC Transit de la taxe britanno-colombienne autour de Vancouver et de Victoria. On ajoute l’accise fédérale, à zéro depuis le 20 avril 2026. Puis on applique la taxe de vente de la province : TPS de 5 % dans l’Ouest, TVH de 13 % en Ontario, de 14 % en Nouvelle-Écosse depuis le 1er avril 2025, de 15 % au Nouveau-Brunswick, à Terre-Neuve-et-Labrador et à l’Île-du-Prince-Édouard, et TPS de 5 % plus TVQ de 9,975 % au Québec.</p>
${provTable(h)}
<h2>Le diesel a son propre barème</h2>
<p>Dans la plupart des provinces, le diesel porte des taux au litre différents de ceux de l’essence : 15,45 cents contre 10,87 au Nouveau-Brunswick, 9,5 contre 7,5 à Terre-Neuve-et-Labrador, 20,2 contre 19,2 au Québec, où la taxe de 3 cents de l’ARTM ne vise que l’essence. L’accise fédérale sur le diesel est de 4 cents, pas de 10 : son retour en 2027 (projet de loi, non adopté) pèsera moins sur un camion que sur une voiture. Comme le diesel se vend nettement plus cher que l’essence à la fin de 2026, la taxe de vente sur un litre de diesel est plus élevée en cents, même là où la taxe fixe est identique, et la part totale des taxes dans le prix est plus faible. Pour les entreprises inscrites, la TPS, la TVH et la TVQ payées sur le carburant se récupèrent en crédits de taxe sur les intrants, ce qui n’est pas le cas des taxes au litre.</p>
<h2>Ce que cela donne dans quelques villes</h2>
<p>Comme les taxes au litre sont fixes et la taxe de vente proportionnelle, la part des taxes dans un litre baisse quand le prix monte. C’est pourquoi deux villes qui ont la même taxe provinciale peuvent afficher le même jour des parts un peu différentes. Le tableau prend le prix du jour là où existe un chiffre officiel quotidien ou hebdomadaire, et l’estimation du lendemain là où le dernier chiffre est une moyenne mensuelle.</p>
${cityTable(h)}
${h.mini('taxes', { p: ['v', 'c'], d: { v: 'montreal' }, t: 'Décomposez un litre dans votre ville' })}
<h2>Les taxes qui ont changé en 2025 et 2026</h2>
<p>Plusieurs couches ont bougé récemment : les décompositions vieilles d’un an qu’on trouve ailleurs sont fausses. La redevance carbone fédérale des consommateurs, qui avait atteint 17,61 cents le litre d’essence, est passée à zéro le 1er avril 2025, et la Colombie-Britannique a supprimé sa propre taxe carbone le même jour. La TVH de la Nouvelle-Écosse est passée de 15 % à 14 % le 1er avril 2025. L’Ontario a rendu permanente sa taxe de 9 cents le 1er juillet 2025. Le congé de taxe du Manitoba en 2024 a pris fin le 1er janvier 2025. L’accise fédérale a été suspendue le 20 avril 2026. L’Île-du-Prince-Édouard a suspendu sa taxe provinciale du 26 septembre 2026 au 31 janvier 2027, et l’Alberta a mis en pause sa taxe de 13 cents du 1er octobre au 31 décembre 2026 au moins. Au Québec, la taxe sur les carburants est restée à 19,2 cents.</p>
<h2>Ce qui est déjà prévu</h2>
<p>Deux changements sont déjà datés. Selon l’avant-projet de loi de Finances Canada (projet de loi, non adopté) de septembre 2026, l’accise revient à 5 cents sur l’essence et 2 cents sur le diesel du 1er février au 31 mars 2027, puis à ses 10 et 4 cents le 1er avril 2027. En Alberta, le taux trimestriel à partir du 1er janvier 2027 sera de 0, 4,5, 9 ou 13 cents selon le prix moyen du pétrole WTI, sans pouvoir monter de plus de 9 cents en un trimestre. L’estimation de ce site ajoute un changement daté le jour où il entre en vigueur, taxe de vente comprise.</p>
${h.mini('accise', { p: ['pr', 'm'], d: { pr: 'QC' }, t: 'Ce que vous coûtera le retour de l’accise' })}
`,
  },
});
