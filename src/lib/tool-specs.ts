/**
 * Les calculateurs du site, un par sujet, dans les deux langues. Chaque chiffre vient du moteur
 * (src/lib/engine/*), qui lit params-2026.json. Une spec liste ses champs (visibles d'abord, `adv`
 * repliés) et une fonction pure `run` qui rend la carte de résultat.
 */
import P from '../data/params-2026.json';
import type { ToolSpec, V, Input, Opt } from './tool-types';
import { resolve } from './tool-types';
import { formatMoney, formatPercent, formatNumber, type Lang } from './format';
import { PROVS, type Prov, tax, taxDetail, marginalRate, marginalSplit, deductionSaving, withdrawalTax, rateSteps } from './engine/tax';
import { tfsaRoom, tfsaCumulative, tfsaLimit, excessTax, rrspRoom, rrspExcess, rrspWithholding, rrspDollarLimit, fhsaRoom, hbpPlan, llpPlan, spousalFreeYear, YEAR } from './engine/accounts';
import { rrspVsTfsa, ccbGain, oasRecovery } from './engine/compare';

export type Args = Record<string, number | string>;
const T = (l: Lang, fr: string, en: string) => (l === 'fr' ? fr : en);
export const money = (x: number, l: Lang) => `${x < -0.5 ? '-' : ''}${formatMoney(Math.abs(Math.round(x)), 0, l)}`;
export const pct = (x: number, l: Lang, d = 1) => formatPercent(x, d, l);
const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k]);
const PN = P.provinceNames as Record<Prov, { fr: string; en: string; frIn: string; short: string }>;
export const provName = (p: Prov, l: Lang) => PN[p][l];
export const provIn = (p: Prov) => PN[p].frIn;

/* ---------- champs communs ---------- */
const provOpts = (l: Lang): Opt[] => PROVS.map((p) => ({ value: p, label: provName(p, l) }));
const provField = (l: Lang, def: string = 'QC', adv = false): Input => ({ kind: 'select', id: 'pr', label: T(l, 'Province ou territoire', 'Province or territory'), def, options: provOpts(l), help: T(l, 'Celle où vous habitez le 31 décembre', 'Where you live on December 31'), adv });
const incomeField = (l: Lang, def = 70000, id = 'rv', label?: string, help?: string): Input => ({ id, label: label ?? T(l, 'Revenu imposable 2026', '2026 taxable income'), def, unit: '$', max: 5000000, help: help ?? T(l, 'Avant la déduction REER ou CELIAPP', 'Before the RRSP or FHSA deduction') });
const BIRTH: Opt[] = Array.from({ length: 2008 - 1935 + 1 }, (_, i) => ({ value: String(2008 - i), label: String(2008 - i) }));
const birthField = (l: Lang, def = 1990): Input => ({ kind: 'select', id: 'na', label: T(l, 'Année de naissance', 'Year of birth'), def: String(def), options: BIRTH });
const arrivalField = (l: Lang, def = '0'): Input => ({
  kind: 'select', id: 'ar', label: T(l, 'Résident du Canada depuis', 'Resident of Canada since'), def,
  options: [{ value: '0', label: T(l, '2009 ou avant (ou depuis la naissance)', '2009 or earlier (or since birth)') }, ...Array.from({ length: YEAR - 2009 }, (_, i) => ({ value: String(2010 + i), label: String(2010 + i) }))],
  help: T(l, 'Année d’arrivée : elle compte en entier', 'Year you arrived: it counts in full'),
});
const yearOpts = (from: number, to: number): Opt[] => Array.from({ length: to - from + 1 }, (_, i) => ({ value: String(from + i), label: String(from + i) }));
const yesNo = (l: Lang, id: string, label: string, def = 'oui', adv = false): Input => ({ kind: 'choice', id, label, def, options: [{ value: 'oui', label: T(l, 'Oui', 'Yes') }, { value: 'non', label: T(l, 'Non', 'No') }], adv } as Input);

/* ---------- tableau des 13 juridictions ---------- */
function provTable(l: Lang, income: number, amount: number) {
  return PROVS.map((p) => {
    const sv = deductionSaving(income, amount, p);
    return [provName(p, l), pct(marginalRate(income, p), l), money(sv, l)];
  });
}

export const SPECS: Record<string, (l: Lang, arg?: Args) => ToolSpec> = {
  /* Accueil : bilan 2026 des trois comptes */
  bilan: (l) => ({
    inputs: [birthField(l, 1990), arrivalField(l), provField(l, 'QC'), incomeField(l, 70000, 'rv', T(l, 'Revenu gagné en 2025', 'Earned income in 2025'), T(l, 'Salaire ou revenu d’entreprise : il ouvre vos droits REER 2026', 'Salary or business income: it sets your 2026 RRSP room')),
      { id: 'cv', label: T(l, 'Déjà versé au CELI, retraits déduits', 'Already in your TFSA, net of withdrawals'), def: 0, unit: '$', max: 1000000, help: T(l, 'Total des dépôts moins les retraits des années passées', 'Deposits minus withdrawals in past years') },
      yesNo(l, 'pp', T(l, 'Premier achat d’une propriété ?', 'Buying a first home?'), 'non')],
    run: (v) => {
      const pr = s(v, 'pr') as Prov, by = Number(v.na), ar = Number(v.ar), inc = n(v, 'rv');
      const t = tfsaRoom({ birthYear: by, arrival: ar, contribBefore: n(v, 'cv'), withdrawBefore: 0, contribThisYear: 0, withdrawThisYear: 0 });
      const r = rrspRoom({ earnedPrevYear: inc });
      const age = YEAR - by;
      const fhsaOk = s(v, 'pp') === 'oui' && age >= P.fhsa.ageMin && age <= P.fhsa.ageMaxOpen;
      const mr = marginalRate(inc, pr);
      const refund1000 = deductionSaving(inc, 1000, pr);
      const order = fhsaOk ? T(l, 'CELIAPP d’abord : déduit comme un REER, retiré sans impôt pour la maison', 'FHSA first: deductible like an RRSP, tax-free out for the home')
        : mr >= 0.35 ? T(l, 'REER d’abord si votre taux à la retraite sera plus bas', 'RRSP first if your retirement rate will be lower')
          : mr < 0.25 ? T(l, 'CELI d’abord : la déduction REER vaut peu à ce revenu', 'TFSA first: the RRSP deduction is worth little at this income')
            : T(l, 'Les deux se valent : tout dépend du taux au retrait', 'A close call: it turns on your rate at withdrawal');
      return {
        label: T(l, `Vos droits CELI disponibles en ${YEAR}`, `Your TFSA room available in ${YEAR}`), value: money(t.available, l),
        sub: t.startYear === null ? T(l, 'Pas encore de droits : ils s’ouvrent l’année de vos 18 ans.', 'No room yet: it opens the year you turn 18.')
          : t.excess > 0 ? T(l, `Excédent de ${money(t.excess, l)} : impôt de 1 % par mois, soit ${money(t.monthlyTax, l)}.`, `Excess of ${money(t.excess, l)}: 1% tax a month, ${money(t.monthlyTax, l)}.`)
            : T(l, `Droits accumulés depuis ${t.startYear}, sur ${t.years} années.`, `Room built up since ${t.startYear}, over ${t.years} years.`),
        rows: [
          [T(l, `REER : nouveaux droits ${YEAR} (18 % du revenu 2025)`, `RRSP: new ${YEAR} room (18% of 2025 income)`), money(r.newRoom, l), r.newRoom],
          [T(l, 'CELIAPP : droits de la première année', 'FHSA: first-year room'), fhsaOk ? money(P.fhsa.annual, l) : T(l, 'non admissible ici', 'not eligible here'), fhsaOk ? P.fhsa.annual : 0],
          [T(l, `Taux marginal combiné, ${provName(pr, l)}`, `Combined marginal rate, ${provName(pr, l)}`), pct(mr, l)],
          [T(l, `Remboursement pour ${money(1000, l)} au REER`, `Refund on ${money(1000, l)} in an RRSP`), money(refund1000, l)],
          [T(l, 'Par où commencer', 'Where to start'), order],
        ],
        note: T(l, 'Le maximum déductible REER exact figure sur votre avis de cotisation 2025 (il ajoute vos droits inutilisés et retire le facteur d’équivalence d’un régime de retraite).', 'Your exact RRSP deduction limit is on your 2025 notice of assessment (it adds unused room and subtracts any pension adjustment).'),
      };
    },
  }),

  /* Droits CELI cumulés */
  celi: (l) => ({
    inputs: [birthField(l, 1990), arrivalField(l),
      { id: 'cb', label: T(l, 'Cotisations avant 2026', 'Contributions before 2026'), def: 0, unit: '$', max: 1000000, help: T(l, 'Tous vos CELI, transferts directs exclus', 'All your TFSAs, direct transfers excluded') },
      { id: 'wb', label: T(l, 'Retraits avant 2026', 'Withdrawals before 2026'), def: 0, unit: '$', max: 1000000, help: T(l, 'Déjà recrédités au 1er janvier suivant', 'Already added back the next January 1') },
      { id: 'cn', label: T(l, 'Cotisations en 2026', 'Contributions in 2026'), def: 0, unit: '$', max: 1000000 },
      { id: 'wn', label: T(l, 'Retraits en 2026', 'Withdrawals in 2026'), def: 0, unit: '$', max: 1000000, help: T(l, 'Recrédités le 1er janvier 2027', 'Added back on January 1, 2027') },
      { id: 'nr', label: T(l, 'Années entières hors du Canada', 'Full years living outside Canada'), def: 0, max: 17, help: T(l, 'Non-résident toute l’année : pas de droits', 'Non-resident all year: no room'), adv: true }],
    run: (v) => {
      const t = tfsaRoom({ birthYear: Number(v.na), arrival: Number(v.ar), nonResidentYears: n(v, 'nr'), contribBefore: n(v, 'cb'), withdrawBefore: n(v, 'wb'), contribThisYear: n(v, 'cn'), withdrawThisYear: n(v, 'wn') });
      const rows: Array<[string, string, number?]> = t.startYear === null ? [[T(l, 'Ouverture des droits', 'Room opens'), String(Number(v.na) + 18)]] : [
        [T(l, `Plafonds cumulés ${t.startYear} à ${YEAR}`, `Limits added up, ${t.startYear} to ${YEAR}`), money(t.accrued, l), t.accrued],
        [T(l, 'Moins les cotisations des années passées', 'Minus past contributions'), money(-n(v, 'cb'), l), n(v, 'cb')],
        [T(l, 'Plus les retraits des années passées', 'Plus past withdrawals'), money(n(v, 'wb'), l), n(v, 'wb')],
        [T(l, `Droits au 1er janvier ${YEAR}`, `Room on January 1, ${YEAR}`), money(t.roomJan1, l)],
        [T(l, `Moins les cotisations de ${YEAR}`, `Minus ${YEAR} contributions`), money(-n(v, 'cn'), l)],
        [T(l, `Recrédité le 1er janvier ${YEAR + 1}`, `Added back on January 1, ${YEAR + 1}`), money(t.addedBackNextYear, l)],
      ];
      return {
        label: t.excess > 0 ? T(l, 'Excédent CELI en ce moment', 'TFSA excess right now') : T(l, `Droits CELI disponibles en ${YEAR}`, `TFSA room available in ${YEAR}`),
        value: money(t.excess > 0 ? t.excess : t.available, l),
        sub: t.excess > 0 ? T(l, `Impôt de 1 % par mois tant que l’excédent reste : ${money(t.monthlyTax, l)} par mois. Un retrait l’efface.`, `1% tax a month while the excess stays: ${money(t.monthlyTax, l)} a month. A withdrawal clears it.`)
          : t.startYear === null ? T(l, 'Les droits s’ouvrent l’année de vos 18 ans, si vous résidez au Canada.', 'Room opens the year you turn 18, if you live in Canada.')
            : T(l, `En ${YEAR + 1}, s’ajoutent vos retraits de ${YEAR} et le plafond ${YEAR + 1}, pas encore publié.`, `In ${YEAR + 1}, your ${YEAR} withdrawals come back, plus the ${YEAR + 1} limit, not yet published.`),
        rows,
        table: t.perYear.length ? { caption: T(l, 'Plafond de chaque année où vous aviez 18 ans et résidiez au Canada', 'Limit for each year you were 18 and lived in Canada'), headers: [T(l, 'Année', 'Year'), T(l, 'Plafond', 'Limit'), T(l, 'Cumul', 'Running total')], rows: t.perYear.map((r) => [String(r.year), money(r.limit, l), money(r.cumulative, l)]), align: ['l', 'r', 'r'] } : undefined,
        note: T(l, 'Le chiffre de l’Agence dans Mon dossier ne compte pas les opérations de l’année en cours : vos relevés bancaires font foi.', 'The CRA figure in My Account leaves out this year’s transactions: your own statements are the reference.'),
      };
    },
  }),

  /* Impôt sur un excédent CELI ou CELIAPP, ou une cotisation de non-résident */
  excedent: (l, a) => ({
    inputs: [{ id: 'ex', label: T(l, 'Montant en trop', 'Amount over the limit'), def: Number(a?.ex ?? 3000), unit: '$', max: 1000000 }, { id: 'mo', label: T(l, 'Mois avant de le retirer', 'Months before you take it out'), def: Number(a?.mo ?? 6), max: 120, unit: T(l, 'mois', 'mo') }],
    run: (v) => {
      const tx = excessTax(n(v, 'ex'), n(v, 'mo'));
      return {
        label: T(l, 'Impôt de 1 % par mois', '1% monthly tax'), value: money(tx, l),
        sub: T(l, `${money(n(v, 'ex') * 0.01, l)} par mois sur ${formatNumber(n(v, 'mo'), 0, l)} mois.`, `${money(n(v, 'ex') * 0.01, l)} a month for ${formatNumber(n(v, 'mo'), 0, l)} months.`),
        rows: [[T(l, 'Excédent le plus élevé du mois', 'Highest excess in the month'), money(n(v, 'ex'), l)], [T(l, 'Taux', 'Rate'), T(l, '1 % par mois', '1% a month')], [T(l, 'Après un an', 'After a year'), money(excessTax(n(v, 'ex'), 12), l)]],
        note: T(l, 'Le revenu tiré de l’excédent peut aussi être imposé à part ; l’Agence peut annuler l’impôt sur demande si l’erreur est corrigée vite.', 'Income earned on the excess can be taxed separately; the CRA can waive the tax on request if the error is fixed quickly.'),
      };
    },
  }),

  /* REER ou CELI */
  reerCeli: (l, a) => ({
    inputs: [provField(l, String(a?.pr ?? 'QC')), incomeField(l, Number(a?.rv ?? 70000)),
      { id: 'ep', label: T(l, 'Épargne disponible, après impôt', 'Savings available, after tax'), def: 5000, unit: '$', max: 1000000, help: T(l, 'Ce que vous sortez de votre poche cette année', 'What comes out of your pocket this year') },
      { id: 'an', label: T(l, 'Années avant le retrait', 'Years before withdrawal'), def: 25, max: 60, unit: T(l, 'ans', 'yrs') },
      { id: 'rr', label: T(l, 'Revenu imposable à la retraite', 'Taxable income in retirement'), def: Number(a?.rr ?? 35000), unit: '$', max: 5000000, help: T(l, 'Rentes RRQ ou RPC, SV, régime de retraite, hors REER', 'QPP or CPP, OAS, pension, RRSP excluded') },
      { id: 'rd', label: T(l, 'Rendement réel annuel', 'Real annual return'), def: 3, max: 15, unit: '%', decimals: 1, adv: true },
      { id: 'dc', label: T(l, 'Années de retraits', 'Years of withdrawals'), def: 20, max: 40, unit: T(l, 'ans', 'yrs'), adv: true },
      { ...provField(l, String(a?.pr ?? 'QC'), true), id: 'pt', label: T(l, 'Province à la retraite', 'Province in retirement'), help: undefined } as Input],
    run: (v) => {
      const pr = s(v, 'pr') as Prov;
      const c = rrspVsTfsa({ prov: pr, retireProv: s(v, 'pt') as Prov, income: n(v, 'rv'), save: n(v, 'ep'), years: n(v, 'an'), growth: n(v, 'rd') / 100, retireIncome: n(v, 'rr'), spread: n(v, 'dc') });
      const win = Math.abs(c.gap) < 1 ? 'eq' : c.gap > 0 ? 'reer' : 'celi';
      return {
        label: win === 'reer' ? T(l, 'Avantage du REER, net d’impôt', 'RRSP advantage, after tax') : win === 'celi' ? T(l, 'Avantage du CELI, net d’impôt', 'TFSA advantage, after tax') : T(l, 'Égalité', 'A tie'),
        value: money(Math.abs(c.gap), l),
        sub: T(l, `Taux récupéré aujourd’hui ${pct(c.rateNow, l)}, taux payé au retrait ${pct(c.rateLater, l)}. Le compte qui gagne est celui dont le taux est le plus bas à la sortie.`, `Rate saved today ${pct(c.rateNow, l)}, rate paid on withdrawal ${pct(c.rateLater, l)}. The winner is the account taxed least on the way out.`),
        rows: [
          [T(l, 'Versement REER pour le même effort', 'RRSP contribution for the same effort'), money(c.contribution, l), c.contribution],
          [T(l, 'Dont remboursement d’impôt', 'Of which tax refund'), money(c.refund, l), c.refund],
          [T(l, 'CELI à l’échéance', 'TFSA at the end'), money(c.tfsaValue, l), c.tfsaValue],
          [T(l, 'REER à l’échéance, avant impôt', 'RRSP at the end, before tax'), money(c.rrspValue, l), c.rrspValue],
          [T(l, 'Impôt sur les retraits REER', 'Tax on RRSP withdrawals'), money(-c.rrspTax, l), c.rrspTax],
          [T(l, 'REER net d’impôt', 'RRSP after tax'), money(c.rrspNet, l), c.rrspNet],
          ...(c.oasClawPerYear > 0 ? [[T(l, 'Récupération de la SV possible, par an', 'Possible OAS clawback, per year'), money(c.oasClawPerYear, l)] as [string, string]] : []),
        ],
        note: c.gisAtRisk ? T(l, 'Revenu de retraite sous le seuil du SRG : chaque retrait REER réduirait le Supplément de revenu garanti, pas un retrait CELI. Le calcul ci-dessus ne compte pas cette perte.', 'Retirement income below the GIS threshold: every RRSP withdrawal would reduce the Guaranteed Income Supplement, a TFSA withdrawal would not. The figure above leaves that loss out.')
          : T(l, 'Barème 2026 appliqué aux deux moments, en dollars d’aujourd’hui (les tranches sont indexées chaque année).', '2026 tax tables applied at both ends, in today’s dollars (brackets are indexed every year).'),
      };
    },
  }),

  /* Remboursement d'impôt REER (et CELIAPP) */
  remboursement: (l, a) => ({
    inputs: [provField(l, String(a?.pr ?? 'QC')), incomeField(l, Number(a?.rv ?? 70000)), { id: 'mt', label: T(l, 'Cotisation déduite', 'Contribution deducted'), def: Number(a?.mt ?? 5000), unit: '$', max: 1000000 }],
    run: (v) => {
      const pr = s(v, 'pr') as Prov, inc = n(v, 'rv'), mt = Math.min(n(v, 'mt'), inc);
      const sv = deductionSaving(inc, mt, pr), before = taxDetail(inc, pr), after = taxDetail(inc - mt, pr);
      return {
        label: T(l, 'Remboursement ou baisse d’impôt', 'Refund or tax saved'), value: money(sv, l),
        sub: T(l, `Taux moyen sur la cotisation : ${pct(mt > 0 ? sv / mt : 0, l)} ; taux marginal avant : ${pct(marginalRate(inc, pr), l)}.`, `Average rate on the contribution: ${pct(mt > 0 ? sv / mt : 0, l)}; marginal rate before: ${pct(marginalRate(inc, pr), l)}.`),
        rows: [
          [T(l, 'Baisse de l’impôt fédéral', 'Federal tax saved'), money(before.federal - after.federal, l), before.federal - after.federal],
          [pr === 'QC' ? T(l, 'Baisse de l’impôt du Québec', 'Quebec tax saved') : T(l, 'Baisse de l’impôt provincial', 'Provincial tax saved'), money(before.provincial - after.provincial, l), before.provincial - after.provincial],
          [T(l, 'Revenu imposable après déduction', 'Taxable income after the deduction'), money(inc - mt, l)],
          [T(l, 'Impôt total avant / après', 'Total tax before / after'), `${money(before.total, l)} / ${money(after.total, l)}`],
        ],
        table: { caption: T(l, `La même cotisation de ${money(mt, l)} à ${money(inc, l)} de revenu, dans les 13 provinces et territoires`, `The same ${money(mt, l)} contribution at ${money(inc, l)} of income, in all 13 provinces and territories`), headers: [T(l, 'Province ou territoire', 'Province or territory'), T(l, 'Taux marginal', 'Marginal rate'), T(l, 'Économie', 'Tax saved')], rows: provTable(l, inc, mt), align: ['l', 'r', 'r'] },
        note: T(l, 'Le « remboursement » est la baisse de l’impôt de l’année : il ne vient en argent que si l’impôt retenu sur la paie dépassait l’impôt dû.', 'The “refund” is the drop in your tax for the year: it comes back as cash only if the tax withheld from your pay exceeded the tax owed.'),
      };
    },
  }),

  /* Taux marginal combiné */
  taux: (l, a) => ({
    inputs: [provField(l, String(a?.pr ?? 'QC')), incomeField(l, Number(a?.rv ?? 70000), 'rv', T(l, 'Revenu imposable 2026', '2026 taxable income'), T(l, 'Ligne 26000 de la déclaration', 'Line 26000 of the return'))],
    run: (v) => {
      const pr = s(v, 'pr') as Prov, inc = n(v, 'rv');
      const m = marginalSplit(inc, pr), d = taxDetail(inc, pr);
      const steps = rateSteps(pr);
      const next = steps.find((x) => x.from > inc);
      return {
        label: T(l, `Taux marginal combiné ${YEAR}, ${provName(pr, l)}`, `${YEAR} combined marginal rate, ${provName(pr, l)}`), value: pct(m.total, l),
        sub: next ? T(l, `Prochain changement à ${money(next.from, l)} : ${pct(next.rate, l)}.`, `Next change at ${money(next.from, l)}: ${pct(next.rate, l)}.`) : T(l, 'Vous êtes dans la dernière tranche.', 'You are in the top bracket.'),
        rows: [
          [T(l, pr === 'QC' ? 'Part fédérale (après abattement de 16,5 %)' : 'Part fédérale', pr === 'QC' ? 'Federal share (after the 16.5% abatement)' : 'Federal share'), pct(m.federal, l), m.federal],
          [T(l, pr === 'QC' ? 'Part du Québec' : 'Part provinciale', pr === 'QC' ? 'Quebec share' : 'Provincial share'), pct(m.provincial, l), m.provincial],
          [T(l, 'Impôt total sur ce revenu', 'Total tax on this income'), money(d.total, l)],
          [T(l, 'Taux moyen', 'Average rate'), pct(inc > 0 ? d.total / inc : 0, l)],
        ],
        table: { caption: T(l, `Où le taux combiné change ${provIn(pr)}`, `Where the combined rate changes in ${provName(pr, l)}`), headers: [T(l, 'À partir de', 'From'), T(l, 'Taux marginal combiné', 'Combined marginal rate')], rows: steps.map((x) => [money(x.from, l), pct(x.rate, l)]), align: ['l', 'r'] },
        note: T(l, 'Revenu ordinaire (salaire, intérêts, retrait REER). Dividendes et gains en capital ont leurs propres taux.', 'Ordinary income (salary, interest, RRSP withdrawals). Dividends and capital gains have their own rates.'),
      };
    },
  }),

  /* Plafond et maximum déductible REER */
  plafondReer: (l, a) => ({
    inputs: [{ id: 'rg', label: T(l, 'Revenu gagné en 2025', 'Earned income in 2025'), def: Number(a?.rg ?? 80000), unit: '$', max: 5000000, help: T(l, 'Salaire, revenu d’entreprise, loyers nets', 'Salary, business income, net rent') },
      { id: 'fe', label: T(l, 'Facteur d’équivalence 2025', '2025 pension adjustment'), def: 0, unit: '$', max: 100000, help: T(l, 'Case 52 du T4 (régime de retraite)', 'Box 52 of your T4 (pension plan)') },
      { id: 'di', label: T(l, 'Droits inutilisés reportés', 'Unused room carried forward'), def: 0, unit: '$', max: 2000000, adv: true }],
    run: (v) => {
      const r = rrspRoom({ earnedPrevYear: n(v, 'rg'), pensionAdjustment: n(v, 'fe'), unusedRoom: n(v, 'di') });
      return {
        label: T(l, `Maximum déductible REER ${YEAR}`, `${YEAR} RRSP deduction limit`), value: money(r.limit, l),
        sub: r.capped ? T(l, `18 % de votre revenu dépasse le plafond ${YEAR} de ${money(r.cap, l)} : c’est le plafond qui s’applique.`, `18% of your income is above the ${YEAR} cap of ${money(r.cap, l)}: the cap applies.`) : T(l, `18 % de ${money(n(v, 'rg'), l)}, sous le plafond de ${money(r.cap, l)}.`, `18% of ${money(n(v, 'rg'), l)}, under the ${money(r.cap, l)} cap.`),
        rows: [[T(l, '18 % du revenu gagné 2025', '18% of 2025 earned income'), money(r.pct, l), r.pct], [T(l, `Plafond ${YEAR}`, `${YEAR} dollar limit`), money(r.cap, l), r.cap], [T(l, 'Moins le facteur d’équivalence', 'Minus pension adjustment'), money(-n(v, 'fe'), l)], [T(l, 'Nouveaux droits de l’année', 'New room this year'), money(r.newRoom, l)], [T(l, 'Plus les droits inutilisés', 'Plus unused room'), money(n(v, 'di'), l)]],
        note: T(l, `Plafond ${YEAR + 1} déjà fixé : ${money(rrspDollarLimit(YEAR + 1), l)}, atteint avec ${money(Math.ceil(rrspDollarLimit(YEAR + 1) / 0.18), l)} de revenu gagné en ${YEAR}.`, `${YEAR + 1} limit already set: ${money(rrspDollarLimit(YEAR + 1), l)}, reached with ${money(Math.ceil(rrspDollarLimit(YEAR + 1) / 0.18), l)} of ${YEAR} earned income.`),
      };
    },
  }),

  /* Cotisation excédentaire REER */
  excedentReer: (l) => ({
    inputs: [{ id: 'md', label: T(l, 'Maximum déductible (avis de cotisation)', 'Deduction limit (notice of assessment)'), def: 10000, unit: '$', max: 2000000 }, { id: 'ci', label: T(l, 'Cotisations non déduites à ce jour', 'Undeducted contributions to date'), def: 13500, unit: '$', max: 2000000 }, { id: 'mo', label: T(l, 'Mois avant correction', 'Months before you fix it'), def: 6, max: 120, unit: T(l, 'mois', 'mo') }],
    run: (v) => {
      const e = rrspExcess(n(v, 'md'), n(v, 'ci'));
      return {
        label: e.taxed > 0 ? T(l, 'Impôt de 1 % par mois', '1% tax a month') : T(l, 'Aucun impôt : vous restez dans la marge', 'No tax: you are within the cushion'), value: money(e.taxed > 0 ? e.monthly * Math.max(0, n(v, 'mo')) : e.cushionLeft, l),
        sub: e.taxed > 0 ? T(l, `${money(e.taxed, l)} au-delà de la marge de ${money(e.cushion, l)} : ${money(e.monthly, l)} par mois.`, `${money(e.taxed, l)} above the ${money(e.cushion, l)} cushion: ${money(e.monthly, l)} a month.`) : T(l, `Ce qu’il reste de la marge de ${money(e.cushion, l)}, sans pénalité.`, `What is left of the ${money(e.cushion, l)} cushion, penalty-free.`),
        rows: [[T(l, 'Dépassement du maximum déductible', 'Amount over the limit'), money(e.over, l), e.over], [T(l, 'Marge tolérée (18 ans et plus)', 'Cushion (age 18 and over)'), money(e.cushion, l), e.cushion], [T(l, 'Partie imposée à 1 % par mois', 'Part taxed at 1% a month'), money(e.taxed, l), e.taxed]],
        note: T(l, 'Formulaire T1-OVP à produire dans les 90 jours qui suivent la fin de l’année de l’excédent.', 'File Form T1-OVP within 90 days after the end of the year of the excess.'),
      };
    },
  }),

  /* CELIAPP */
  celiapp: (l, a) => ({
    inputs: [{ kind: 'select', id: 'ou', label: T(l, 'Année d’ouverture', 'Year opened'), def: String(a?.ou ?? 2025), options: yearOpts(2023, YEAR) },
      provField(l, String(a?.pr ?? 'QC')), incomeField(l, Number(a?.rv ?? 65000)),
      { id: 'c3', label: T(l, 'Versé en 2023', 'Paid in 2023'), def: 0, unit: '$', max: 100000, adv: true },
      { id: 'c4', label: T(l, 'Versé en 2024', 'Paid in 2024'), def: 0, unit: '$', max: 100000, adv: true },
      { id: 'c5', label: T(l, 'Versé en 2025', 'Paid in 2025'), def: 3000, unit: '$', max: 100000, adv: true },
      { id: 'c6', label: T(l, `Versé en ${YEAR}`, `Paid in ${YEAR}`), def: 0, unit: '$', max: 100000, adv: true }],
    run: (v) => {
      const ou = Number(v.ou), pr = s(v, 'pr') as Prov;
      const f = fhsaRoom({ opened: ou, contrib: { 2023: n(v, 'c3'), 2024: n(v, 'c4'), 2025: n(v, 'c5'), 2026: n(v, 'c6') } });
      const put = Math.min(f.available, n(v, 'rv'));
      const sv = deductionSaving(n(v, 'rv'), put, pr);
      return {
        label: T(l, `Droits CELIAPP disponibles en ${YEAR}`, `FHSA room available in ${YEAR}`), value: money(f.available, l),
        sub: f.excess > 0 ? T(l, `Excédent de ${money(f.excess, l)} : 1 % par mois.`, `Excess of ${money(f.excess, l)}: 1% a month.`) : T(l, `Report d’un an au plus, ${money(P.fhsa.carryMax, l)} au maximum. Plafond à vie restant : ${money(f.lifetimeLeft, l)}.`, `One-year carry-forward, ${money(P.fhsa.carryMax, l)} at most. Lifetime limit left: ${money(f.lifetimeLeft, l)}.`),
        rows: [
          [T(l, `Économie d’impôt si vous versez ${money(put, l)}`, `Tax saved if you put in ${money(put, l)}`), money(sv, l), sv],
          [T(l, 'Plafond à vie restant', 'Lifetime limit left'), money(f.lifetimeLeft, l), f.lifetimeLeft],
          [T(l, 'Fermeture au plus tard', 'Must close by'), T(l, `fin ${f.closeBy}`, `end of ${f.closeBy}`)],
        ],
        table: { headers: [T(l, 'Année', 'Year'), T(l, 'Droits', 'Room'), T(l, 'Versé', 'Paid'), T(l, 'Reporté', 'Carried')], rows: f.rows.map((r) => [String(r.year), money(r.room, l), money(r.paid, l), money(r.carry, l)]), align: ['l', 'r', 'r', 'r'] },
        note: T(l, 'Vous n’êtes pas obligé de déduire l’année du versement : la déduction peut attendre une année de revenu plus élevé.', 'You need not deduct in the year you contribute: the deduction can wait for a higher-income year.'),
      };
    },
  }),

  /* RAP */
  rap: (l) => ({
    inputs: [{ id: 'mt', label: T(l, 'Retrait REER au titre du RAP', 'RRSP withdrawal under the HBP'), def: 35000, unit: '$', max: 1000000 }, { kind: 'select', id: 'an', label: T(l, 'Année du premier retrait', 'Year of first withdrawal'), def: String(YEAR), options: yearOpts(2018, YEAR + 3) }],
    run: (v) => {
      const h = hbpPlan(n(v, 'mt'), Number(v.an));
      return {
        label: T(l, 'Remboursement minimum par année', 'Minimum repayment per year'), value: money(h.annual, l),
        sub: T(l, `De ${h.start} à ${h.end}${h.relief ? ' : début reporté à la 5e année, allègement prolongé pour les retraits de 2022 à 2028' : ''}.`, `From ${h.start} to ${h.end}${h.relief ? ': start pushed to the 5th year, relief extended to withdrawals from 2022 to 2028' : ''}.`),
        rows: [[T(l, 'Montant retenu', 'Amount counted'), money(h.amount, l), h.amount], [T(l, 'Limite par personne', 'Limit per person'), money(P.hbp.limit, l)], [T(l, 'Durée du remboursement', 'Repayment period'), T(l, `${P.hbp.repayYears} ans`, `${P.hbp.repayYears} years`)], [T(l, 'Si un versement manque', 'If a repayment is missed'), T(l, 'ajouté au revenu imposable', 'added to taxable income')]],
        note: h.capped ? T(l, `Au-delà de ${money(P.hbp.limit, l)}, le retrait est un retrait REER ordinaire, imposable.`, `Above ${money(P.hbp.limit, l)}, the withdrawal is an ordinary taxable RRSP withdrawal.`) : undefined,
      };
    },
  }),

  /* REEP */
  reep: (l) => ({
    inputs: [{ id: 'mt', label: T(l, 'Total retiré au titre du REEP', 'Total withdrawn under the LLP'), def: 15000, unit: '$', max: 1000000, help: T(l, `${money(P.llp.annual, l)} par année au plus`, `${money(P.llp.annual, l)} a year at most`) }, { kind: 'select', id: 'pr', label: T(l, 'Année du premier retrait', 'Year of first withdrawal'), def: String(YEAR), options: yearOpts(2018, YEAR + 2) }, { kind: 'select', id: 'fe', label: T(l, 'Dernière année d’études', 'Last year of studies'), def: String(YEAR + 1), options: yearOpts(2018, YEAR + 8) }],
    run: (v) => {
      const r = llpPlan(n(v, 'mt'), Number(v.pr), Number(v.fe));
      return {
        label: T(l, 'Remboursement minimum par année', 'Minimum repayment per year'), value: money(r.annual, l),
        sub: T(l, `De ${r.start} à ${r.end} : au plus tard la 5e année après le premier retrait.`, `From ${r.start} to ${r.end}: no later than the 5th year after the first withdrawal.`),
        rows: [[T(l, 'Montant retenu', 'Amount counted'), money(r.amount, l), r.amount], [T(l, 'Limite par participation', 'Limit per participation'), money(P.llp.total, l)], [T(l, 'Limite par année', 'Limit per year'), money(P.llp.annual, l)], [T(l, 'Durée', 'Period'), T(l, `${P.llp.repayYears} ans`, `${P.llp.repayYears} years`)]],
        note: r.capped ? T(l, `Au-delà de ${money(P.llp.total, l)}, l’excédent est ajouté au revenu.`, `Above ${money(P.llp.total, l)}, the excess is added to income.`) : undefined,
      };
    },
  }),

  /* Retrait d'un REER : retenue et impôt réel */
  retrait: (l, a) => ({
    inputs: [provField(l, String(a?.pr ?? 'QC')), { id: 'mt', label: T(l, 'Montant retiré', 'Amount withdrawn'), def: 10000, unit: '$', max: 5000000 }, incomeField(l, 45000, 'au', T(l, 'Autres revenus de l’année', 'Other income this year'), T(l, 'Salaire, rentes, sans le retrait', 'Salary, pensions, without the withdrawal'))],
    run: (v) => {
      const pr = s(v, 'pr') as Prov, mt = n(v, 'mt');
      const w = rrspWithholding(mt, pr === 'QC');
      const real = withdrawalTax(n(v, 'au'), mt, pr);
      return {
        label: T(l, 'Impôt réel sur le retrait', 'Actual tax on the withdrawal'), value: money(real, l),
        sub: pr === 'QC' ? T(l, `Retenue fédérale à la source : ${pct(w.rate, l, 0)}, plus la retenue du Québec. Le solde se règle dans la déclaration.`, `Federal withholding: ${pct(w.rate, l, 0)}, plus Quebec withholding. The balance is settled on your return.`) : T(l, `Retenue à la source : ${pct(w.rate, l, 0)}. Le solde se règle dans la déclaration.`, `Withholding: ${pct(w.rate, l, 0)}. The balance is settled on your return.`),
        rows: [[T(l, pr === 'QC' ? 'Retenue fédérale' : 'Retenue à la source', pr === 'QC' ? 'Federal withholding' : 'Withholding'), money(w.withheld, l), w.withheld], [T(l, 'Impôt dû au total', 'Total tax due'), money(real, l), real], ...(pr === 'QC' ? [] : [[T(l, 'À payer en plus au printemps', 'Extra to pay in the spring'), money(Math.max(0, real - w.withheld), l)] as [string, string]]), [T(l, 'Taux moyen sur le retrait', 'Average rate on the withdrawal'), pct(mt > 0 ? real / mt : 0, l)]],
        note: T(l, 'Un retrait REER ne recrée pas de droits de cotisation, au contraire d’un retrait CELI.', 'An RRSP withdrawal does not give back contribution room, unlike a TFSA withdrawal.'),
      };
    },
  }),

  /* Allocation canadienne pour enfants */
  ace: (l) => ({
    inputs: [provField(l, 'ON'), incomeField(l, 85000, 'rf', T(l, 'Revenu familial net', 'Family net income'), T(l, 'Les deux conjoints, avant la déduction', 'Both partners, before the deduction')), { id: 'mt', label: T(l, 'Déduction REER ou CELIAPP', 'RRSP or FHSA deduction'), def: 5000, unit: '$', max: 1000000 }, { kind: 'select', id: 'en', label: T(l, 'Enfants de moins de 18 ans', 'Children under 18'), def: '2', options: ['1', '2', '3', '4'].map((x) => ({ value: x, label: x === '4' ? '4+' : x })) }, { id: 'ri', label: T(l, 'Votre revenu imposable', 'Your own taxable income'), def: 55000, unit: '$', max: 5000000, adv: true }],
    run: (v) => {
      const pr = s(v, 'pr') as Prov;
      const g = ccbGain(n(v, 'rf'), n(v, 'mt'), Number(v.en));
      const t = deductionSaving(n(v, 'ri'), n(v, 'mt'), pr);
      return {
        label: T(l, 'Gain total de la déduction', 'Total gain from the deduction'), value: money(g + t, l),
        sub: T(l, `Dont ${money(g, l)} d’allocation canadienne pour enfants en plus, de juillet ${YEAR + 1} à juin ${YEAR + 2}.`, `Of which ${money(g, l)} more Canada child benefit, July ${YEAR + 1} to June ${YEAR + 2}.`),
        rows: [[T(l, 'Baisse d’impôt', 'Tax saved'), money(t, l), t], [T(l, 'Allocation pour enfants en plus', 'Extra child benefit'), money(g, l), g], [T(l, 'Taux effectif de la déduction', 'Effective rate of the deduction'), pct(n(v, 'mt') > 0 ? (g + t) / n(v, 'mt') : 0, l)]],
        note: T(l, `Seuils et taux de réduction de la période ${P.benefits.ccb.period[l]} : ceux de l’année suivante seront indexés. Au Québec, l’Allocation famille ajoute son propre calcul, non compté ici.`, `Thresholds and reduction rates for ${P.benefits.ccb.period[l]}; next year's will be indexed. In Quebec, the Family Allowance adds its own calculation, not counted here.`),
      };
    },
  }),

  /* SV et SRG à la retraite */
  sv: (l) => ({
    inputs: [provField(l, 'QC'), { id: 'rr', label: T(l, 'Revenu de retraite, hors retraits', 'Retirement income, before withdrawals'), def: 80000, unit: '$', max: 5000000 }, { id: 'mt', label: T(l, 'Retrait REER ou FERR de l’année', 'RRSP or RRIF withdrawal this year'), def: 25000, unit: '$', max: 5000000 }],
    run: (v) => {
      const pr = s(v, 'pr') as Prov, rr = n(v, 'rr'), mt = n(v, 'mt');
      const claw = oasRecovery(rr + mt) - oasRecovery(rr);
      const t = withdrawalTax(rr, mt, pr);
      return {
        label: T(l, 'Coût réel du retrait', 'Real cost of the withdrawal'), value: money(t + claw, l),
        sub: rr + mt > P.benefits.oas.threshold['2026'] ? T(l, `Revenu au-dessus de ${money(P.benefits.oas.threshold['2026'], l)} : la pension de la SV se rembourse à 15 %.`, `Income above ${money(P.benefits.oas.threshold['2026'], l)}: the OAS pension is clawed back at 15%.`) : rr < P.benefits.gis.singleMax ? T(l, 'Revenu dans la zone du SRG : le retrait réduirait aussi le Supplément, pas un retrait CELI.', 'Income in the GIS range: the withdrawal would also cut the Supplement, a TFSA withdrawal would not.') : T(l, 'Pas de récupération de la SV à ce revenu.', 'No OAS clawback at this income.'),
        rows: [[T(l, 'Impôt sur le retrait', 'Tax on the withdrawal'), money(t, l), t], [T(l, 'Récupération de la SV en plus', 'Extra OAS recovery'), money(claw, l), claw], [T(l, 'Taux effectif', 'Effective rate'), pct(mt > 0 ? (t + claw) / mt : 0, l)]],
        note: T(l, 'Seuil de récupération pour le revenu 2026 ; la récupération ne dépasse jamais la pension reçue.', 'Recovery threshold for 2026 income; the recovery never exceeds the pension received.'),
      };
    },
  }),

  /* REER de conjoint : règle des trois ans */
  conjoint: (l) => ({
    inputs: [{ kind: 'select', id: 'dc', label: T(l, 'Dernière cotisation au REER du conjoint', 'Last contribution to the spousal RRSP'), def: String(YEAR), options: yearOpts(2015, YEAR + 3) }, { kind: 'select', id: 'rt', label: T(l, 'Année du retrait prévu', 'Year of the planned withdrawal'), def: String(YEAR + 1), options: yearOpts(2015, YEAR + 8) }],
    run: (v) => {
      const free = spousalFreeYear(Number(v.dc)), rt = Number(v.rt);
      const att = rt < free;
      return {
        label: att ? T(l, 'Retrait imposé au cotisant', 'Withdrawal taxed to the contributor') : T(l, 'Retrait imposé au conjoint', 'Withdrawal taxed to the spouse'), value: String(free),
        sub: T(l, `Première année où le conjoint peut retirer sans que le montant revienne au cotisant : ${free}.`, `First year the spouse can withdraw without the amount coming back to the contributor: ${free}.`),
        rows: [[T(l, 'Année de la dernière cotisation', 'Year of last contribution'), String(Number(v.dc))], [T(l, 'Les deux années suivantes', 'The two following years'), T(l, `${Number(v.dc) + 1} et ${Number(v.dc) + 2}`, `${Number(v.dc) + 1} and ${Number(v.dc) + 2}`)], [T(l, 'Retrait prévu', 'Planned withdrawal'), String(rt)]],
      };
    },
  }),
};

export function getTool(kind: string, lang: Lang, arg?: Args): ToolSpec {
  const f = SPECS[kind];
  if (!f) throw new Error(`Unknown tool ${kind}`);
  const spec = f(lang, arg);
  if (arg) for (const i of spec.inputs) if (arg[i.id] !== undefined) (i as { def: number | string }).def = i.kind === 'choice' || i.kind === 'select' ? String(arg[i.id]) : Number(arg[i.id]);
  return spec;
}
export function runTool(kind: string, lang: Lang, args: V = {}) {
  const spec = getTool(kind, lang);
  const v: V = resolve(spec.inputs, { ...Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])), ...args });
  return spec.run(v);
}
export const TOOL_KINDS = Object.keys(SPECS);
export { tax, tfsaCumulative, tfsaLimit };
