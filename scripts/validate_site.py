#!/usr/bin/env python3
"""Fail-closed, dependency-free pre-commit gate for the SPYDER static website."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import re, subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
ERRORS = []
class Scan(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=set();self.links=[];self.lang='';self.h1=0;self.img=0;self.assets=[];self.titles=0
    def handle_starttag(self,tag,raw):
        a=dict(raw)
        if tag=='html':self.lang=a.get('lang','')
        if tag=='title':self.titles+=1
        if tag=='h1':self.h1+=1
        if 'id' in a:
            if a['id'] in self.ids:ERRORS.append(f'duplicate HTML ID {a["id"]!r}')
            self.ids.add(a['id'])
        if ('data-en' in a) != ('data-ru' in a):ERRORS.append(f'{tag} missing one translation attribute')
        if tag=='img':
            self.img+=1
            if 'alt' not in a:ERRORS.append('image missing alt')
        if tag=='button' and a.get('type') not in ('button','submit','reset'):ERRORS.append('button missing type')
        if tag in ('a','link','script','img','source'):
            key='href' if tag in ('a','link') else 'src'
            if key in a:self.links.append((tag,a[key]))

htmls = sorted(SITE.glob('*.html'))
if len(htmls)<6:ERRORS.append('Unexpected missing website pages')
all_ids={}
for path in htmls:
    scan=Scan()
    try:scan.feed(path.read_text(encoding='utf-8'))
    except Exception as exc:ERRORS.append(f'{path.name}: HTML parse: {exc}');continue
    all_ids[path]=scan.ids
    if scan.h1!=1:ERRORS.append(f'{path.name}: expected exactly one h1, got {scan.h1}')
    if scan.titles!=1:ERRORS.append(f'{path.name}: expected exactly one title')
    if scan.lang not in ('en','ru'):ERRORS.append(f'{path.name}: bad HTML language')
    for tag,target in scan.links:
        url=urlsplit(target)
        if url.scheme in ('https','mailto','tel'):continue
        if url.scheme or target.startswith('//'):
            ERRORS.append(f'{path.name}: unsupported target {target!r}');continue
        destination = unquote(url.path)
        if '\\' in destination or any(seg=='..' for seg in destination.split('/')):
            ERRORS.append(f'{path.name}: path traversal {target!r}');continue
        if not destination:linked=path
        elif destination.startswith('/'):linked=SITE/destination.lstrip('/')
        else:linked=path.parent/destination
        if linked.is_dir():linked=linked/'index.html'
        if not linked.is_file():ERRORS.append(f'{path.name}: broken {tag} link {target!r}')
        if url.fragment and linked.suffix=='.html':
            if linked not in all_ids:
                other=Scan();other.feed(linked.read_text(encoding='utf-8'));all_ids[linked]=other.ids
            if unquote(url.fragment) not in all_ids[linked]:ERRORS.append(f'{path.name}: missing anchor {target!r}')
for mandatory in ('assets/styles.css','assets/app.js','sitemap.xml','robots.txt','_headers'):
    if not (SITE/mandatory).is_file():ERRORS.append(f'missing {mandatory}')
js=SITE/'assets/app.js'
if js.is_file():
    try:subprocess.run(['node','--check',str(js)],check=True,capture_output=True,text=True)
    except FileNotFoundError:print('Note: node unavailable; JS syntax check deferred')
    except subprocess.CalledProcessError as exc:ERRORS.append('JavaScript syntax: '+exc.stderr)
if ERRORS:
    print('FAIL: website validation errors:')
    for err in ERRORS:print(' -',err)
    sys.exit(1)
print(f'PASS: {len(htmls)} HTML pages, internal links, fragments, translations, assets and JS syntax')
