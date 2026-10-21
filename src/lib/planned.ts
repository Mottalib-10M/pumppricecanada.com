/** Toutes les pages prévues (id = nom du fichier de src/content/guides). Les tests de contenu acceptent un lien
 *  vers ces ids pendant la rédaction ; le test « toutes les pages existent » échoue tant qu'il manque un fichier. */
export const PLANNED_GUIDES = [
  // Outils et sujets
  'tomorrow', 'forecast', 'diesel', 'taxes', 'cheapest',
  // Ontario
  'toronto', 'mississauga', 'brampton', 'oshawa', 'hamilton', 'kitchener', 'barrie', 'ottawa', 'london', 'windsor', 'st-catharines',
  // Québec
  'montreal', 'laval', 'quebec-city', 'gatineau', 'sherbrooke',
  // Ouest
  'vancouver', 'surrey', 'victoria', 'kelowna', 'calgary', 'edmonton', 'regina', 'saskatoon', 'winnipeg',
  // Atlantique
  'halifax', 'moncton', 'st-johns',
];
export const PLANNED_IDS = new Set<string>([...PLANNED_GUIDES, 'home', 'method', 'about', 'widget', 'contact', 'editorial', 'privacy', 'terms', 'cookies']);
