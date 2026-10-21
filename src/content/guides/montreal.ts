import { defineGuide } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { facts, taxTable, groupOf, sourcesOf } from './_ville';

const ID = 'montreal';
const r = K.fuelOf(ID, 'regular')!, pr = K.fuelOf(ID, 'premium')!, d = K.fuelOf(ID, 'diesel')!;
const brE = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'en');
const brF = K.cityBreakdown(ID, 'regular', r.latest.value, K.TOMORROW, 'fr');
const E = K.en, F = K.fr;
const c = (x: number) => K.cpl(x, 'en');
const cf = (x: number) => K.cpl(x, 'fr');
const flat = Math.abs(r.est.value - r.latest.value) < 0.05;
const mo = r.monthly;
const salesE = brE.salesTax, salesF = brF.salesTax;

export default defineGuide({
  id: ID, group: groupOf(ID), order: 200, city: ID,
  tool: 'ville', toolArg: { v: ID },
  related: ['laval', 'quebec-city', 'gatineau', 'tomorrow', 'taxes'],
  sources: sourcesOf(ID),
  en: {
    slug: 'gas-prices-montreal',
    nav: 'Montreal', card: 'Daily Régie average, ARTM levy, premium and diesel',
    title: 'Gas Prices Montreal Today, Daily Régie Average 2026',
    description: 'Gas prices in Montreal in 2026: the daily average of the Régie de l\'énergie, tomorrow\'s figure, the 3-cent ARTM levy and the cost of a fill-up on the island.',
    h1: 'Gas prices in Montreal, read every morning',
    intro: `The Régie de l'énergie put regular gasoline in Montreal at ${c(r.latest.value)} on ${E.day(r.latest.date)}.`,
    resume: `Montreal is one of the few Canadian cities with an official gasoline price published every day: the Régie de l'énergie du Québec surveys stations on the island and posts a regional average each morning. Its figure for ${E.day(r.latest.date)} is ${c(r.latest.value)} for regular gasoline, taxes included. ${flat ? `No wholesale data newer than that survey exists yet, so the estimate for ${E.day(K.TOMORROW)} simply carries the same ${c(r.est.value)} forward` : `The estimate for ${E.day(K.TOMORROW)} is ${c(r.est.value)}`}; replayed over ${r.bt?.n ?? 0} days, this way of estimating missed the next morning's figure by ${c(r.bt?.mae ?? 0)} on average. Premium and diesel are not in the Régie survey: they come from the Statistics Canada monthly average (${K.month(pr.latest.date, 'en')}), at ${c(pr.latest.value)} and ${c(d.latest.value)}. In a Montreal litre, the Quebec fuel tax of 19.2 cents, the 3-cent ARTM transit levy and ${c(salesE)} of GST and QST add up to ${E.p(brE.taxShare)} of the price; the federal excise tax is suspended since April 20, 2026.`,
    faqs: [
      { q: 'Who publishes the official gas price for Montreal?', a: 'The Régie de l\'énergie du Québec, the provincial energy board, surveys gasoline prices across Quebec every day and publishes an average for each region, the island of Montreal among them. Its licence does not allow republishing its history, so this page shows only the figure of the day, with the date, and links to the Régie for anything older.' },
      { q: 'Why is gas more expensive in Montreal than in Quebec City?', a: 'Part of the answer is a tax. Inside the territory of the Autorité régionale de transport métropolitain, gasoline carries a 3-cent levy per litre that funds public transit, on top of the 19.2-cent Quebec fuel tax. With GST and QST applied on top, that levy costs a little more than 3 cents at the pump. Station competition does the rest, and it can go either way.' },
      { q: 'Does the ARTM levy apply to diesel in Montreal?', a: 'No. The 3-cent ARTM levy applies to gasoline only. Diesel in Montreal pays the Quebec fuel tax of 20.2 cents per litre, the federal excise tax when it is in force, and GST and QST. That is one reason why the gap between gasoline and diesel prices in Montreal is not the same as in Toronto or Calgary.' },
      { q: 'Where do Montreal premium and diesel prices come from?', a: 'The Régie survey covers regular gasoline only. For premium and diesel, the only open official source is the monthly average of Statistics Canada for Montreal. This page shows the last published month and an estimate that brings it to today with the wholesale price, so treat those two lines as a monthly benchmark rather than a price of the day.' },
    ],
    body: (h) => `
<h2>One figure a day for the island</h2>
<p>Most Canadian cities only get a weekly or monthly official price. Montreal gets a fresh one every morning, because Quebec gave its energy board the job of watching gasoline prices. The table puts that daily figure for regular next to the monthly Statistics Canada averages used for premium and diesel, so you can see at a glance which line is from this morning and which is from last month.</p>
${facts(h, ID)}
<p>The Régie publishes under its own terms of use, which do not cover reuse of its history. That is why this page has no chart of past Montreal prices: each day it shows the day's figure and its date, and the archive stays on the ${h.src('regie', 'Régie website')}. ${mo ? `As a cross-check, Statistics Canada put Montreal regular at ${h.cpl(mo.value)} on average in ${K.month(mo.date, 'en')}.` : ''}</p>

<h2>What tomorrow looks like in Montreal</h2>
<p>${flat ? `With a daily survey, the best starting point for tomorrow is this morning's average. The wholesale price the method watches is published with about a week of delay, and today it is older than the Régie survey, so it adds nothing: the estimate for ${h.day(K.TOMORROW)} is the same ${h.cpl(r.est.value)}.` : `The estimate for ${h.day(K.TOMORROW)} starts from this morning's average and adds the wholesale movement published since, giving ${h.cpl(r.est.value)}.`} Over the past ${r.bt?.n ?? 0} days the estimate missed the next morning's figure by ${h.cpl(r.bt?.mae ?? 0)} on average, and by no more than ${h.cpl(r.bt?.p90 ?? 0)} on nine days out of ten.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Montreal tomorrow' })}
<p>For diesel and premium the starting point is a month old, so the estimate does more work there: it adds the change in the wholesale price since that month and any dated tax change. The ${h.a('tomorrow', 'tomorrow page')} shows the same calculation for every city.</p>

<h2>The taxes in a Montreal litre</h2>
<p>Three layers sit on top of the product. The Quebec fuel tax is 19.2 cents per litre of gasoline, a rate that has not moved since April 2013. The ARTM adds 3 cents inside its transit territory, which covers the island and the surrounding municipalities of the metropolitan area, ${h.a('laval', 'Laval')} included. Then GST at 5% and QST at 9.975% are charged on the price that already includes those per-litre taxes, which comes to ${h.cpl(salesE)} at this morning's price.</p>
${taxTable(h, ID)}
<p>The cost of Quebec's cap-and-trade system does not appear as a separate line: the province notes that it is already included in the wholesale price, so it sits in the product share. The federal excise tax of 10 cents is suspended until at least January 31, 2027 under Finance Canada's draft legislation (proposed, not enacted), and the ${h.a('taxes', 'tax page')} follows its planned return.</p>

<h2>Montreal against Toronto</h2>
<p>Drivers who move between the two cities often wonder which one is cheaper. The comparison below uses this morning's Régie figure for Montreal and the latest Ontario survey for Toronto, so both are city averages with their dates.</p>
${h.mini('comparer', { p: ['w'], d: { v: ID, w: 'toronto' }, t: 'Montreal or Toronto, per litre' })}
<p>Most of the gap comes from tax rather than from the stations. Ontario charges 9 cents a litre and 13% HST; Montreal pays more than twice that per-litre tax before the sales taxes, which are also higher. A 55-litre fill-up at this morning's Montreal price costs ${h.usd(K.fillCost(55, r.latest.value))}, of which ${h.usd(K.fillCost(55, brE.salesTax + brE.lines.reduce((a, x) => a + x.cpl, 0)))} is tax.</p>
`,
  },
  fr: {
    slug: 'prix-essence-montreal',
    nav: 'Montréal', card: 'Moyenne quotidienne de la Régie, taxe ARTM, super et diesel',
    title: 'Prix essence Montréal aujourd\'hui, relevé de la Régie 2026',
    description: 'Prix de l\'essence à Montréal en 2026 : la moyenne quotidienne de la Régie de l\'énergie, celui de demain, la taxe ARTM de 3 ¢ et le coût d\'un plein sur l\'île.',
    h1: 'Prix de l\'essence à Montréal, relevé chaque matin',
    intro: `La Régie de l'énergie a établi l'essence ordinaire à ${cf(r.latest.value)} à Montréal le ${F.day(r.latest.date)}.`,
    resume: `À Montréal, le prix officiel de l'essence se lit chaque jour : la Régie de l'énergie du Québec relève les prix affichés sur l'île et publie tous les matins une moyenne régionale. Celle du ${F.day(r.latest.date)} s'établit à ${cf(r.latest.value)} pour l'ordinaire, taxes comprises. ${flat ? `Aucun prix de gros plus récent que ce relevé n'est encore paru : l'estimation du ${F.day(K.TOMORROW)} reprend donc les mêmes ${cf(r.est.value)}` : `L'estimation du ${F.day(K.TOMORROW)} est de ${cf(r.est.value)}`}. Rejouée sur ${r.bt?.n ?? 0} jours, cette façon d'estimer a manqué le chiffre du lendemain de ${cf(r.bt?.mae ?? 0)} en moyenne. La super et le diesel ne font pas partie du relevé de la Régie : leurs chiffres viennent de la moyenne mensuelle de Statistique Canada (${K.month(pr.latest.date, 'fr')}), soit ${cf(pr.latest.value)} et ${cf(d.latest.value)}. Dans un litre montréalais, la taxe sur les carburants de 19,2 ¢, la taxe de l'ARTM de 3 ¢ et ${cf(salesF)} de TPS et de TVQ représentent ${F.p(brF.taxShare)} du prix ; la taxe d'accise fédérale est suspendue depuis le 20 avril 2026.`,
    faqs: [
      { q: 'Qui publie le prix officiel de l\'essence à Montréal ?', a: 'C\'est la Régie de l\'énergie du Québec. Elle relève chaque jour les prix de l\'essence dans toutes les régions de la province et publie une moyenne pour chacune, dont l\'île de Montréal. Ses conditions d\'utilisation ne permettent pas de reprendre son historique : cette page affiche donc le chiffre du jour, daté, et renvoie au site de la Régie pour les jours précédents.' },
      { q: 'Pourquoi l\'essence coûte-t-elle plus cher à Montréal qu\'à Québec ?', a: 'Une partie de l\'écart vient d\'une taxe. Sur le territoire de l\'Autorité régionale de transport métropolitain, l\'essence supporte 3 ¢ de plus par litre pour financer le transport collectif, en plus des 19,2 ¢ de la taxe québécoise. Comme la TPS et la TVQ s\'appliquent par-dessus, cette taxe pèse un peu plus de 3 ¢ à la pompe. La concurrence entre stations fait le reste, dans un sens ou dans l\'autre.' },
      { q: 'La taxe de l\'ARTM s\'applique-t-elle au diesel à Montréal ?', a: 'Non, les 3 ¢ de l\'ARTM visent seulement l\'essence. Le diesel vendu à Montréal paie la taxe québécoise sur les carburants de 20,2 ¢ le litre, la taxe d\'accise fédérale lorsqu\'elle est perçue, puis la TPS et la TVQ. C\'est une des raisons pour lesquelles l\'écart entre essence et diesel n\'est pas le même à Montréal qu\'à Toronto ou à Calgary.' },
      { q: 'D\'où viennent les prix de la super et du diesel à Montréal ?', a: 'Le relevé de la Régie ne porte que sur l\'essence ordinaire. Pour la super et le diesel, la seule source officielle ouverte est la moyenne mensuelle de Statistique Canada pour Montréal. La page montre le dernier mois publié et une estimation qui le ramène à aujourd\'hui avec le prix de gros : ces deux lignes sont des repères mensuels, pas des prix du jour.' },
    ],
    body: (h) => `
<h2>Un chiffre par jour pour l'île</h2>
<p>La plupart des villes canadiennes n'ont qu'un prix officiel par semaine, voire par mois. Montréal en a un nouveau chaque matin, parce que le Québec a confié à la Régie de l'énergie la surveillance du prix de l'essence. Le tableau place ce chiffre quotidien de l'ordinaire à côté des moyennes mensuelles de Statistique Canada qui servent pour la super et le diesel : on voit tout de suite quelle ligne date de ce matin et laquelle date du mois dernier.</p>
${facts(h, ID)}
<p>Les conditions d'utilisation de la Régie ne couvrent pas la reprise de son historique. Voilà pourquoi cette page ne trace aucune courbe des prix passés à Montréal : elle donne chaque jour le chiffre du jour et sa date, et l'archive reste sur le ${h.src('regie', 'site de la Régie')}. ${mo ? `À titre de recoupement, Statistique Canada situait l'ordinaire à ${h.cpl(mo.value)} en moyenne à Montréal en ${K.month(mo.date, 'fr')}.` : ''}</p>

<h2>Et demain à Montréal ?</h2>
<p>${flat ? `Avec un relevé quotidien, le meilleur point de départ pour demain reste la moyenne de ce matin. Le prix de gros que suit la méthode paraît avec environ une semaine de retard ; il est aujourd'hui plus ancien que le relevé de la Régie et n'apporte rien : l'estimation du ${h.day(K.TOMORROW)} reste à ${h.cpl(r.est.value)}.` : `L'estimation du ${h.day(K.TOMORROW)} part de la moyenne de ce matin et y ajoute le mouvement du prix de gros publié depuis : ${h.cpl(r.est.value)}.`} Sur les ${r.bt?.n ?? 0} derniers jours, l'estimation a manqué le chiffre du lendemain de ${h.cpl(r.bt?.mae ?? 0)} en moyenne, et de ${h.cpl(r.bt?.p90 ?? 0)} au plus neuf jours sur dix.</p>
${h.mini('demain', { p: ['c'], d: { v: ID }, t: 'Montréal demain' })}
<p>Pour le diesel et la super, le point de départ a un mois : l'estimation travaille davantage, en ajoutant la variation du prix de gros depuis ce mois-là et tout changement de taxe daté. La page ${h.a('tomorrow', 'prix de demain')} refait ce calcul pour chaque ville.</p>

<h2>Les taxes dans un litre à Montréal</h2>
<p>Trois étages s'ajoutent au produit. La taxe québécoise sur les carburants est de 19,2 ¢ le litre d'essence, un taux inchangé depuis avril 2013. L'ARTM prélève 3 ¢ de plus sur son territoire, qui couvre l'île et les municipalités de la région métropolitaine, ${h.a('laval', 'Laval')} comprise. Viennent enfin la TPS de 5 % et la TVQ de 9,975 %, calculées sur un prix qui contient déjà ces taxes au litre : ${h.cpl(salesF)} au prix de ce matin.</p>
${taxTable(h, ID)}
<p>Le coût du marché du carbone québécois n'apparaît pas sur une ligne à part : selon la province, il est déjà compris dans le prix de gros, donc dans la part du produit. La taxe d'accise fédérale de 10 ¢ est suspendue au moins jusqu'au 31 janvier 2027 d'après l'avant-projet de loi de Finances Canada (projet de loi, non adopté) ; la page ${h.a('taxes', 'des taxes')} suit son retour prévu.</p>

<h2>Montréal ou Toronto ?</h2>
<p>Ceux qui font souvent la route entre les deux métropoles se demandent laquelle est la moins chère. La comparaison ci-dessous oppose le chiffre de la Régie de ce matin pour Montréal au dernier relevé de l'Ontario pour Toronto : deux moyennes de ville, chacune avec sa date.</p>
${h.mini('comparer', { p: ['w'], d: { v: ID, w: 'toronto' }, t: 'Montréal ou Toronto, au litre' })}
<p>L'essentiel de l'écart tient aux taxes plutôt qu'aux stations. L'Ontario prélève 9 ¢ le litre et une TVH de 13 % ; Montréal paie plus du double en taxe au litre avant les taxes de vente, elles-mêmes plus élevées. Un plein de 55 litres au prix de ce matin revient à ${h.usd(K.fillCost(55, r.latest.value))}, dont ${h.usd(K.fillCost(55, brF.salesTax + brF.lines.reduce((a, x) => a + x.cpl, 0)))} de taxes.</p>
`,
  },
});
