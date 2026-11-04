"""R27: reproducible evidence queue for the 137 original PMSV CTR article gaps.

Read-only against product master and contaminant rules. No full product PASS.
"""
from pathlib import Path
from collections import Counter,defaultdict
import ast,hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
M=ROOT/'fssai-product-helper-preview-01/data/product-master-v1.json'
C=ROOT/'fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json'
R20=ROOT/'fssai-helper/contaminant-r20-scope-manifest-2026-11-03.json'
OUT=ROOT/'fssai-helper/ctr-137-evidence-queue-r27-2026-11-04.json'
MD=ROOT/'fssai-helper/ctr-137-review-r27-2026-11-04.md'
before={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in (M,C,R20)}
m=json.loads(M.read_text());c=json.loads(C.read_text());q20=json.loads(R20.read_text())
products=m['catalog_products'];pm={p['id']:p for p in products};ids=set(pm)
assert len(pm)==len(products)==533
assert c['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137
assert c['r16_product_specific_article_review_2026_11_03']['product_specific_article_gap_count']==137
# Read the authoritative historical R15 key sets, rather than redefining them.
tree=ast.parse((ROOT/'scripts/apply_contaminants_r15_core_20261103.py').read_text())
sets={}
for node in ast.walk(tree):
 if isinstance(node,ast.Assign):
  for target in node.targets:
   if isinstance(target,ast.Name) and target.id in ('exact_keys','review_keys'):
    sets[target.id]=ast.literal_eval(node.value)
exact=sets['exact_keys'];reviews=sets['review_keys']
assert exact<=c.keys() and reviews<=c.keys()
ref=defaultdict(set)
def walk(v,key):
 if isinstance(v,dict):
  for item in v.values():walk(item,key)
 elif isinstance(v,list):
  for item in v:walk(item,key)
 elif isinstance(v,str) and v in ids:ref[v].add(key)
for key in exact|reviews:walk(c[key],key)
has_exact={pid for pid in ids if ref[pid]&exact}
assert len(has_exact)==396,('exact set',len(has_exact))
pending=ids-has_exact
explicit={x['catalog_id'] for x in c['r15_explicit_no_prior_module_reference_reviews']}
assert len(explicit)==56 and explicit<=pending
# Only pre-R15 modules participate in the original 23/58/56 categories.
conditional_keys={key for key in c if any(w in key for w in ('conditional','locked','variant','package')) and not re.match(r'r(?:1[5-9]|2\d)_',key)}
for key in conditional_keys:walk(c[key],key)
old_conditional={pid for pid in pending if ref[pid]&conditional_keys}
# R15 evaluates conditional matches first; overlapping commodity refs are secondary.
old_commodity={pid for pid in pending if (ref[pid]&reviews) and pid not in old_conditional}
assert len(old_conditional)==23,('old conditional',len(old_conditional))
assert len(old_commodity)==58,('old commodity',len(old_commodity))
assert not(old_conditional&old_commodity or old_conditional&explicit or old_commodity&explicit)
assert old_conditional|old_commodity|explicit==pending

r16=set(c['r16_product_specific_article_review_2026_11_03']['existing_product_specific_conditional_article_ids'])
r18={x['catalog_id'] for x in c['r18_unanchored_article_review_2026_11_03']['source_conditional_rows']}
r20={x['catalog_id'] for x in q20['new_candidate_manifest']}
r21=set(c['r21_fpc18_directive_2026_11_03']['covered_catalogue_ids'])
for label,g,n in [('r16',r16,24),('r18',r18,31),('r20',r20,19),('r21',r21,12)]:
 assert len(g)==n and g<=pending,(label,len(g))
conditional=r16|r18|r20|r21
assert len(conditional)==82 and len(pending-conditional)==55
assert len(r21-(r16|r18|r20))==8

CTR='https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf'
FPC='https://www.fssai.gov.in/upload/advisories/2021/07/60f6a6554438dDirection_Indian_Sweets_Snacks_20_07_2021.pdf'
common=['Actual SKU identity, FoSCoS FPC/FSSR class and current legal source article',
        'Recipe/ingredient species and concentrations; processing factor and finished-food form',
        'Actual primary pack type and final analytical matrix',
        'Full applicable metal/toxin/pesticide/veterinary residue panel and current amendments',
        'Validated method, sample basis/units, test reports and clause-by-clause review']
def requirements(pid,tracks):
 a=[]
 if 'FPC18_R21' in tracks:
  a+=['Confirm eligible FPC18; exclude an already standardized/mapped FPC 01-14 product',
      'Verify the Section 16(5) direction remains operative: 4(f) Foods-not-specified contaminants/pesticides; 4(g) base-product microbiology; 4(h) ingredient toxins']
 if 'R16' in tracks:
  a+=['Resolve conditional subtype, finished pack, sugar ash, mushroom or milk article and any competing source provisions']
 if 'R18' in tracks:
  a+=['Distinguish cereal product, food containing a named commodity, oilseed, spice, composite food and specific milled-grain article']
 if 'R20' in tracks:
  a+=['Resolve multiple named metal articles/conditions: species, ash/dry-solids, tomato/mango, chemical identity or can']
 if pid=='purified-vending-water':a+=['Use Chapter 2.10.9 vending water/IS10500; do not inherit packaged/mineral-water articles']
 if 'water-chestnut-flour' in pid:a+=['Verify Trapa species dried nuts, not raw roots/tubers or canned chestnuts']
 if 'frozen-desserts-or-confections-with-added-vegetable' in pid:a+=['Do not automatically equate vegetable-fat/protein frozen dessert with milk/ice-cream']
 if 'coconut-milk' in pid:a+=['Coconut kernel and any maltodextrin/caseinate additions; not coconut water/oil']
 if any(x in pid for x in ['analogue','colostrum','lactose']):a+=['Milk-derived origin alone does not establish a milk/secondary-milk source article']
 if any(x in pid for x in ['fungi','mushroom']):a+=['Species evidence: fungi is not necessarily mushroom for agaric-acid article']
 if 'thermally-processed' in pid:a+=['Verify final can versus bottle/retort pouch/aseptic pack before applying canned-article limits']
 if any(x in pid for x in ['pulp','puree','chutney']):a+=['Verify named tomato concentrate/mango chutney before using named source limits']
 if 'tartaric-acid' in pid:a+=['Confirm source stereochemistry L(+) versus catalogue L(+/-)']
 if 'any-other-foodgrains' in pid:a+=['Identify raw grain species and source exclusions']
 if 'edible-dried-seeds' in pid:a+=['Verify species/processing; licensing direction is not itself a finished-food contaminant limit']
 if pid.startswith('102-102-'):a+=['Exact Ayurveda Aahara recipe, ingredients and applicable commodity regulations']
 if pid.startswith('99-99-') or 'premix' in pid:a+=['Exact chemical/INS identity and mixture composition, not blanket single-additive article inheritance']
 if 'mouth-freshener' in pid:a+=['Finished mixture recipe; raw-ingredient MRL is not automatically the mixed finished-food MRL']
 if not a:a+=['Find exact named source article/direction, or retain evidence hold; absence of a named row is not exemption']
 return common+a

records=[]
for pid in sorted(pending):
 p=pm[pid]
 tracks=[name for name,g in [('R16',r16),('R18',r18),('R20',r20),('FPC18_R21',r21)] if pid in g]
 stage='R15_CONDITIONAL_OR_LOCKED' if pid in old_conditional else ('R15_COMMODITY_REVIEW_ONLY' if pid in old_commodity else 'R15_NO_EXACT_ROUTE')
 priority='P1_FPC18_ELIGIBILITY' if pid in r21 else ('P2_SOURCE_CANDIDATE' if tracks else 'P3_ORIGINAL_SOURCE_LOOKUP')
 records.append({
  'catalog_id':pid,'product_name':p['name'],'fssr':p.get('fssr',''),'fcs':p.get('fcs',''),
  'original_R15_stage':stage,'source_candidate_tracks':tracks,'priority':priority,
  'source_status':'CONDITIONAL_ONLY' if tracks else 'NO_DEFENSIBLE_ADDITIONAL_EXACT_ARTICLE',
  'evidence_needed':requirements(pid,tracks),
  'source_urls':[CTR]+([FPC] if pid in r21 else []),
  'article_applicability_decision':'EVIDENCE_HOLD','full_current_ctr_panel_verified':False,
  'product_fully_approved':False,'lot_release_authorized':False,'candidate_auto_apply':False
 })
assert len(records)==137==len({r['catalog_id'] for r in records})
assert sum(bool(r['source_candidate_tracks']) for r in records)==82
assert Counter(r['original_R15_stage'] for r in records)=={'R15_CONDITIONAL_OR_LOCKED':23,'R15_COMMODITY_REVIEW_ONLY':58,'R15_NO_EXACT_ROUTE':56}
assert all(r['article_applicability_decision']=='EVIDENCE_HOLD' and not r['candidate_auto_apply'] for r in records)
doc={
 'review':'PMSV CTR R27','date':'2026-11-04','source_edition':'FSSAI CTR Version IX (03.02.2026)',
 'basis':'Original R15 classification + R16/R18/R20/R21 conditional candidate registers',
 'catalogue_total':533,'exact_partial_evidence_elsewhere':396,
 'unadjudicated_exact_product_article_cases':137,
 'with_source_candidates':82,'without_defensible_additional_article':55,
 'new_exact_article_adjudications':0,'full_ctr_panels_verified':0,'products_fully_verified':0,
 'commercial_lot_releases':0,'numeric_rules_changed':False,'live_engine_changed':False,
 'draft_audit_only':True,'december_2026_amendment_active_now':False,
 'r15_counts':dict(Counter(r['original_R15_stage'] for r in records)),
 'priority_counts':dict(Counter(r['priority'] for r in records)),
 'source_urls':[CTR,FPC],'input_sha256':before,'records':records
}
OUT.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
lines=[
 '# PMSV R27 - 137 unresolved contaminant-article cases (4 November 2026)',
 '',
 'This audit consolidates the original 137 product-specific exact article gaps, without advancing any products to PASS.',
 '',
 '| Review stage | Product identities |',
 '|---|---:|',
 '| Catalogue | 533 |',
 '| Original exact partial contaminant evidence outside this queue | 396 |',
 '| Exact source-article applicability gaps | **137** |',
 '| With conditional official source candidates (R16/R18/R20/R21) | **82** |',
 '| Without defensible additional exact finished-product article | **55** |',
 '| New exact article decisions | **0** |',
 '| Fully verified CTR panels / full product approvals | **0 / 0** |',
 '',
 'The historical original R15 split is 23 conditional/locked + 58 commodity-only + 56 no-exact-route. These must not be confused with final legal verification.',
 '',
 '## Risk controls',
 '',
 '- FPC18 direction clause 4(f) supports category-directed Foods not specified treatment only for eligible FPC18 products; already-standardized FPC01-14 products are excluded. Clause 4(g/h) adds microbiology and ingredient-toxin considerations.',
 '- Canned food does not follow simply from thermal processing; species, sugar sulphated ash, analytical dry-matter basis and chemical stereochemistry must not be assumed.',
 '- 1 December 2026 contaminant amendment is future-effective on 4 November 2026; no future numerical rules are automatically enabled.',
 '- No matching single source row grants full current CTR-panel approval or commercial release.',
 '',
 '## Product-by-product queue',
 '',
 '| Product and stable catalogue ID | Evidence track | Target evidence |',
 '|---|---|---|'
]
for r in sorted(records,key=lambda r:(r['priority'],r['product_name'].lower(),r['catalog_id'])):
 detail=r['evidence_needed'][5] if len(r['evidence_needed'])>5 else r['evidence_needed'][0]
 line='| '+r['product_name'].replace('|','/')+' ('+r['catalog_id']+') | '+(', '.join(r['source_candidate_tracks']) or 'No additional source')+' | '+detail.replace('|','/')+' |'
 lines.append(line)
lines+=['','## Sources', '', '- FSSAI current CTR compendium: '+CTR,
        '- FSSAI FPC18 Indian sweets/snacks direction: '+FPC,
        '- Details and complete evidence requests: ctr-137-evidence-queue-r27-2026-11-04.json',
        '- Audit branch only: no production, operative numeric rule, product master or approval field modification.','']
MD.write_text('\n'.join(lines))
assert len(json.loads(OUT.read_text())['records'])==137
assert all(hashlib.sha256(p.read_bytes()).hexdigest()==before[str(p)] for p in (M,C,R20))
print(json.dumps({'status':'PASS','queue':137,'conditional':82,'unanchored':55,'new_legal_confirmations':0,'priority_counts':doc['priority_counts'],'queue_sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()},indent=2))
