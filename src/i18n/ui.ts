import type { Locale } from './routes';
const fr = {
  updatedOn: 'Données relues le', editorialPolicy: 'Politique éditoriale', contactLabel: 'Contact', reviewedBy: 'Préparé par',
  skipToContent: 'Aller au contenu', mainNav: 'Navigation principale', breadcrumbLabel: 'Fil d’Ariane', breadcrumbHome: 'Accueil', menuOpen: 'Ouvrir le menu',
  faqTitle: 'Questions fréquentes', relatedCalculators: 'Pour aller plus loin', sourcesTitle: 'Sources officielles de cette page', writtenBy: 'Préparé par',
  asOf: 'Prix', lastUpdated: 'dernière lecture des sources officielles le', footerValidated: 'Sources : Statistique Canada, gouvernement de l’Ontario, Régie de l’énergie du Québec, régulateurs de l’Atlantique, Finances Canada',
  footerBrowser: 'Tous les calculs se font dans votre navigateur · aucun compte, aucun courriel, aucune station mise en avant',
  footerDisclaimer: 'Site indépendant publié par Radif Partners. Sans lien avec un gouvernement, un régulateur, une pétrolière ou une chaîne de stations. Moyennes officielles et estimations à titre d’information : le prix affiché à la pompe peut différer.',
  footerPopular: 'Prix de l’essence par ville',
  notFound: 'Aucune page à cette adresse. La page d’accueil donne le prix officiel du jour dans votre ville, l’estimation pour demain et le coût d’un plein.',
  readMore: 'Lire la réponse complète',
  estimate: 'Moyennes officielles datées ; l’estimation du lendemain suit la méthode publiée et son écart passé est affiché. Information générale : le prix affiché à la station peut différer.',
  moreOptions: 'Plus d’options', copyLink: 'Copier le lien', copied: 'Lien copié', print: 'Imprimer', howComputed: 'Comment c’est calculé', openFull: 'Ouvrir le simulateur complet',
};
const en: typeof fr = {
  updatedOn: 'Data read on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Prepared by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Common questions', relatedCalculators: 'Keep going', sourcesTitle: 'Official sources for this page', writtenBy: 'Prepared by',
  asOf: 'Prices', lastUpdated: 'official sources last read on', footerValidated: 'Sources: Statistics Canada, Government of Ontario, Régie de l’énergie du Québec, Atlantic regulators, Finance Canada',
  footerBrowser: 'Every figure is computed in your browser · no account, no email, no station promoted',
  footerDisclaimer: 'Independent site published by Radif Partners. Not affiliated with any government, regulator, oil company or station chain. Official averages and estimates for information: the price posted at the pump can differ.',
  footerPopular: 'Gas prices by city',
  notFound: 'Nothing lives at this address. The home page gives today’s official price in your city, the estimate for tomorrow and the cost of a fill-up.',
  readMore: 'Read the full answer',
  estimate: 'Dated official averages; the estimate for tomorrow follows the published method and its past error is shown. General information: the price posted at the station can differ.',
  moreOptions: 'More options', copyLink: 'Copy share link', copied: 'Link copied', print: 'Print', howComputed: 'How this is computed', openFull: 'Open the full calculator',
};
export function t(lang: Locale) { return lang === 'en' ? en : fr; }
