import type { Locale } from './routes';
const fr = {
  updatedOn: 'Plafonds vérifiés le', editorialPolicy: 'Politique éditoriale', contactLabel: 'Contact', reviewedBy: 'Préparé par',
  skipToContent: 'Aller au contenu', mainNav: 'Navigation principale', breadcrumbLabel: 'Fil d’Ariane', breadcrumbHome: 'Accueil', menuOpen: 'Ouvrir le menu',
  faqTitle: 'Questions fréquentes', relatedCalculators: 'Pour aller plus loin', sourcesTitle: 'Sources officielles de cette page', writtenBy: 'Préparé par',
  asOf: 'Année d’imposition', lastUpdated: 'Mis à jour, plafonds et barèmes relus le', footerValidated: 'Sources : canada.ca (plafonds CELI, REER et CELIAPP, pages du CELI, guide T4127, taux d’impôt 2026), budgets provinciaux',
  footerBrowser: 'Tous les calculs se font dans votre navigateur · aucun nom, aucun courriel, aucun produit à vendre',
  footerDisclaimer: 'Site indépendant publié par Radif Partners. Sans lien avec l’Agence du revenu du Canada, Revenu Québec, un gouvernement, une banque ou un assureur. Estimations à titre d’information, pas un conseil fiscal ni financier.',
  footerPopular: 'REER ou CELI par province',
  notFound: 'Aucune page à cette adresse. Le bilan de la page d’accueil donne vos droits CELI, REER et CELIAPP de 2026 et le remboursement d’un REER dans votre province.',
  readMore: 'Lire la réponse complète',
  estimate: 'Les plafonds reprennent les chiffres publiés sur canada.ca ; les impôts sont estimés avec les tranches 2026 et le montant personnel de base. Vos droits exacts figurent dans votre avis de cotisation et dans Mon dossier. Information générale, pas un conseil fiscal ni financier.',
  moreOptions: 'Plus d’options', copyLink: 'Copier le lien', copied: 'Lien copié', print: 'Imprimer', howComputed: 'Comment c’est calculé', openFull: 'Ouvrir le simulateur complet',
};
const en: typeof fr = {
  updatedOn: 'Limits checked on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Prepared by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Common questions', relatedCalculators: 'Keep going', sourcesTitle: 'Official sources for this page', writtenBy: 'Prepared by',
  asOf: 'Tax year', lastUpdated: 'Last updated, limits and tax tables read on', footerValidated: 'Sources: canada.ca (TFSA, RRSP and FHSA limits, pages du CELI, guide T4127, 2026 tax rates), provincial budgets',
  footerBrowser: 'Every figure is computed in your browser · no name, no email, nothing for sale',
  footerDisclaimer: 'Independent site published by Radif Partners. Not affiliated with the Canada Revenue Agency, Revenu Québec, any government, bank or insurer. Estimates only, for information: not financial advice.',
  footerPopular: 'RRSP or TFSA by province',
  notFound: 'Nothing lives at this address. The check on the home page gives your 2026 TFSA, RRSP and FHSA room and the RRSP refund in your province.',
  readMore: 'Read the full answer',
  estimate: 'Limits reproduce the figures published on canada.ca; taxes are estimated with the 2026 brackets and the basic personal amount. Your exact room is on your notice of assessment and in My Account. General information, not financial advice: it does not replace your notice of assessment or a tax professional.',
  moreOptions: 'More options', copyLink: 'Copy share link', copied: 'Link copied', print: 'Print', howComputed: 'How this is computed', openFull: 'Open the full calculator',
};
export function t(lang: Locale) { return lang === 'en' ? en : fr; }
