import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'quebec-city';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const brE = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brF = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'fr');
const rate = K.salesRate('QC');
/** Ce que la taxe de l'ARTM ajoute à Montréal, taxes de vente comprises (¢/L). */
const artm = (K.perLitreTaxes('montreal', 'regular', K.TOMORROW, 'en').reduce((a, x) => a + x.cpl, 0) - K.perLitreTaxes(ID, 'regular', K.TOMORROW, 'en').reduce((a, x) => a + x.cpl, 0)) * (1 + rate);
const mtl = K.fuelOf('montreal', 'regular')!;
const gap = r.latest.value - mtl.latest.value;
const E = K.en, F = K.fr;
const c = (x: number) => K.cpl(x, 'en');
const cf = (x: number) => K.cpl(x, 'fr');
const flat = Math.abs(r.est.value - r.latest.value) < 0.05;
const mo = r.monthly;
const dsl = d.est.value - r.est.value;
const excE = K.exciseAt(K.EXCISE, '2027-04-01', 'regular') * (1 + rate), excD = K.exciseAt(K.EXCISE, '2027-04-01', 'diesel') * (1 + rate);

export default defineGuide({
  id: ID, group: groupOf(ID), order: 202, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['montreal', 'sherbrooke', 'laval', 'diesel', 'forecast'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-quebec-city',
    nav: 'Quebec City', card: 'Capitale-Nationale daily figure, no ARTM levy, diesel',
    title: 'Gas Prices Quebec City Today, Diesel and Excise 2026',
    description: 'Gas prices in Quebec City in 2026: the daily Capitale-Nationale average, why there is no ARTM levy, diesel and premium, and the excise returning in 2027.',
    h1: 'Gas prices in Quebec City',
    intro: `In the Capitale-Nationale region, which includes Quebec City, regular gasoline averaged ${c(r.latest.value)} on ${E.day(r.latest.date)}.`,
    resume: `The official daily price for Quebec City is the Régie de l'énergie du Québec average for the Capitale-Nationale administrative region. On ${E.day(r.latest.date)} it stood at ${c(r.latest.value)} for regular gasoline, taxes included, ${Math.abs(gap) < 0.05 ? 'level with Montreal' : `${c(Math.abs(gap))} ${gap < 0 ? 'below' : 'above'} the Montreal figure of the same morning`}. ${flat ? `With no wholesale data newer than the survey, the estimate for ${E.day(K.TOMORROW)} stays at ${c(r.est.value)}` : `The estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}`}; tested on ${r.bt?.n ?? 0} past days, that estimate missed the next figure by ${c(r.bt?.mae ?? 0)} on average. Quebec City pays the provincial fuel tax at its base rate of 19.2 cents, without the 3-cent ARTM levy charged around Montreal, plus GST and QST: in all ${E.p(brE.taxShare)} of a litre. Diesel and premium come from the Statistics Canada monthly average for Quebec, ${c(d.latest.value)} and ${c(pr.latest.value)} in ${K.month(d.latest.date, 'en')}.`,
    faqs: [
      { q: 'Which area does the Quebec City gas price cover?', a: 'The figure is the daily average of the Régie de l\'énergie for the Capitale-Nationale, one of Quebec\'s administrative regions. It covers Quebec City and the surrounding municipalities of the region. The Régie does not split it further, so a station in the old city and one in a suburb both feed the same average.' },
      { q: 'Does Quebec City pay the same gas tax as Montreal?', a: 'Not quite. Both pay the Quebec fuel tax of 19.2 cents per litre of gasoline and the same GST and QST, but the 3-cent levy of the Autorité régionale de transport métropolitain applies only in the Montreal area. Quebec City is outside that territory, so the tax in its litre is a little over 3 cents lower once sales taxes are counted.' },
      { q: 'How much will diesel cost in Quebec City when the excise tax returns?', a: `Diesel carries a federal excise tax of 4 cents per litre when it is in force, against 10 cents for gasoline. Under Finance Canada's draft schedule (proposed, not enacted), half returns on February 1, 2027 and all of it on April 1, 2027. With GST and QST charged on top, the full return adds ${K.cpl(excD, 'en', 2)} to a litre of diesel in Quebec City, if nothing else changes.` },
    ],
    body: (h) => `
<h2>The Capitale-Nationale in the Régie survey</h2>
<p>The Régie de l'énergie does not publish city averages in the strict sense: it publishes one for each administrative region of Quebec. For Quebec City, the relevant region is the Capitale-Nationale, and its daily figure is what this page calls the Quebec City price. Premium and diesel are absent from that survey, so they come from Statistics Canada, which publishes a monthly average for Quebec.</p>
${facts(h, ID)}
<p>${mo ? `The two sources can be checked against each other. Statistics Canada's monthly average for regular in Quebec was ${h.cpl(mo.value)} in ${K.month(mo.date, 'en')}; the Régie gives a figure for each day, which is why its number can sit above or below the monthly one. ` : ''}The Régie's archive is not under an open licence: older daily figures stay on the ${h.src('regie', 'Régie\'s website')}.</p>

<h2>Outside the ARTM territory</h2>
<p>The main tax difference between the capital and the metropolis is a transit levy. Gasoline sold in the territory of the Autorité régionale de transport métropolitain carries 3 extra cents a litre; Quebec City is not part of it, so its litre pays the Quebec fuel tax at the base rate of 19.2 cents and nothing more at the regional level. Once GST and QST are added on top, that levy is worth ${h.cpl(artm, 2)} per litre at the Montreal pump.</p>
${taxTable(h, ID)}
<p>This morning the capital's average is ${Math.abs(gap) < 0.05 ? 'level with Montreal\'s' : `${h.cpl(Math.abs(gap))} ${gap < 0 ? 'below' : 'above'} Montreal's`}. A gap smaller or larger than the levy means that station prices, not taxes, explain the rest. The ${h.a('montreal', 'Montreal page')} gives the same breakdown with the ARTM line.</p>

<h2>Diesel and premium in Quebec City</h2>
<p>Both grades rely on a monthly number, so their estimate column does more than the one for regular: it adds the change in the wholesale price since that month. At the estimates for ${h.day(K.TOMORROW)}, diesel is ${h.cpl(Math.abs(dsl))} ${dsl >= 0 ? 'more' : 'less'} expensive than regular in the capital. Diesel is priced on its own refinery market, and it pays a Quebec fuel tax of 20.2 cents, one cent above gasoline, with no ARTM levy anywhere. The ${h.a('diesel', 'diesel page')} compares that spread across Canada.</p>
<p>Premium is ${h.cpl(pr.latest.value - (mo ? mo.value : r.latest.value))} above regular in the ${K.month(pr.latest.date, 'en')} Statistics Canada averages for Quebec. Taxes are the same per litre for the two gasoline grades, so that spread is entirely in the product.</p>

<h2>When the federal excise tax comes back</h2>
<p>The federal excise tax has been suspended since April 20, 2026. Finance Canada's draft legislation (proposed, not enacted) keeps it at zero until January 31, 2027, charges half in February and March 2027 and the full rate from April 1, 2027. In Quebec, GST and QST are charged on top of the excise, so the full return adds ${h.cpl(excE, 2)} to a litre of gasoline and ${h.cpl(excD, 2)} to a litre of diesel.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'QC' }, t: 'The excise return for a Quebec driver' })}
<p>The schedule is draft legislation, not law, and the ${h.a('forecast', 'price outlook page')} follows its progress along with the other dated changes that will move the Quebec City price.</p>
`,
  },
  fr: {
    slug: 'prix-essence-quebec',
    nav: 'Québec', card: 'Chiffre quotidien de la Capitale-Nationale, sans taxe ARTM, diesel',
    title: 'Prix essence Québec aujourd\'hui, Capitale-Nationale 2026',
    description: 'Prix de l\'essence à Québec (ville) en 2026 : moyenne quotidienne de la Capitale-Nationale, absence de taxe ARTM, diesel, super et retour de l\'accise en 2027.',
    h1: 'Prix de l\'essence à Québec',
    intro: `Dans la Capitale-Nationale, qui comprend la ville de Québec, l'essence ordinaire s'affichait en moyenne à ${cf(r.latest.value)} le ${F.day(r.latest.date)}.`,
    resume: `Le prix officiel quotidien retenu pour la ville de Québec est la moyenne de la Régie de l'énergie du Québec pour la région administrative de la Capitale-Nationale. Le ${F.day(r.latest.date)}, elle s'établissait à ${cf(r.latest.value)} pour l'ordinaire, taxes comprises, ${Math.abs(gap) < 0.05 ? 'au même niveau que Montréal' : `${cf(Math.abs(gap))} ${gap < 0 ? 'sous' : 'au-dessus du'} chiffre montréalais du même matin`}. ${flat ? `Aucun prix de gros n'étant plus récent que le relevé, l'estimation du ${F.day(K.TOMORROW)} reste à ${cf(r.est.value)}` : `L'estimation du ${F.day(K.TOMORROW)} est de ${cf(r.est.value)}`} ; vérifiée sur ${r.bt?.n ?? 0} jours passés, elle a manqué le chiffre suivant de ${cf(r.bt?.mae ?? 0)} en moyenne. Québec paie la taxe provinciale sur les carburants à son taux de base de 19,2 ¢, sans les 3 ¢ de l'ARTM prélevés dans la région de Montréal, puis la TPS et la TVQ : au total, ${F.p(brF.taxShare)} du litre. Le diesel et la super viennent de la moyenne mensuelle de Statistique Canada pour Québec, ${cf(d.latest.value)} et ${cf(pr.latest.value)} en ${K.month(d.latest.date, 'fr')}.`,
    faqs: [
      { q: 'Quel territoire couvre le prix de l\'essence à Québec ?', a: 'Le chiffre est la moyenne quotidienne de la Régie de l\'énergie pour la Capitale-Nationale, l\'une des régions administratives du Québec. Il couvre la ville de Québec et les municipalités voisines de la région. La Régie ne le découpe pas davantage : une station du Vieux-Québec et une station de banlieue alimentent la même moyenne.' },
      { q: 'La ville de Québec paie-t-elle la même taxe sur l\'essence que Montréal ?', a: 'Pas tout à fait. Les deux paient la taxe québécoise de 19,2 ¢ le litre d\'essence ainsi que la même TPS et la même TVQ, mais la taxe de 3 ¢ de l\'Autorité régionale de transport métropolitain ne s\'applique que dans la région de Montréal. Québec est hors de ce territoire : la taxe contenue dans son litre est inférieure d\'un peu plus de 3 ¢ une fois les taxes de vente comptées.' },
      { q: 'Combien coûtera le diesel à Québec au retour de l\'accise ?', a: `Le diesel supporte une taxe d'accise fédérale de 4 ¢ le litre lorsqu'elle est perçue, contre 10 ¢ pour l'essence. Selon le calendrier de l'avant-projet de Finances Canada (projet de loi, non adopté), la moitié revient le 1er février 2027 et la totalité le 1er avril 2027. Avec la TPS et la TVQ calculées par-dessus, le retour complet ajoute ${K.cpl(excD, 'fr', 2)} au litre de diesel à Québec, si rien d'autre ne bouge.` },
    ],
    body: (h) => `
<h2>La Capitale-Nationale dans le relevé de la Régie</h2>
<p>La Régie de l'énergie ne publie pas à proprement parler de moyennes par ville : elle en publie une par région administrative. Pour la ville de Québec, la région qui compte est la Capitale-Nationale, et c'est son chiffre quotidien que cette page appelle le prix de Québec. La super et le diesel ne figurent pas dans ce relevé ; ils viennent de Statistique Canada, qui publie une moyenne mensuelle pour Québec.</p>
${facts(h, ID)}
<p>${mo ? `Les deux sources se recoupent. La moyenne mensuelle de Statistique Canada pour l'ordinaire à Québec était de ${h.cpl(mo.value)} en ${K.month(mo.date, 'fr')} ; la Régie donne un chiffre pour chaque jour, ce qui explique qu'il puisse se situer au-dessus ou au-dessous du chiffre mensuel. ` : ''}L'archive de la Régie n'est pas sous licence ouverte : les chiffres quotidiens plus anciens restent sur le ${h.src('regie', 'site de la Régie')}.</p>

<h2>Hors du territoire de l'ARTM</h2>
<p>La principale différence fiscale entre la capitale et la métropole tient à une taxe de transport. L'essence vendue sur le territoire de l'Autorité régionale de transport métropolitain supporte 3 ¢ de plus le litre ; Québec n'en fait pas partie, et son litre ne paie que la taxe québécoise au taux de base de 19,2 ¢, sans supplément régional. Une fois la TPS et la TVQ ajoutées, cette taxe pèse ${h.cpl(artm, 2)} par litre à la pompe montréalaise.</p>
${taxTable(h, ID)}
<p>Ce matin, la moyenne de la capitale se situe ${Math.abs(gap) < 0.05 ? 'au niveau de celle de Montréal' : `${h.cpl(Math.abs(gap))} ${gap < 0 ? 'sous' : 'au-dessus de'} celle de Montréal`}. Un écart plus petit ou plus grand que cette taxe signifie que ce sont les prix des stations, et non les taxes, qui expliquent le reste. La page ${h.a('montreal', 'de Montréal')} donne la même décomposition avec la ligne de l'ARTM.</p>

<h2>Diesel et super à Québec</h2>
<p>Ces deux carburants reposent sur un chiffre mensuel : leur colonne d'estimation travaille plus que celle de l'ordinaire, puisqu'elle ajoute la variation du prix de gros depuis ce mois-là. Aux estimations du ${h.day(K.TOMORROW)}, le diesel coûte ${h.cpl(Math.abs(dsl))} de ${dsl >= 0 ? 'plus' : 'moins'} que l'ordinaire dans la capitale. Il dépend de son propre marché de raffinage et paie une taxe québécoise de 20,2 ¢, un cent de plus que l'essence, sans taxe de l'ARTM nulle part. La page ${h.a('diesel', 'du diesel')} compare cet écart dans tout le Canada.</p>
<p>Dans les moyennes de Statistique Canada de ${K.month(pr.latest.date, 'fr')} pour Québec, la super dépasse l'ordinaire de ${h.cpl(pr.latest.value - (mo ? mo.value : r.latest.value))}. Les taxes au litre étant les mêmes pour les deux qualités d'essence, cet écart se trouve entièrement dans le produit.</p>

<h2>Quand l'accise fédérale reviendra</h2>
<p>La taxe d'accise fédérale est suspendue depuis le 20 avril 2026. L'avant-projet de loi de Finances Canada (projet de loi, non adopté) la maintient à zéro jusqu'au 31 janvier 2027, en perçoit la moitié en février et mars 2027, puis le plein taux dès le 1er avril 2027. Au Québec, la TPS et la TVQ s'appliquent par-dessus l'accise : son retour complet ajoutera ${h.cpl(excE, 2)} au litre d'essence et ${h.cpl(excD, 2)} au litre de diesel.</p>
${h.mini('accise', { p: ['c', 'm'], d: { pr: 'QC' }, t: 'Le retour de l\'accise pour un automobiliste québécois' })}
<p>Ce calendrier relève d'un avant-projet, pas encore d'une loi ; la page ${h.a('forecast', 'des perspectives de prix')} suit son avancement ainsi que les autres changements datés qui feront bouger le prix à Québec.</p>
`,
  },
});
