"""PMSV R39: source-to-ingredient invariants and fail-closed fat-basis evidence."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
def read(path): return json.loads((root/path).read_text(encoding="utf-8"))
r36=read("fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json")
r37=read("fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json")
r38=read("fssai-helper/ayurveda-coconut-dates-copper-malathion-r38-2026-11-04.json")
r39=read("fssai-helper/ayurveda-ghee-dairy-ctr-fat-basis-r39-2026-11-04.json")
assert r36["original_ingredient_records"]==46
assert len(r36["ingredient_source_crosswalk"])==46
assert r37["original_PMSV_catalogue_count"]==533
assert len(r37["all_24_prior_no_reference_ingredient_rows"])==24
assert r38["cumulative_raw_source_reference_links"]==80
r37_without={ (x["recipe_number"],x["source_ingredient_serial"]): x for x in r37["all_24_prior_no_reference_ingredient_rows"] if not x["r37_named_source_row_ids"] }
assert len(r37_without)==22
r38_keys={(x["recipe_number"],x["source_ingredient_serial"]) for x in r38["r38_row_links"]}
assert len(r38_keys)==2 and r38_keys.issubset(r37_without)
r38_unmapped=set(r37_without)-r38_keys
assert len(r38_unmapped)==20
links=r39["ingredient_source_links"]
keys={(x["recipe_number"],x["serial"]) for x in links}
assert len(links)==len(keys)==4
assert keys=={("13.1",7),("14.4",3),("14.5",2),("14.6",7)}
assert keys.issubset(r38_unmapped)
assert all(r37_without[(x["recipe_number"],x["serial"])]["source_family"]=="ghee" for x in links)
assert all(r37_without[(x["recipe_number"],x["serial"])]["source_name"]==x["source_name"] for x in links)
assert len(r38_unmapped-keys)==16
assert all(x["source_ref_ids"]==[y["id"] for y in r39["new_raw_CTR_source_rows"]] for x in links)
assert all(x["auto_apply_limits"] is False and x["legal_pass"] is False and x["commercial_batch_release"] is False for x in links)
assert next(x for x in links if x["recipe_number"]=="14.6")["formula_source_alignment_hold"] is True
refs=r39["new_raw_CTR_source_rows"]
assert len(refs)==len({x["id"] for x in refs})==2
assert refs[0]["analyte"]=="Carbendazim"
assert refs[0]["printed_MRL"]=="0.1 (F)" and refs[0]["MRL_mg_kg"]==0.1
assert refs[0]["F_footnote_pdf_page_one_based"]==39
assert refs[0]["F_footnote"]=="F: Maximum Residue Limit Calculation on Fat Basis"
assert refs[1]["MRL_mg_kg"]==0.05 and refs[1]["fat_basis_printed"]=="(fat basis)"
assert "3-hydroxy" in refs[1]["analyte"]
for s in refs:
 assert s["printed_food_article"]=="Milk and Milk products"
 assert s["pdf_source_page_image_verified"] is True and s["source_pdf_page_one_based"]==19
 assert s["legal_currentness_original_Gazette_reconciled"] is False
 assert s["legal_ghee_article_adjudicated"] is False
 assert s["finished_Ayurveda_product_limit_adjudicated"] is False
 assert s["auto_apply_to_ghee"] is False and s["auto_apply_to_finished_product"] is False
 assert s["compliance_pass"] is False and s["commercial_release"] is False
assert r39["R39_new_ingredient_source_links"]==len(links)*len(refs)==8
assert r39["R36_through_R39_cumulative_raw_source_reference_links"]==r38["cumulative_raw_source_reference_links"]+8==88
assert r39["R36_through_R39_original_ingredient_rows_with_raw_CTR_source_candidates"]==46-16==30
assert r39["R39_remaining_without_raw_contaminant_source_candidates"]==16
assert r39["original_product_CTR_article_applicability_open"]==137
assert r39["fully_approved_products"]==0 and r39["commercial_lots_released"]==0
assert r39["legal_final_product_CTR_article_decisions_closed"]==0
assert r39["no_numeric_CTR_rules_modified"] is True
assert r39["product_master_modified"] is False
assert r39["production_code_modified"] is False
assert r39["PR_2_merge_allowed_by_this_audit"] is False
print(json.dumps({"status":"PASS","original_ingredient_rows":46,"new_ghee_rows":4,"new_source_links":8,"cumulative_source_links":88,"still_no_CTR_source_candidate":16,"product_CTR_article_holds":137,"legal_product_PASSES":0},indent=2))
