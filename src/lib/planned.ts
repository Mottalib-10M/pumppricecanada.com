/** Toutes les pages prévues (id = nom du fichier de src/content/guides). Les tests de contenu
 *  acceptent un lien vers ces ids pendant la rédaction ; le test « toutes les pages existent »
 *  échoue tant qu'il manque un fichier. */
export const PLANNED_GUIDES = [
  // CELI
  'droits-celi', 'plafond-celi', 'celi-nouvel-arrivant', 'excedent-celi', 'retrait-celi', 'celi-non-resident',
  // REER
  'reer-ou-celi', 'plafond-reer', 'remboursement-reer', 'date-limite-reer', 'excedent-reer', 'retrait-reer', 'reer-conjoint', 'reer-sv-srg',
  // Maison et études
  'celiapp', 'celiapp-ou-rap', 'rap', 'reep',
  // Impôt et prestations
  'taux-marginal', 'reer-allocation-enfants',
  // Provinces et territoires
  'prov-qc', 'prov-on', 'prov-bc', 'prov-ab', 'prov-mb', 'prov-sk', 'prov-ns', 'prov-nb', 'prov-nl', 'prov-pe', 'prov-yt', 'prov-nt', 'prov-nu',
];
export const PLANNED_IDS = new Set<string>([...PLANNED_GUIDES, 'home', 'method', 'about', 'widget', 'contact', 'editorial', 'privacy', 'terms', 'cookies']);
