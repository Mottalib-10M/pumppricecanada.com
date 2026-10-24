/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://pumppricecanada.com";
export const SITE_NAMES: Record<string, string> = {"en": "Pump Price Canada", "fr": "Prix à la pompe Canada"};
export const LANG_TAGS: Record<string, string> = {"en": "en-CA", "fr": "fr-CA"};
export const OG_LOCALES: Record<string, string> = {"en": "en_CA", "fr": "fr_CA"};
export const LOCALE_TAG = 'en-CA';
export const CURRENCY = 'CAD';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-24';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"en": "Independent publisher of Canadian pump-price estimates built on Statistics Canada, Ontario and Régie de l'énergie price series and on federal and provincial fuel tax rates", "fr": "Éditeur indépendant d'estimations du prix à la pompe au Canada, construites sur les séries de Statistique Canada, de l'Ontario et de la Régie de l'énergie et sur les taxes fédérales et provinciales sur les carburants"};
export const AUTHOR_DESC: Record<string, string> = {"en": "Radif Partners starts every city figure from the latest published official average, then moves it with the wholesale (rack) prices published by Ontario and, in eastern Canada, with the Régie de l'énergie's daily survey once its taxes are removed, to give an estimate for tomorrow, with the error measured over the past weeks printed next to it. Taxes are rebuilt line by line from the federal excise schedule and each province's fuel tax act. Nothing is sold, no station is promoted and no e-mail is asked for.", "fr": "Radif Partners part, pour chaque ville, de la dernière moyenne officielle publiée, puis la fait varier avec le prix de gros (prix à la rampe) publié par l'Ontario et, dans l'Est, avec le relevé quotidien de la Régie de l'énergie une fois ses taxes retirées, pour donner une estimation du lendemain, avec l'écart mesuré les semaines passées imprimé à côté. Les taxes sont recomposées ligne par ligne d'après la taxe d'accise fédérale et la loi de chaque province. Rien n'est vendu, aucune station n'est mise en avant et aucun courriel n'est demandé."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"en": ["Retail gasoline prices in Canada", "Wholesale (rack) gasoline prices", "Federal fuel excise tax", "Provincial fuel taxes", "Diesel prices", "Fuel consumption ratings"], "fr": ["Prix de détail de l'essence au Canada", "Prix de gros (à la rampe) de l'essence", "Taxe d'accise fédérale sur les carburants", "Taxes provinciales sur les carburants", "Prix du diesel", "Cotes de consommation de carburant"]};
export const CONTACT_EMAIL = "contact@pumppricecanada.com";
export const THEME_COLOR = '#B42318';
export const LOGO_SYMBOL = '¢';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = 'G-EXGHZ9ZVPY';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'z260j2thiv';
export const INDEXNOW_KEY = 'cc98662d72954a8f985ba538ef744b5d';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',  // vide : comme sur les autres sites du portefeuille
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "TVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
