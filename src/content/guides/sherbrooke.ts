import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'sherbrooke';
const r = K.fuelOf(ID, 'regular')!;
const brE = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brF = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'fr');
const fixed = brE.lines.reduce((a, x) => a + x.cpl, 0);
const QC = ['montreal', 'laval', 'quebec-city', 'gatineau', 'sherbrooke'].map((id) => ({ id, p: K.fuelOf(id, 'regular')!.latest.value })).sort((a, b) => a.p - b.p);
const rank = QC.findIndex((x) => x.id === ID) + 1;
const lo = QC[0], hi = QC[QC.length - 1];
const mtl = K.fuelOf('montreal', 'regular')!.latest.value, qc = K.fuelOf('quebec-city', 'regular')!.latest.value;
const E = K.en, F = K.fr;
const c = (x: number) => K.cpl(x, 'en');
const cf = (x: number) => K.cpl(x, 'fr');
const flat = Math.abs(r.est.value - r.latest.value) < 0.05;
const ordE = ['', 'cheapest', 'second cheapest', 'third cheapest', 'fourth cheapest', 'most expensive'][rank];
const ordF = ['', 'la moins chère', 'la deuxième moins chère', 'la troisième moins chère', 'la quatrième moins chère', 'la plus chère'][rank];
const cmpE = (p: number, name: string) => (Math.abs(r.latest.value - p) < 0.05 ? `level with ${name}` : `${c(Math.abs(r.latest.value - p))} ${r.latest.value > p ? 'above' : 'below'} ${name}`);
const cmpF = (p: number, name: string) => (Math.abs(r.latest.value - p) < 0.05 ? `au niveau de ${name}` : `${cf(Math.abs(r.latest.value - p))} ${r.latest.value > p ? 'au-dessus de' : 'sous'} ${name}`);

export default defineGuide({
  id: ID, group: groupOf(ID), order: 204, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['montreal', 'quebec-city', 'gatineau', 'cheapest', 'tomorrow'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-sherbrooke',
    nav: 'Sherbrooke', card: 'Estrie daily average, base Quebec tax, rank in Quebec',
    title: 'Gas Prices Sherbrooke Today, Estrie Daily Figure 2026',
    description: 'Gas prices in Sherbrooke in 2026: the daily Régie de l\'énergie average for the Estrie, its rank among Quebec cities, taxes per litre and tomorrow\'s figure.',
    h1: 'Gas prices in Sherbrooke and the Estrie',
    intro: `Regular gasoline averaged ${c(r.latest.value)} in Sherbrooke on ${E.day(r.latest.date)}, ${cmpE(mtl, 'Montreal')}.`,
    resume: `For Sherbrooke, the official price is the daily average of the Régie de l'énergie du Québec for the Estrie region, published every morning. On ${E.day(r.latest.date)} the Régie put regular gasoline at ${c(r.latest.value)}, taxes included, which makes Sherbrooke the ${ordE} of the five Quebec cities on this site that morning, ${cmpE(mtl, 'Montreal')} and ${cmpE(qc, 'Quebec City')}. ${flat ? `Since no wholesale price has been published after the survey, the estimate for ${E.day(K.TOMORROW)} is the same ${c(r.est.value)}` : `For ${E.day(K.TOMORROW)} the estimate is ${c(r.est.value)}`}; the Sherbrooke series is too short here to replay the method and measure its error. The city pays the Quebec fuel tax at its base rate of 19.2 cents a litre, with no ARTM levy and no border reduction applied, then GST and QST, so ${E.p(brE.taxShare)} of the pump price is tax. Only regular gasoline is surveyed for Sherbrooke.`,
    faqs: [
      { q: 'Which region does the Sherbrooke gas price represent?', a: 'It is the Régie de l\'énergie average for the Estrie, the administrative region around Sherbrooke, also known as the Eastern Townships. The Régie publishes one figure per region and per day. Stations in the city and in smaller towns of the region both feed that average, so a station in the centre of Sherbrooke can sit a few cents away from it.' },
      { q: 'Why is gas sometimes more expensive in Sherbrooke than in Montreal?', a: 'Not because of taxes: Montreal pays 3 cents a litre more, through the ARTM levy, than Sherbrooke does. When the Sherbrooke average is higher, the gap comes from the product and the retail margin, which include the cost of bringing fuel to the region and the level of competition between local stations. The comparison on this page shows the size of that gap each morning.' },
      { q: 'Is there a diesel price for Sherbrooke?', a: 'No open official source publishes one. The Régie de l\'énergie surveys regular gasoline only, and Statistics Canada\'s monthly city series for Quebec cover Montreal and Quebec City but not Sherbrooke. This page therefore shows regular only. For a sense of diesel prices in the province, the Quebec City page shows the Statistics Canada monthly figure.' },
    ],
    body: (h) => `
<h2>The Estrie in the Régie survey</h2>
<p>Quebec's energy board publishes a gasoline average for each administrative region, every day. Sherbrooke falls in the Estrie, and the Estrie figure is the one shown here. It is a regional number: the Régie does not publish a separate average for the city itself, and the same regional figure also covers stations in towns such as Magog or Coaticook.</p>
${facts(h, ID)}
<p>Two things are missing from the table, and both are deliberate. There is no premium or diesel line, because the Régie surveys regular only and Statistics Canada has no Sherbrooke series. There is no measured error yet, because the Sherbrooke series on this site is still too short to replay the estimate. For older days, the ${h.src('regie', 'Régie survey')} keeps its own archive.</p>

<h2>Sherbrooke among Quebec cities</h2>
<p>This morning the five Quebec markets on this site range from ${h.cn(lo.id)} at ${h.cpl(lo.p)} to ${h.cn(hi.id)} at ${h.cpl(hi.p)}, and Sherbrooke is the ${ordE}. The ranking below also lists the other provinces' cities: choose the Quebec region to see the province alone.</p>
${h.mini('classement', { p: ['z'], d: { z: 'QC' }, t: 'Quebec cities, cheapest first' })}
<p>Tax alone cannot explain where Sherbrooke lands. Montreal and Laval pay 3 cents more per litre through the ARTM levy, and Gatineau pays 6 cents less through the border reduction; Sherbrooke and Quebec City pay the base rate. When Sherbrooke is above Montreal despite that, the difference is in the price of the product delivered to the Estrie and in local margins.</p>

<h2>Tax at the base Quebec rate</h2>
<p>A Sherbrooke litre carries the Quebec fuel tax of 19.2 cents and, while the federal excise remains suspended, nothing else per litre: ${h.cpl(fixed)} in total. GST and QST at 5% and 9.975% then apply to the whole price, which adds ${h.cpl(brE.salesTax)} at this morning's average.</p>
${taxTable(h, ID)}
<p>Quebec lowers its fuel tax near the Ontario, New Brunswick and United States borders and in remote regions. The page applies the base rate to Sherbrooke; a station much closer to the U.S. border than the city may be taxed less. To test another posted price, the tax calculator recomputes the breakdown.</p>
${h.mini('taxes', { p: ['p'], d: { v: ID, c: 'regular' }, t: 'Tax in a Sherbrooke litre at your price' })}

<h2>What could change tomorrow</h2>
<p>${flat ? `The estimate for ${h.day(K.TOMORROW)} repeats this morning's figure: the wholesale price the method follows is published with a delay and has nothing newer to add.` : `The estimate for ${h.day(K.TOMORROW)} moves this morning's figure by the wholesale change published since.`} The next Régie survey replaces it as soon as it is out. Longer-term changes are dated: the federal excise is scheduled (proposed, not enacted) to return in two steps in February and April 2027, which the ${h.a('tomorrow', 'tomorrow page')} and the ${h.a('cheapest', 'ranking')} will pick up on those dates.</p>
`,
  },
  fr: {
    slug: 'prix-essence-sherbrooke',
    nav: 'Sherbrooke', card: 'Moyenne quotidienne de l\'Estrie, taxe de base, rang au Québec',
    title: 'Prix essence Sherbrooke aujourd\'hui, Estrie et taxes 2026',
    description: 'Prix de l\'essence à Sherbrooke en 2026 : moyenne quotidienne de la Régie en l\'Estrie, rang parmi les villes du Québec, taxes au litre et ce qui change demain.',
    h1: 'Prix de l\'essence à Sherbrooke et en Estrie',
    intro: `L'essence ordinaire s'affichait en moyenne à ${cf(r.latest.value)} à Sherbrooke le ${F.day(r.latest.date)}, ${cmpF(mtl, 'Montréal')}.`,
    resume: `À Sherbrooke, le prix officiel est la moyenne quotidienne de la Régie de l'énergie du Québec pour la région de l'Estrie, publiée chaque matin. Le ${F.day(r.latest.date)}, la Régie situait l'essence ordinaire à ${cf(r.latest.value)}, taxes comprises : Sherbrooke était ce matin-là ${ordF} des cinq villes québécoises de ce site, ${cmpF(mtl, 'Montréal')} et ${cmpF(qc, 'Québec')}. ${flat ? `Aucun prix de gros n'ayant paru depuis le relevé, l'estimation du ${F.day(K.TOMORROW)} reste à ${cf(r.est.value)}` : `Pour le ${F.day(K.TOMORROW)}, l'estimation est de ${cf(r.est.value)}`} ; la série de Sherbrooke est encore trop courte ici pour rejouer la méthode et mesurer son écart. La ville paie la taxe québécoise sur les carburants au taux de base de 19,2 ¢ le litre, sans taxe de l'ARTM ni réduction frontalière, puis la TPS et la TVQ : les taxes représentent ${F.p(brF.taxShare)} du prix à la pompe. Seule l'essence ordinaire est relevée à Sherbrooke.`,
    faqs: [
      { q: 'Quelle région représente le prix de l\'essence à Sherbrooke ?', a: 'Il s\'agit de la moyenne de la Régie de l\'énergie pour l\'Estrie, la région administrative de Sherbrooke, aussi appelée les Cantons-de-l\'Est. La Régie publie un chiffre par région et par jour. Les stations de la ville comme celles des localités voisines alimentent cette moyenne : une station du centre de Sherbrooke peut donc s\'en écarter de quelques cents.' },
      { q: 'Pourquoi l\'essence est-elle parfois plus chère à Sherbrooke qu\'à Montréal ?', a: 'Ce ne sont pas les taxes : Montréal paie 3 ¢ de plus le litre que Sherbrooke, à cause de la taxe de l\'ARTM. Quand la moyenne sherbrookoise est plus élevée, l\'écart tient au produit et à la marge des détaillants, qui comprennent le coût d\'acheminement du carburant vers la région et le niveau de concurrence entre stations. La comparaison de cette page montre l\'ampleur de cet écart chaque matin.' },
      { q: 'Existe-t-il un prix du diesel pour Sherbrooke ?', a: 'Aucune source officielle ouverte n\'en publie. La Régie de l\'énergie ne relève que l\'essence ordinaire, et les séries mensuelles de Statistique Canada pour le Québec couvrent Montréal et Québec, mais pas Sherbrooke. Cette page se limite donc à l\'ordinaire. Pour se faire une idée du prix du diesel dans la province, la page de Québec donne le chiffre mensuel de Statistique Canada.' },
    ],
    body: (h) => `
<h2>L'Estrie dans le relevé de la Régie</h2>
<p>La Régie de l'énergie publie chaque jour une moyenne de l'essence pour chaque région administrative du Québec. Sherbrooke appartient à l'Estrie, et c'est le chiffre de l'Estrie qui figure ici. Il s'agit d'un chiffre régional : la Régie ne publie pas de moyenne distincte pour la ville elle-même.</p>
${facts(h, ID)}
<p>Deux éléments manquent au tableau, et c'est voulu. Pas de ligne pour la super ni pour le diesel : la Régie ne relève que l'ordinaire et Statistique Canada n'a pas de série pour Sherbrooke. Pas encore d'écart mesuré : la série de Sherbrooke sur ce site reste trop courte pour rejouer l'estimation. Pour les jours précédents, le ${h.src('regie', 'relevé de la Régie')} tient sa propre archive.</p>

<h2>Sherbrooke parmi les villes du Québec</h2>
<p>Ce matin, les cinq marchés québécois de ce site vont de ${h.cn(lo.id)} à ${h.cpl(lo.p)} jusqu'à ${h.cn(hi.id)} à ${h.cpl(hi.p)}, et Sherbrooke est ${ordF}. Le classement ci-dessous réunit aussi les villes des autres provinces : choisissez la région Québec pour ne garder que la province.</p>
${h.mini('classement', { p: ['z'], d: { z: 'QC' }, t: 'Les villes du Québec, de la moins chère à la plus chère' })}
<p>Les taxes n'expliquent pas à elles seules le rang de Sherbrooke. Montréal et Laval paient 3 ¢ de plus le litre avec la taxe de l'ARTM, Gatineau 6 ¢ de moins grâce à la réduction frontalière ; Sherbrooke et Québec paient le taux de base. Quand Sherbrooke dépasse malgré tout Montréal, la différence se loge dans le prix du produit livré en Estrie et dans les marges locales.</p>

<h2>La taxe au taux de base québécois</h2>
<p>Un litre vendu à Sherbrooke supporte la taxe québécoise sur les carburants de 19,2 ¢ et, tant que l'accise fédérale reste suspendue, aucune autre taxe au litre : ${h.cpl(fixed)} au total. La TPS de 5 % et la TVQ de 9,975 % s'appliquent ensuite sur l'ensemble du prix, ce qui ajoute ${h.cpl(brF.salesTax)} à la moyenne de ce matin.</p>
${taxTable(h, ID)}
<p>Le Québec abaisse sa taxe sur les carburants près des frontières de l'Ontario, du Nouveau-Brunswick et des États-Unis ainsi que dans les régions périphériques. La page applique le taux de base à Sherbrooke ; une station bien plus proche de la frontière américaine que la ville peut être moins taxée. Pour tester un autre prix affiché, le calculateur de taxes refait la décomposition.</p>
${h.mini('taxes', { p: ['p'], d: { v: ID, c: 'regular' }, t: 'Les taxes d\'un litre à Sherbrooke, à votre prix' })}

<h2>Ce qui peut changer demain</h2>
<p>${flat ? `L'estimation du ${h.day(K.TOMORROW)} reprend le chiffre de ce matin : le prix de gros que suit la méthode paraît avec du retard et n'a rien de plus récent à ajouter.` : `L'estimation du ${h.day(K.TOMORROW)} corrige le chiffre de ce matin de la variation du prix de gros publiée depuis.`} Le prochain relevé de la Régie la remplace dès sa parution. Les changements à plus long terme sont datés : l'accise fédérale doit revenir en deux temps, en février puis en avril 2027 (projet de loi, non adopté), ce que la page ${h.a('tomorrow', 'prix de demain')} et le ${h.a('cheapest', 'classement')} intégreront à ces dates.</p>
`,
  },
});
