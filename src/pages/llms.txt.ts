/** llms.txt (RECETTE §21), généré à partir du registre des pages et de l'instantané du jour. */
import { GUIDES } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route, hasRoute } from '../i18n/routes';
import { GROUPS } from '../i18n/nav';
import { KIT as K } from '../lib/kit';
export function GET() {
  const n = K.SNAP.national;
  const lines = [
    `# ${SITE_NAMES.en} / ${SITE_NAMES.fr}`, '',
    `> Gas and diesel prices in 28 Canadian cities (English and French): the latest dated official average (Government of Ontario weekly survey, Régie de l'énergie du Québec daily survey, Nova Scotia, New Brunswick and Newfoundland and Labrador maximum prices, Statistics Canada monthly averages), an estimate for tomorrow built from wholesale prices and dated tax changes with its error measured on past surveys, fill-up and yearly cost calculators, and the taxes in a litre by province. Canada average for regular gasoline: ${K.cpl(n.value, 'en')} in ${K.month(n.date, 'en')} (Statistics Canada). Federal excise tax suspended since April 20, 2026. Independent site published by Radif Partners, not affiliated with any government or regulator. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label.en} / ${g.label.fr}`, ...GUIDES.filter((p) => p.group === g.id).flatMap((p) => [`- [${p.en.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.en.card}`, ...(p.fr && hasRoute(p.id, 'fr') ? [`- [${p.fr.nav}](${SITE_URL}${route(p.id, 'fr')}) : ${p.fr.card}`] : [])]), '']),
    '## About', `- [Method](${SITE_URL}${route('method', 'en')})`, `- [Méthode](${SITE_URL}${route('method', 'fr')})`, `- [About](${SITE_URL}${route('about', 'en')})`, `- [À propos](${SITE_URL}${route('about', 'fr')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
