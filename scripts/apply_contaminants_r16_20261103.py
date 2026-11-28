"""Apply selected R16 contaminant article scope metadata to audit branch only."""
from pathlib import Path
import json, hashlib
P=Path('fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json')
b=P.read_bytes()
assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()=='663617c7925ef85f5ab04f95c12993f72d553e46','Preimage changed; reconcile'
c=json.loads(b)
assert c['all_food_rules'][0]['contaminant'].lower()=='methyl mercury'
assert c['all_food_rules'][0]['limit']==0.25 and c['all_food_rules'][0]['article']=='All foods'
assert c['r15_catalogue_contaminant_layer_review']['products_without_any_exact_current_evidence']==137
old=['01-01-7-ice-cream-kulfi-chocolate-ice-cream-softy-ice-cream-milk-ice-milk-lolly-and-dried-','04-04-1-thermally-processed-fruit-salad-cocktail-mix','04-04-1-thermally-processed-fruits','04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms','04-04-2-sterilized-fungi','04-04-2-thermally-processed-vegetables','06-06-8-compressed-soybean-curd','06-06-8-dehydrated-soybean-curd-film','11-11-1-bura-sugar','11-11-1-cube-sugar','11-11-1-icing-sugar','11-11-1-khandsari-sugar','11-11-1-plantation-white-sugar','11-11-3-golden-syrup']
fungus=['04-04-2-dried-fungi','04-04-2-dried-fungi-concentrate','04-04-2-fermented-fungi','04-04-2-fungi-extract-and-fungi-concentrate','04-04-2-fungi-grits-and-fungi-powder','04-04-2-fungi-in-olive-oil-and-other-vegetable-oils','04-04-2-pickled-fungi','04-04-2-pickles-made-from-combination-of-fruits-or-vegetables-or-other-edible-plant-materi','04-04-2-pickles-made-from-vegetables-or-other-edible-plant-material-including-mushrooms','04-04-2-quick-frozen-fungi','04-04-2-salted-fungi-semi-processed-products','04-04-2-sterilized-fungi']
assert len(old)==14 and len(fungus)==12 and len(set(old)|set(fungus))==24 and len(set(fungus)-set(old))==10
assert 'r16_product_specific_article_review_2026_11_03' not in c
c['r16_product_specific_article_review_2026_11_03']={
'review_date':'2026-11-03',
'status':'SOURCE_CONDITIONAL_EVIDENCE_ONLY_NO_FULL_PRODUCT_APPROVAL',
'version_ix_source_url':'https://fssai.gov.in/upload/uploadfiles/files/Comp_Contaminants_Regulations_03_02_2026_IX.pdf',
'version_ix_source_date':'2026-02-03',
'all_foods_global_methyl_mercury':{
'source_row':'Methyl Mercury (calculated as element) — All foods',
'limit':0.25,'source_unit':'ppm (mg/kg or mg/L)',
'existing_rule_preserved':True,
'solid_measurement_unit':'mg/kg',
'liquid_measurement_unit':'mg/L',
'exact_sample_matrix_and_method_expression_required':True,
'no_automatic_density_conversion':True,
'source_pdf_page_one_based':13,
'not_full_contaminant_panel':True,
},
'product_specific_article_gap_count':137,
'not_no_contaminant_requirement_count':137,
'existing_product_specific_conditional_article_ids':sorted(old),
'fungus_article_conditional_ids':sorted(fungus),
'new_fungus_article_candidates':len(set(fungus)-set(old)),
'total_conditionally_source_anchored_gaps':24,
'other_unanchored_product_specific_gaps':113,
'agaric_acid_food_containing_mushrooms':{
'analyte':'Agaric acid','limit':100,'unit':'ppm',
'article':'Food containing mushrooms','source_pdf_page_one_based':15,
'actual_mushroom_species_and_ingredient_identity_required':True,
'fungi_not_automatically_mushroom':True,'auto_apply':False,
},
'existing_full_current_law_status_unchanged':True,
'current_amendment_effective_date_watch':'2026-12-01',
'as_of_2026_11_03_amendment_active':False,
'all_source_conditional_candidates_auto_apply':False,
'full_product_approvals':0,
'lot_releases_authorised':0,
'audit_companion_only':True,
}
new=(json.dumps(c,ensure_ascii=False,indent=2)+'\n').encode()
expected='0f32a6cd75deaa43c06872a022a563b23465c8384d6ba9038c26a7d6fbcfb93d'
assert hashlib.sha256(new).hexdigest()==expected,'Source candidate output differs from local-tested SHA-256'
P.write_bytes(new)
out=Path('contaminants-r16-core-applied');out.mkdir(exist_ok=True)
(out/P.name).write_bytes(new)
manifest={'passed':714,'failed':0,'catalogue':533,'product_specific_article_gaps':137,'source_conditional_candidates':24,'new_fungi_candidates':10,'universal_methyl_mercury_limit_ppm':0.25,'full_current_panels_verified':0,'numeric_values_changed':0,'full_product_approvals':0,'output_sha256':expected}
(out/'application-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
