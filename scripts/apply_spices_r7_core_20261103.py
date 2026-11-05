"""Apply only the two R7 spice-form route corrections on the draft branch.
The expanded 638-row source review is delivered in the offline evidence package.
No legal approval, deployment, or legacy numeric-engine activation is performed.
"""
from pathlib import Path
import copy, hashlib, json, sys
BASE = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')
DATA = BASE / 'fssai-product-helper-preview-01/data'
EXPECTED = {'product-master-v1.json':'3591398fdc551569986c6710ff1cae2f3823afd6', 'rules/appendix-b-v2-core.json':'1b145fa00fcb35bafdbecda3ab05c2451444839e'}
def blob(b): return hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest()
objects = {}
for rel, digest in EXPECTED.items():
    content = (DATA / rel).read_bytes()
    assert blob(content) == digest, f'{rel}: preimage changed; reconcile before retrying'
    objects[rel] = json.loads(content)
master = objects['product-master-v1.json']; micro = objects['rules/appendix-b-v2-core.json']
before = copy.deepcopy(objects)
ids = {'12-12-2-dried-laurel-or-dried-bay-leaf', '12-12-2-dried-mint'}
mapping = micro['product_mappings']['spices']
removed = [r for r in mapping['exact'] if r['catalog_id'] in ids]
assert len(removed) == 2
assert not any(r['catalog_id'] in ids for r in mapping['conditional'])
mapping['exact'] = [r for r in mapping['exact'] if r['catalog_id'] not in ids]
for old in removed:
    mapping['conditional'].append({'catalog_id':old['catalog_id'], 'status':'variant_required', 'reason':'The product definition includes ground/powdered or crushed forms. Select the actual form under Appendix B definitions, not the word dried alone.', 'options':[{'condition':'Dried/dehydrated non-ground and non-crushed form','profile_key':'spice-02'}, {'condition':'Ground, powdered or crushed form','profile_key':'spice-03'}], 'source_pages':[26], 'reviewed_on':'2026-11-03'})
for collection in [master['catalog_products'], master['profiles']]:
    iterable = collection.values() if isinstance(collection, dict) else collection
    changed = 0
    for item in iterable:
        if item.get('id') in ids:
            item.update(microbiology_profile_key='', microbiology_status='conditional_appendix_b_variant_required', microbiology_verified_on='2026-11-03', microbiology_note='Actual non-ground versus ground/powdered/crushed form is required. Dried is not sufficient to select spice-02.')
            changed += 1
    assert changed == 2
micro['tables']['spices']['source_content_review_r7'] = {'date':'2026-11-03', 'numeric_plans_checked':28, 'numeric_plans_changed':0, 'changed_category_routes':sorted(ids), 'full_regulatory_verification':False}
# Preserve all catalogue records, existing approvals, other profiles and numeric plans.
assert len(master['catalog_products']) == len({p['id'] for p in master['catalog_products']}) == 533
assert micro['tables']['spices']['categories'] == before['rules/appendix-b-v2-core.json']['tables']['spices']['categories']
assert len(mapping['exact']) + len(mapping['conditional']) == len(before['rules/appendix-b-v2-core.json']['product_mappings']['spices']['exact']) + len(before['rules/appendix-b-v2-core.json']['product_mappings']['spices']['conditional'])
checks = 6
for old, new in zip(before['product-master-v1.json']['catalog_products'], master['catalog_products']):
    assert old['id'] == new['id']; checks += 1
    if old['id'] not in ids: assert old == new
    else:
        for key, value in old.items():
            if key not in {'microbiology_profile_key','microbiology_status','microbiology_verified_on','microbiology_note'}: assert new[key] == value
    checks += 1
out = BASE / 'spices-r7-core-applied'; out.mkdir(exist_ok=True)
results = []
expected_after = {'product-master-v1.json':'1e8e75462055fb1428cccff8a7a783a37ab337dd66d45b02c1b31d7b361bd500', 'rules/appendix-b-v2-core.json':'d9225920ebe98b0f6734dde9c9003c407a54ca200f270f07fcda0e9aea779658'}
for rel, obj in objects.items():
    content = (json.dumps(obj, ensure_ascii=False, indent=2) + '\n').encode()
    assert hashlib.sha256(content).hexdigest() == expected_after[rel], f'{rel}: differs from locally tested result'
    (DATA / rel).write_bytes(content); (out / Path(rel).name).write_bytes(content)
    results.append({'path':rel, 'sha256':hashlib.sha256(content).hexdigest()})
report = {'passed':checks+2, 'failed':0, 'changed_product_routes':2, 'numeric_microbiology_plans_changed':0, 'files':results, 'scope':'Two source-form route corrections only; expanded 638-row review and offline tests are separate. No full-law or product approval.'}
(out / 'application-manifest.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
