"""Reproduce R72 from the seven original FSSAI PDFs in the supplied directory.

Usage: python build_ctr_toxin_gazette_r72_20261117.py SOURCE_DIRECTORY
Requires pdfplumber. Downloads are intentionally outside this script. Original
source cells are extracted before comparison with the immutable core snapshot.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
CORE_PATH = 'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'
raw = (ROOT / CORE_PATH).read_bytes()
core = json.loads(raw)
assert hashlib.sha256(raw).hexdigest() == 'acc284f0e99407cc133983b551a6dff533fccd731b559ecf4340ce4f6de2e2f8'
specs = {
 'nots2015': ('Gazette_Notification_Crop_Contaminants_Natural_Toxic.pdf', '2015-11-04', '2015-11-04', [4]),
 'hcn2017': ('Gazette_Notification_Second_Amendment_FSS_Contaminants_01_08_2017.pdf', '2017-07-21', '2017-07-25', [4]),
 'fish2016': ('Gazette_Notification_Biotoxins_Limits.pdf', '2016-01-04', '2016-01-06', [4]),
 'melamine2016': ('Gazette_Notification_Melamine_Milk.pdf', '2016-01-05', '2016-01-06', [3]),
 'melamineCorrigendum': ('Corrigenda_Amendment_Melamine_09_05_2016.pdf', '2016-03-31', '2016-04-04', [1]),
 'histamine2017': ('Gazette_Notificaton_Histamine_Level_25_01_2017.pdf', '2017-01-18', '2017-01-20', [12,13]),
 'ctr2026': ('272840.pdf', '2026-05-14', '2026-05-19', [5]),
}
sources = {}
for key,(filename,notice,issue,pages) in specs.items():
 b = (SOURCE/filename).read_bytes()
 assert b.startswith(b'%PDF')
 sources[key] = dict(url='https://fssai.gov.in/upload/uploadfiles/files/'+filename,
   sha256=hashlib.sha256(b).hexdigest(),bytes=len(b),notificationDate=notice,
   gazetteIssueDate=issue,visuallyCheckedPdfPages=pages)
sources['histamine2017']['effectiveFrom'] = '2017-07-01'
sources['ctr2026']['effectiveFrom'] = '2026-12-01'

def tables(key,page):
 with pdfplumber.open(SOURCE/specs[key][0]) as pdf:
  return pdf.pages[page-1].extract_tables()
def clean(s): return re.sub(r'\s+', ' ', s or '').strip().strip('“” .')
def norm(s): return re.sub(r'\s+', '', s).lower()
def entry(layer,index,source,page,**kw):
 return dict(layer=layer,coreIndex=index,sourceId=source,sourcePdfPage=page,
   numericRuleChanged=False,automaticProductApplication=False,**kw)

nots=[];group='';indices={}
for r in tables('nots2015',4)[0][2:]:
 if r[1]:group=clean(r[1]).lower().replace(' ','_')
 index=indices.get(group,0);indices[group]=index+1
 original=clean(r[2]);row=core['naturally_occurring_toxic_substances'][group][index]
 # The sole non-whitespace article normalization is explicitly retained.
 assert original==row['article'] or (group=='hydrocyanic_acid' and index==0 and
   original=='Nougat, marzipan or its substitutes or similar products' and
   row['article']=='Nougat, marzipan or substitutes/similar products')
 limit=float(re.match(r'\d+(?:\.\d+)?',r[3])[0]);assert limit==row['limit']
 nots.append(entry('nots',index,'nots2015',4,group=group,originalArticle=original,
   storedArticle=row['article'],originalLimit=limit,originalUnit='ppm'))
r=next(t for t in tables('hcn2017',4) if t[0][0]=='Article of food')[-1]
row=core['naturally_occurring_toxic_substances']['hydrocyanic_acid'][5]
assert clean(r[0])==row['article'] and clean(r[1])=='10'
nots.append(entry('nots',5,'hcn2017',4,group='hydrocyanic_acid',originalArticle=clean(r[0]),
 storedArticle=row['article'],originalLimit=10,originalUnit='ppm',printedPageLabel='3'))

fish=[];bio=[]
ft,bt=tables('fish2016',4)
for start in [2,4,6]:
 r=ft[start];tail=ft[start+1]
 contaminant=clean((r[1] or '')+' '+(tail[1] or ''))
 article=clean((r[2] or '')+' '+(tail[2] or ''))
 token=clean(r[3]);limit,unit=token.split()[:2]
 row=core['fish_pcb_pah']['rules'][len(fish)]
 assert norm(contaminant)==norm(row['contaminant']) and article==row['article']
 assert float(limit)==row['limit'] and unit==row['unit']
 fish.append(entry('fish_pcb_pah',len(fish),'fish2016',4,originalContaminant=contaminant,
  originalArticle=article,originalLimit=float(limit),originalUnit=unit))
for i,r in enumerate(bt[2:]):
 row=core['fish_biotoxins']['rows'][i]
 assert [clean(x).replace('µ','μ') for x in r[1:]]==[row['contaminant'],row['article_of_food'],row['limit_text']]
 bio.append(entry('fish_biotoxins',i,'fish2016',4,originalContaminant=clean(r[1]),
  originalArticle=clean(r[2]),originalLimitText=clean(r[3]),columnHeading='Limit (µg/kg)',
  rowUnitOverridesColumnHeading=True))

melamine=[]
for i,r in enumerate(tables('melamine2016',3)[0][2:]):
 row=core['other_contaminants']['melamine']['rows'][i]
 assert clean(r[2])==row['food'] and float(clean(r[3]))==float(row['maximum_level'])
 melamine.append(entry('melamine',i,'melamine2016',3,originalArticle=clean(r[2]),
  originalLimit=float(clean(r[3])),originalUnit='mg/kg',originalClause='2.4.1',
  correctedClause='2.5.1',corrigendumSourceId='melamineCorrigendum'))
with pdfplumber.open(SOURCE/specs['melamineCorrigendum'][0]) as pdf:
 correction=clean(pdf.pages[0].extract_text())
assert 'for “2.4” read “2.5.”' in correction and 'for “2.4.1” read “2.5.1.”' in correction

species=[];family=''
stored=[(f['family'],r['scientific_name'],r['common_name']) for f in
 core['other_contaminants']['histamine']['potential_histamine_species_families'] for r in f['species']]
for page in [10,11,12]:
 for r in tables('histamine2017',page)[0][1:]:
  if r[3]:family=clean(r[3])
  actual=(family,re.sub(r'\s+',' ',r[6]).strip(),re.sub(r'\s+',' ',r[9]).strip())
  assert tuple(map(norm,actual))==tuple(map(norm,stored[len(species)]))
  species.append(dict(coreFlatIndex=len(species),family=family,scientificName=actual[1],
   commonName=actual[2],sourceId='histamine2017',sourcePdfPage=page))

histamine=[];applicability=''
for page,table_index in [(12,1),(13,0)]:
 for r in tables('histamine2017',page)[table_index][1:]:
  serial=int(r[0].strip('.'));row=core['other_contaminants']['histamine']['product_limits'][serial-1]
  if r[2]:applicability=clean(r[2])
  plan=re.search(r'n\s*=\s*(\d+),\s*c\s*=\s*(\d+);\s*m\s*=\s*(\d+)\s*mg/kg,\s*M\s*=\s*(\d+)\s*mg/kg',clean(r[3]))
  assert plan
  n,c,m,M=map(int,plan.groups())
  assert [n,c,m,M]==[row['n'],row['c'],row['m_mg_per_kg'],row['M_mg_per_kg']]
  assert norm(clean(r[1]))==norm(row['product_category'])
  histamine.append(entry('histamine',serial-1,'histamine2017',page,serial=serial,
   originalArticle=clean(r[1]),n=n,c=c,m=m,M=M,originalUnit='mg/kg',
   originalApplicableToCell=clean(r[2]),requiredSpeciesScope=applicability,
   scopeBasis='Merged original cell spans rows 1–10.' if serial<=10 else
    'Continuation row has a blank applicability cell; no species exemption inferred. Explicit scope confirmation required.',
   storedApplicabilityPresent='applicable_to' in row,guardRequiresSpecies=True))

findings=[
 dict(id='histamine-merged-species',title='Histamine species condition spans processed products',detail='The original page 12 applicability cell spans rows 1–10, while the stored core attaches it only to row 1. Fish Pickle continues on page 13 with a blank cell; the draft conservatively requires explicit species/scope confirmation there too. No species exemption is inferred from a processed-product name.'),
 dict(id='histamine-sampling',title='Histamine needs all nine individual results',detail='The mean must not exceed m, no more than two results may exceed m, and none may exceed M. A mean alone or a single result cannot establish that the source sampling plan is satisfied.'),
 dict(id='fish-unit-basis',title='Fish contaminant units and analyte groups stay distinct',detail='PCB limits use ppm and the sum of six specified congeners; Benzo(a)pyrene in smoked fishery products uses ppb. Biotoxin row-specific units and toxin-equivalent expressions override the generic column heading; Brevetoxin mouse units are not silently converted to mass units.'),
 dict(id='melamine-corrigendum',title='Melamine clause numbering resolved by original corrigendum',detail='The 31 March 2016 corrigendum changes 2.4/2.4.1 to 2.5/2.5.1 and names the Second Amendment Regulations. Powdered infant formula, liquid infant formula and other foods retain distinct values; the broader other-foods value cannot replace an infant-formula value.'),
 dict(id='saffrole-future-scope',title='Saffrole replacement remains future until 1 December',detail='The 2026 notification replaces the whole serial-number-4 entry with an ingredient-qualified article. The existing six 2015 articles are not carried forward automatically or replaced early. The draft source comparison refuses assessment dates on or after 1 December pending reconciliation.'),
 dict(id='hcn-sago-insertion',title='Sago/cassava hydrocyanic-acid row has its own source',detail='The 21 July 2017 notification inserts a 10 ppm row for the named sago/flour articles and their products. It is separate from the five 5 ppm articles in the 2015 table; the higher value cannot be selected solely because a confectionery recipe contains starch.')
]
result=dict(schemaVersion=1,round=72,reviewedOn='2026-11-17',coreSnapshot=dict(path=CORE_PATH,sha256=hashlib.sha256(raw).hexdigest()),sources=sources,
 counts=dict(notsRows=len(nots),fishPcbPahRows=len(fish),biotoxinRows=len(bio),melamineRows=len(melamine),histaminePlans=len(histamine),histamineSpeciesEntries=len(species),totalLimitOrPlanRows=37,numericMismatches=0),
 notsRows=nots,fishPcbPahRows=fish,biotoxinRows=bio,melamineRows=melamine,histaminePlans=histamine,histamineSpeciesEntries=species,findings=findings,
 melamineCorrigendum=dict(sourceId='melamineCorrigendum',sourcePdfPage=1,changes={'2.4':'2.5','2.4.1':'2.5.1'},amendmentTitle='Second Amendment Regulations, 2016'),
 reviewBoundary=dict(fullCurrentLawComplete=False,numericRulesChanged=False,productApprovals=0,openExactArticleDecisions=137,futureProvisionsActivated=False,legacyCoreChanged=False,
  scope='Original-source concordance for these layers and a separate draft histamine comparison gate. Not exhaustive current-law, product or lot approval. Species names are source literals, not a taxonomic correction; genus and common-name aliases are not invented.'))
assert result['counts']==dict(notsRows=15,fishPcbPahRows=3,biotoxinRows=5,melamineRows=3,histaminePlans=11,histamineSpeciesEntries=119,totalLimitOrPlanRows=37,numericMismatches=0)
target=ROOT/'fssai-helper/ctr-toxin-gazette-concordance-r72-2026-11-17.json'
target.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result['counts']))
