#!/usr/bin/env python3
"""Similarity of the content files before any build, with the measure of check-unique.py (difflib on the
first 12,000 characters, numbers neutralized). Reads .cache-raw/page-texts.json written by tests/pages.test.ts.
Usage: python3 scripts/sim-pages.py [--seuil 26] [--only state:florida,...]"""
import json, re, sys, difflib, itertools
seuil = float(sys.argv[sys.argv.index('--seuil') + 1]) if '--seuil' in sys.argv else 26.0
only = sys.argv[sys.argv.index('--only') + 1].split(',') if '--only' in sys.argv else []
NUM = re.compile(r'[\d][\d\s.,\'’%€$£-]*')
T = {k: re.sub(r'\s+', ' ', NUM.sub('#', v['text'])).lower() for k, v in json.load(open('.cache-raw/page-texts.json')).items()}
bad = []
for a, b in itertools.combinations(sorted(T), 2):
    if only and a not in only and b not in only: continue
    ta, tb = T[a], T[b]
    sa, sb = set(ta.split()), set(tb.split())
    if len(sa & sb) / max(len(sa | sb), 1) < 0.2: continue
    sm = difflib.SequenceMatcher(None, ta[:12000], tb[:12000])
    if sm.real_quick_ratio() * 100 < seuil or sm.quick_ratio() * 100 < seuil: continue
    r = sm.ratio() * 100
    if r > seuil: bad.append((r, a, b))
for r, a, b in sorted(bad, reverse=True)[:40]: print(f'{r:5.1f} %  {a}  ~  {b}')
print(f'{len(T)} pages, {len(bad)} pairs above {seuil:.0f} %')
sys.exit(1 if bad else 0)
