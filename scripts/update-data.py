#!/usr/bin/env python3
"""Relit les sources officielles et régénère src/data/series/*.json (CONTRIBUTING-DONNEES.md).

Usage : python3 scripts/update-data.py            (toutes les sources)
        python3 scripts/update-data.py --only statcan,ontario

Sources lues (aucune clé d'API, aucun site concurrent) :
  statcan   Statistique Canada, tableau 18-10-0001-01 (prix de détail mensuels), CSV complet zippé,
            Licence du gouvernement ouvert – Canada.
  ontario   Ontario, ministère de l'Énergie : « Fuels price survey information » (prix hebdomadaires de
            14 marchés) et « Wholesale fuel prices » (prix de gros quotidiens Toronto, Thunder Bay,
            Edmonton, port de New York), Licence du gouvernement ouvert – Ontario.
  regie     Régie de l'énergie du Québec : relevé quotidien des prix (rqe.pdf, essence ordinaire par
            région et sous-région) et prix minimaux à la rampe de Montréal (rampe.pdf). PDF lus avec
            pypdf ; les valeurs s'ajoutent à l'archive (une semaine par PDF).
  atlantic  Prix maximaux fixés par les régulateurs de la Nouvelle-Écosse (NSEB), du Nouveau-Brunswick (CESP)
            et de Terre-Neuve-et-Labrador (PUB) : chiffre en vigueur et date d'effet, ajoutés à l'archive.

Chaque fichier écrit porte la date de lecture, l'URL lue et la date de la dernière donnée. Une source
injoignable garde son fichier précédent (le site affiche alors la dernière date connue) et le script
se termine avec le code 0 si au moins une source a répondu, 1 sinon.
"""
import csv, datetime as dt, io, json, os, re, sys, urllib.request, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'data', 'series')
UA = {'User-Agent': 'Mozilla/5.0 (compatible; pump-price-canada data refresh; +https://pumppricecanada.com)'}
TODAY = dt.date.today().isoformat()

STATCAN_ZIP = 'https://www150.statcan.gc.ca/n1/tbl/csv/18100001-eng.zip'
ON_RETAIL = 'https://ontario.ca/v1/files/fuel-prices/fueltypesall.csv'
ON_RACK_GAS = 'https://ontario.ca/v1/files/fuel-prices/wholesalegasolineprices.csv'
ON_RACK_DIESEL = 'https://ontario.ca/v1/files/fuel-prices/wholesaledieselprices.csv'
REGIE_BASE = 'https://www.regie-energie.qc.ca/storage/app/media/consommateurs/informations-pratiques/prix-petrole/publications'
REGIE_RQE = REGIE_BASE + '/Publications-quotidiennes/releve-quotidien/rqe.pdf'
REGIE_RAMPE = REGIE_BASE + '/Publications-hebdomadaires/PMRC/rampe.pdf'

# Statistique Canada : géographie du tableau -> identifiant de série du site.
STATCAN_GEO = {
    'Canada': 'canada', "St. John's, Newfoundland and Labrador": 'st-johns',
    'Charlottetown and Summerside, Prince Edward Island': 'charlottetown', 'Halifax, Nova Scotia': 'halifax',
    'Saint John, New Brunswick': 'saint-john', 'Québec, Quebec': 'quebec', 'Montréal, Quebec': 'montreal',
    'Ottawa-Gatineau, Ontario part, Ontario/Quebec': 'ottawa', 'Toronto, Ontario': 'toronto',
    'Thunder Bay, Ontario': 'thunder-bay', 'Winnipeg, Manitoba': 'winnipeg', 'Regina, Saskatchewan': 'regina',
    'Saskatoon, Saskatchewan': 'saskatoon', 'Edmonton, Alberta': 'edmonton', 'Calgary, Alberta': 'calgary',
    'Vancouver, British Columbia': 'vancouver', 'Victoria, British Columbia': 'victoria',
    'Whitehorse, Yukon': 'whitehorse', 'Yellowknife, Northwest Territories': 'yellowknife',
}
STATCAN_FUEL = {
    'Regular unleaded gasoline at self service filling stations': 'regular',
    'Premium unleaded gasoline at self service filling stations': 'premium',
    'Diesel fuel at self service filling stations': 'diesel',
}
# Ontario : colonne du fichier -> identifiant de marché.
ON_MARKETS = {
    'Ottawa': 'ottawa', 'Toronto West/Ouest': 'toronto-west', 'Toronto East/Est': 'toronto-east', 'Windsor': 'windsor',
    'London': 'london', 'Peterborough': 'peterborough', "St. Catharine's": 'st-catharines', 'Sudbury': 'sudbury',
    'Sault Saint Marie': 'sault-ste-marie', 'Thunder Bay': 'thunder-bay', 'North Bay': 'north-bay', 'Timmins': 'timmins',
    'Kenora': 'kenora', 'Parry Sound': 'parry-sound', 'Ontario Average/Moyenne provinciale': 'ontario',
    "Southern Average/Moyenne du sud de l'Ontario": 'ontario-south', "Northern Average/Moyenne du nord de l'Ontario": 'ontario-north',
}
ON_FUEL = {'Regular Unleaded Gasoline': 'regular', 'Premium Gasoline': 'premium', 'Diesel': 'diesel'}
MONTHS_KEPT = 37          # trois ans et un mois de séries mensuelles
WEEKS_KEPT = 160          # environ trois ans de séries hebdomadaires (sert à mesurer l'écart de l'estimation)
DAYS_KEPT = 1200          # prix de gros quotidiens


def get(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as r:
        data = r.read()
    return data if binary else data.decode('utf-8-sig', errors='replace')


def write(name, payload):
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
        f.write('\n')
    print(f'  écrit {os.path.relpath(path, ROOT)}')


def load(name):
    path = os.path.join(OUT, name)
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else None


def num(s):
    s = (s or '').strip().replace(',', '.')
    try:
        v = float(s)
    except ValueError:
        return None
    return v if v > 0 else None


# --------------------------------------------------------------------------- Statistique Canada
def statcan():
    # STATCAN_ZIP_FILE : copie locale du même fichier officiel (le site de Statistique Canada sert parfois
    # une page « site indisponible » avec un code 200 ; on le détecte par la signature ZIP).
    local = os.environ.get('STATCAN_ZIP_FILE')
    raw = open(local, 'rb').read() if local else get(STATCAN_ZIP, binary=True)
    if raw[:2] != b'PK':
        raise ValueError('Statistique Canada a renvoyé une page HTML (site indisponible), fichier précédent gardé')
    z = zipfile.ZipFile(io.BytesIO(raw))
    rows = csv.DictReader(io.TextIOWrapper(z.open('18100001.csv'), encoding='utf-8-sig'))
    series = {}
    for r in rows:
        geo = STATCAN_GEO.get(r['GEO']); fuel = STATCAN_FUEL.get(r['Type of fuel'])
        v = num(r['VALUE'])
        if not geo or not fuel or v is None:
            continue
        series.setdefault(geo, {}).setdefault(fuel, {})[r['REF_DATE']] = v
    out = {}
    for geo, fuels in series.items():
        out[geo] = {f: [[m, s[m]] for m in sorted(s)[-MONTHS_KEPT:]] for f, s in fuels.items()}
    last = max(m for g in out.values() for s in g.values() for m, _ in s)
    write('statcan.json', {'source': 'statcan', 'url': STATCAN_ZIP, 'table': '18-10-0001-01',
                           'unit': 'cents per litre, taxes included', 'retrieved_at': TODAY, 'latest': last, 'series': out})


# --------------------------------------------------------------------------- Ontario
def ontario():
    text = get(ON_RETAIL)
    rows = list(csv.reader(io.StringIO(text)))
    hdr = rows[0]
    fcol = hdr.index('Fuel Type')
    series = {}
    for r in rows[1:]:
        if len(r) <= fcol or not re.match(r'\d{4}-\d{2}-\d{2}$', r[0].strip()):
            continue
        fuel = ON_FUEL.get(r[fcol].strip())
        if not fuel:
            continue
        for i, col in enumerate(hdr[1:fcol], 1):
            mk = ON_MARKETS.get(col.strip()); v = num(r[i])
            if mk and v is not None:
                series.setdefault(mk, {}).setdefault(fuel, {})[r[0].strip()] = v
    out = {mk: {f: [[d, s[d]] for d in sorted(s)[-WEEKS_KEPT:]] for f, s in fu.items()} for mk, fu in series.items()}
    last = max(d for g in out.values() for s in g.values() for d, _ in s)
    write('ontario-retail.json', {'source': 'ontario', 'url': ON_RETAIL, 'unit': 'cents per litre, taxes included',
                                  'retrieved_at': TODAY, 'latest': last, 'series': out})
    racks = {}
    for fuel, url in (('regular', ON_RACK_GAS), ('diesel', ON_RACK_DIESEL)):
        rows = list(csv.reader(io.StringIO(get(url))))
        cols = {'toronto': 1, 'nyh': 2, 'thunder-bay': 4, 'edmonton': 5}
        for name, ci in cols.items():
            s = {}
            for r in rows[1:]:
                if len(r) > ci and re.match(r'\d{4}-\d{2}-\d{2}$', r[0].strip()):
                    v = num(r[ci])
                    if v is not None:
                        s[r[0].strip()] = v
            racks.setdefault(name, {})[fuel] = [[d, s[d]] for d in sorted(s)[-DAYS_KEPT:]]
    last = max(d for g in racks.values() for s in g.values() for d, _ in s)
    write('ontario-rack.json', {'source': 'ontario-rack', 'url': [ON_RACK_GAS, ON_RACK_DIESEL],
                                'unit': 'cents per litre, before taxes', 'retrieved_at': TODAY, 'latest': last, 'series': racks})


# --------------------------------------------------------------------------- Régie de l'énergie
MOIS = {'janvier': 1, 'février': 2, 'fevrier': 2, 'mars': 3, 'avril': 4, 'mai': 5, 'juin': 6, 'juillet': 7,
        'août': 8, 'aout': 8, 'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12, 'decembre': 12}
# Lignes du relevé quotidien retenues -> identifiant de zone du site.
REGIE_ROWS = {
    '6. Montréal': 'montreal', '13. Laval': 'laval', '3. Capitale-Nationale': 'capitale-nationale',
    'Gatineau (00-15 km de l\'Ontario)': 'gatineau', 'Sherbrooke (Brompton, Fleurimont, Lennoxville)': 'sherbrooke',
    'Trois-Rivières': 'trois-rivieres', 'Saguenay (Chicoutimi & La Baie)': 'saguenay', '7. Outaouais': 'outaouais',
    '5. Estrie': 'estrie', 'Province (moyenne pondérée)': 'quebec-province',
    'Québec (Les Rivières)': 'quebec-ville', 'Agglomération de Longueuil (Longueuil (Le Vieux-Longueuil))': 'longueuil',
    'Lévis (Desjardins)': 'levis', 'MRC Drummond': 'drummondville',
}


def pdf_text(url):
    from pypdf import PdfReader  # pip install pypdf (workflow)
    r = PdfReader(io.BytesIO(get(url, binary=True)))
    return '\n'.join(p.extract_text() for p in r.pages)


def week_dates(text):
    m = re.search(r'Semaine du (\d{1,2})(?:er)? (?:(\w+) )?au (\d{1,2}) (\w+) (\d{4})', text)
    if not m:
        raise ValueError('semaine introuvable dans rqe.pdf')
    d1, m1, d2, m2, y = m.groups()
    month_end = MOIS[m2.lower()]; month_start = MOIS[m1.lower()] if m1 else month_end
    y = int(y); start = dt.date(y if month_start <= month_end else y - 1, month_start, int(d1))
    return [start + dt.timedelta(days=i) for i in range(5)]


def parse_rqe(text):
    days = week_dates(text)
    found = {}
    for line in text.splitlines():
        line = line.strip()
        for label, zid in REGIE_ROWS.items():
            if line.startswith(label + ' ') or line.startswith(label + '\t'):
                vals = [float(x.replace(',', '.')) for x in re.findall(r'\d{3},\d', line[len(label):])]
                if len(vals) >= 2:            # au moins un jour + la moyenne
                    daily = vals[:-1]
                    found[zid] = {days[i].isoformat(): v for i, v in enumerate(daily)}
    if 'quebec-province' not in found:
        raise ValueError('moyenne provinciale introuvable dans rqe.pdf')
    return found


def parse_rampe(text):
    out = {'regular': {}, 'premium': {}, 'diesel': {}}
    for d, a, b, c in re.findall(r'(\d{4}-\d{2}-\d{2}) (\d{2,3},\d{2}) (\d{2,3},\d{2}) (\d{2,3},\d{2})', text):
        out['regular'][d] = float(a.replace(',', '.')); out['premium'][d] = float(b.replace(',', '.')); out['diesel'][d] = float(c.replace(',', '.'))
    if not out['regular']:
        raise ValueError('aucun prix dans rampe.pdf')
    return out


def merge(old, new, keep):
    s = {d: v for d, v in (old or [])}
    s.update(new)
    return [[d, s[d]] for d in sorted(s)[-keep:]]


REGIE_CSV = ('https://www.regie-energie.qc.ca/storage/app/media/consommateurs/informations-pratiques/prix-petrole/Tableaux/'
             'versions-telechargeables/region-administrative/ordinaire/prix-moyen-quotidien/ordinaire_moyen_reg_quot{year}.csv')


def regie_history(years):
    """Historique quotidien par région administrative (CSV de la Régie, mis à jour une fois par mois) : sert de
    signal de marché à l'estimation et à la mesure de son écart. Jamais affiché tel quel."""
    out = {}
    for y in years:
        try:
            rows = list(csv.reader(io.StringIO(get(REGIE_CSV.format(year=y))), delimiter=';'))
        except Exception as e:
            print(f'  historique {y} indisponible : {e}', file=sys.stderr)
            continue
        hdr = hi = None
        for r in rows:
            if 'Régions' in r:
                hdr, hi = r, r.index('Régions'); continue
            if hdr is None:
                continue
            for i, x in enumerate(r):
                zid = REGIE_ROWS.get(x.strip())
                if not zid or not re.match(r'^\d+\. ', x.strip()):
                    continue
                off = i - hi
                for j, h in enumerate(hdr):
                    if re.match(r'^\d{4}-\d{2}-\d{2}$', h) and 0 <= j + off < len(r):
                        v = num(r[j + off])
                        if v:
                            out.setdefault(zid, {})[h] = v
    return out


def regie():
    prev = load('regie-retail.json') or {'series': {}}
    zones = parse_rqe(pdf_text(REGIE_RQE))
    y = dt.date.today().year
    for zid, vals in regie_history([y - 2, y - 1, y]).items():
        zones[zid] = {**vals, **zones.get(zid, {})}
    series = {z: merge(prev['series'].get(z), zones.get(z, {}), DAYS_KEPT) for z in set(prev['series']) | set(zones)}
    last = max(d for s in series.values() for d, _ in s)
    write('regie-retail.json', {'source': 'regie', 'url': REGIE_RQE, 'fuel': 'regular', 'unit': 'cents per litre, taxes included',
                                'retrieved_at': TODAY, 'latest': last, 'series': series})
    prevr = load('regie-rack.json') or {'series': {}}
    rack = parse_rampe(pdf_text(REGIE_RAMPE))
    rs = {f: merge(prevr['series'].get(f), rack[f], DAYS_KEPT) for f in rack}
    last = max(d for s in rs.values() for d, _ in s)
    write('regie-rack.json', {'source': 'regie-rack', 'url': REGIE_RAMPE, 'unit': 'cents per litre, before taxes (Montréal loading rack minimum)',
                              'retrieved_at': TODAY, 'latest': last, 'series': rs})


# --------------------------------------------------------------------------- Consommation des véhicules
NRCAN_FCR = ('https://open.canada.ca/data/dataset/98f1a129-f628-4ce4-b24d-6f16bf24dd64/resource/'
             '9df1b18d-d036-4783-a61c-99f1f75b3ac5/download/my2026-fuel-consumption-ratings.csv')
FCR_CLASSES = {  # classe du fichier -> catégorie du site
    'Compact': 'compact', 'Mid-size': 'midsize', 'Full-size': 'fullsize',
    'Sport utility vehicle: Small': 'suv-small', 'Sport utility vehicle: Standard': 'suv-standard',
    'Pickup truck: Small': 'pickup-small', 'Pickup truck: Standard': 'pickup-standard', 'Minivan': 'minivan',
}


def vehicles():
    """Médiane de la consommation combinée (L/100 km) des modèles 2026 par catégorie, essence ordinaire (X)
    et diesel (D), tirée des cotes de consommation de carburant de RNCan (Licence du gouvernement ouvert)."""
    import statistics
    rows = csv.DictReader(io.StringIO(get(NRCAN_FCR)))
    cats = {}
    n = 0
    for r in rows:
        cat = FCR_CLASSES.get((r.get('Vehicle class') or '').strip()); fuel = (r.get('Fuel type') or '').strip()
        v = num(r.get('Combined (L/100 km)'))
        if not cat or v is None or fuel not in ('X', 'Z', 'D'):
            continue
        n += 1
        cats.setdefault(cat, {}).setdefault('diesel' if fuel == 'D' else 'gasoline', []).append(v)
    out = {c: {f: {'median': round(statistics.median(xs), 1), 'models': len(xs)} for f, xs in fu.items()} for c, fu in cats.items()}
    if n < 100:
        raise ValueError('fichier des cotes trop court')
    write('vehicles.json', {'source': 'nrcan-fcr', 'url': NRCAN_FCR, 'model_year': 2026, 'unit': 'L/100 km combined',
                            'retrieved_at': TODAY, 'latest': '2026', 'categories': out})

# --------------------------------------------------------------------------- Atlantique : prix maximaux réglementés
# Nouvelle-Écosse, Nouveau-Brunswick et Terre-Neuve-et-Labrador fixent par ordonnance le prix MAXIMAL à la pompe
# (libre-service, taxes comprises). Ce sont des décisions publiques datées : on reprend le chiffre en vigueur de la
# zone de la ville, avec sa date d'effet et la source, et on l'ajoute à l'archive (aucun tableau reproduit).
ATLANTIC = {
    'ns-zone1': {'url': 'https://nserbt.ca/nseb/mandates/gasoline-diesel-pricing/gasoline-diesel-prices-zone-map'},
    'nb': {'url': 'https://nbeub.ca/current-petroleum-prices-2'},
    'nl-zone1': {'url': 'http://www.pub.nl.ca/PP_petroleumproducts.php'},
}
MONTHS_EN = {m: i + 1 for i, m in enumerate(['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
                                              'september', 'october', 'november', 'december'])}


def html_text(raw):
    import html as _h
    t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', raw, flags=re.S | re.I)
    return re.sub(r'\s+', ' ', _h.unescape(re.sub(r'<[^>]+>', ' ', t)))


def en_date(m):
    return dt.date(int(m.group(3)), MONTHS_EN[m.group(1).lower()], int(m.group(2))).isoformat()


def parse_ns(t):
    d = re.search(r'As at: \w+, (\w+) (\d{1,2}), (\d{4})', t)
    z = re.search(r'Zone 1 cents/litre Regular Unleaded Self-Service Min ([\d.]+) Max ([\d.]+) Ultra-Low Sulfur Diesel Self-Service Min ([\d.]+) Max ([\d.]+)', t)
    if not d or not z:
        raise ValueError('page NSEB illisible')
    return en_date(d), {'regular': float(z.group(2)), 'diesel': float(z.group(4))}


def parse_nb(t):
    d = re.search(r'commencing 12:01 a\.m\., \w+,? (\w+) (\d{1,2}),? (\d{4})', t)
    r = re.search(r'Regular Gasoline Self-serve ([\d.]+)', t)
    p = re.search(r'Premium Gasoline Self-serve ([\d.]+)', t)
    di = re.search(r'Ultra-low Sulphur Diesel Self-serve ([\d.]+)', t)
    if not r or not di:
        raise ValueError('page CESP N.-B. illisible')
    out = {'regular': float(r.group(1)), 'diesel': float(di.group(1))}
    if p:
        out['premium'] = float(p.group(1))
    return (en_date(d) if d else None), out


def parse_nl(t):
    d = re.search(r'Base Zone: (\w+) (\d{1,2}), (\d{4})', t)
    r = re.search(r'Reg Self-Serve Base Zone - 1 ([\d.]+)', t)
    di = re.search(r'Diesel Base Zone - 1 ([\d.]+)', t)
    if not d or not r or not di:
        raise ValueError('page PUB T.-N.-L. illisible')
    return en_date(d), {'regular': float(r.group(1)), 'diesel': float(di.group(1))}


def nb_effective():
    """Date d'effet du barème du N.-B. : écrite dans le PDF officiel (« in effect commencing 12:01 a.m., Friday … »)."""
    import pypdf
    raw = get('https://nbeub.ca/images/documents/petroleum_pricing/currentmaximumpriceenglish.pdf', binary=True)
    t = re.sub(r'\s+', ' ', ' '.join(pg.extract_text() or '' for pg in pypdf.PdfReader(io.BytesIO(raw)).pages))
    m = re.search(r'commencing 12:01 a\.m\.,? \w+,? (\w+) (\d{1,2}),? (\d{4})', t)
    return en_date(m) if m else None


def atlantic():
    prev = load('atlantic.json') or {'series': {}}
    series = {k: dict(v) for k, v in prev['series'].items()}
    ok = 0
    for key, parse in (('ns-zone1', parse_ns), ('nb', parse_nb), ('nl-zone1', parse_nl)):
        try:
            date, vals = parse(html_text(get(ATLANTIC[key]['url'])))
            if date is None and key == 'nb':
                date = nb_effective()
            if not date:
                raise ValueError('date d\'effet introuvable')
            cur = series.setdefault(key, {})
            for fuel, v in vals.items():
                cur[fuel] = merge(cur.get(fuel), {date: v}, WEEKS_KEPT * 3)
            ok += 1
            print(f'  {key} : {date} {vals}')
        except Exception as e:
            print(f'  ÉCHEC {key} : {e}', file=sys.stderr)
    if not ok:
        raise ValueError('aucun régulateur joignable')
    last = max(d for s in series.values() for f in s.values() for d, _ in f)
    write('atlantic.json', {'source': 'atlantic', 'url': {k: v['url'] for k, v in ATLANTIC.items()},
                            'unit': 'cents per litre, self-serve MAXIMUM price set by the regulator, taxes included',
                            'retrieved_at': TODAY, 'latest': last, 'series': series})


SOURCES = {'statcan': statcan, 'ontario': ontario, 'regie': regie, 'atlantic': atlantic, 'vehicles': vehicles}

if __name__ == '__main__':
    only = None
    if '--only' in sys.argv:
        only = sys.argv[sys.argv.index('--only') + 1].split(',')
    ok = 0
    for name, fn in SOURCES.items():
        if only and name not in only:
            continue
        print(f'{name} :')
        try:
            fn(); ok += 1
        except Exception as e:  # une source en panne ne bloque pas les autres
            print(f'  ÉCHEC {name} : {e}', file=sys.stderr)
    sys.exit(0 if ok else 1)
