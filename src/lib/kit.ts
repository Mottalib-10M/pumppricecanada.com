/**
 * Trousse de rédaction (CONTRIBUTING-PAGES.md) : tout chiffre écrit dans une page vient d'ici, jamais tapé à la main.
 *   K.P                         params-2026.json
 *   K.tfsaLimit(y), K.tfsaCum(y), K.tfsaRoom({...}), K.tfsaStart(birth, arrival)
 *   K.rrspLimit(y), K.rrspIncomeForMax(y), K.rrspRoom({...}), K.rrspExcess(limit, contrib), K.withholding(amount, qc)
 *   K.fhsaRoom({...}), K.hbp(amount, year), K.llp(amount, year, lastStudy), K.spousalFree(year)
 *   K.tax(income, prov), K.taxDetail, K.marginal(income, prov), K.split(income, prov), K.saving(income, ded, prov)
 *   K.wtax(other, withdrawal, prov), K.steps(prov), K.compare({...}), K.ccbGain(afni, ded, kids), K.oas(net)
 *   K.PROVS, K.prov(code, lang), K.provIn(code)   noms des provinces
 *   K.tool(kind, lang, args)   lance un calculateur de tool-specs.ts et rend sa carte de résultat
 *   K.fr / K.en                formats de la langue : m (montant), p (taux), n (nombre), r (taux officiel), day (date)
 */
import P from '../data/params-2026.json';
import { runTool, provName, provIn } from './tool-specs';
import { formatMoney, formatNumber, formatPercent, formatRate, displayDate, type Lang } from './format';
import { PROVS, tax, taxDetail, marginalRate, marginalSplit, deductionSaving, withdrawalTax, rateSteps, jur } from './engine/tax';
import { tfsaLimit, tfsaCumulative, tfsaRoom, tfsaStartYear, rrspDollarLimit, rrspIncomeForMax, rrspRoom, rrspExcess, rrspWithholding, fhsaRoom, hbpPlan, llpPlan, spousalFreeYear, excessTax, YEAR } from './engine/accounts';
import { rrspVsTfsa, ccbGain, ccbReduction, oasRecovery, grossUp } from './engine/compare';

const fmt = (l: Lang) => ({
  m: (x: number) => `${x < -0.5 ? '-' : ''}${formatMoney(Math.abs(Math.round(x)), 0, l)}`,
  p: (x: number, d = 1) => formatPercent(x, d, l),
  n: (x: number) => formatNumber(x, 0, l),
  r: (x: number) => formatRate(x, l),
  day: (iso: string) => displayDate(iso, l === 'fr' ? 'fr-CA' : 'en-CA'),
});
export const KIT = {
  P, YEAR, PROVS, jur,
  tfsaLimit, tfsaCum: tfsaCumulative, tfsaRoom, tfsaStart: tfsaStartYear, excessTax,
  rrspLimit: rrspDollarLimit, rrspIncomeForMax, rrspRoom, rrspExcess, withholding: rrspWithholding,
  fhsaRoom, hbp: hbpPlan, llp: llpPlan, spousalFree: spousalFreeYear,
  tax, taxDetail, marginal: marginalRate, split: marginalSplit, saving: deductionSaving, wtax: withdrawalTax, steps: rateSteps,
  compare: rrspVsTfsa, grossUp, ccbGain, ccbReduction, oas: oasRecovery,
  prov: provName, provIn,
  tool: runTool,
  fr: fmt('fr'), en: fmt('en'), fmt,
};
export type Kit = typeof KIT;
