/** llms.txt (RECETTE §21), généré à partir du registre des pages. */
import { GUIDES } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { GROUPS } from '../i18n/nav';
import { KIT as K } from '../lib/kit';
export function GET() {
  const E = K.en, Y = K.YEAR;
  const lines = [
    `# ${SITE_NAMES.en} / ${SITE_NAMES.fr}`, '',
    `> Bilingual (French and English) calculators for Canadian registered accounts in ${Y}: TFSA (CELI) contribution room rebuilt year by year from 2009, age 18 and the year of arrival in Canada (${E.m(K.tfsaCum(Y))} in total, ${E.m(K.tfsaLimit(Y))} for ${Y}); RRSP (REER) room at 18% of earned income up to ${E.m(K.rrspLimit(Y))} (${E.m(K.rrspLimit(Y + 1))} in ${Y + 1}); FHSA (CELIAPP) at ${E.m(K.P.fhsa.annual)} a year and ${E.m(K.P.fhsa.lifetime)} lifetime; HBP and LLP repayments; RRSP vs TFSA with the ${Y} federal brackets and those of all 13 provinces and territories, Quebec abatement included; effects on the Canada child benefit, OAS and GIS. The ${Y + 1} TFSA limit is shown as not yet published. Independent site published by Radif Partners, not affiliated with the Canada Revenue Agency or Revenu Québec; general information, not personal advice. Last updated ${LAST_UPDATED}.`, '',
    ...GROUPS.flatMap((g) => [`## ${g.label.en} / ${g.label.fr}`, ...GUIDES.filter((p) => p.group === g.id).flatMap((p) => [`- [${p.en.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.en.card}`, `- [${p.fr.nav}](${SITE_URL}${route(p.id, 'fr')}) : ${p.fr.card}`]), '']),
    '## About', `- [How we calculate](${SITE_URL}${route('method', 'en')})`, `- [Méthode de calcul](${SITE_URL}${route('method', 'fr')})`, `- [About](${SITE_URL}${route('about', 'en')})`, `- [À propos](${SITE_URL}${route('about', 'fr')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
