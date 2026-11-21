"""R40 regression: 16 actual previous gaps, two conditional ginger links, 14 remain; no legal PASS."""
import json
from pathlib import Path
P=Path(__file__).resolve().parents[1]
def get(path): return json.loads((P/path).read_text(encoding="utf-8"))
r37=get("fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json")
r38=get("fssai-helper/ayurveda-coconut-dates-copper-malathion-r38-2026-11-04.json")
r39=get("fssai-helper/ayurveda-ghee-dairy-ctr-fat-basis-r39-2026-11-04.json")
r40=get("fssai-helper/ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json")
key=lambda x:(x["recipe_number"],x.get("source_ingredient_serial",x.get("serial")))
base={key(x):x for x in r37["all_24_prior_no_reference_ingredient_rows"] if not x["r37_named_source_row_ids"]}
assert len(base)==22
ref38={key(x) for x in r38["r38_row_links"]}
ref39={key(x) for x in r39["ingredient_source_links"]}
assert ref38.isdisjoint(ref39)
remaining=set(base)-ref38-ref39
assert len(remaining)==16
r40_new=r40["conditionally_source_linked_ingredient_instances"]
new_keys={key(x) for x in r40_new}
assert len(r40_new)==len(new_keys)==2
assert new_keys=={("13.1",4),("14.6",4)}
assert new_keys.issubset(remaining)
assert all(base[key(x)]["source_family"]=="ginger_rhizome" for x in r40_new)
assert r40_new[1]["recipe_source_title_method_hold"] is True
assert all(x["actual_fresh_or_dried_grade_confirmed"] is False for x in r40_new)
assert all(x["legal_PASS"] is False and x["auto_apply_numeric_rules"] is False and x["batch_release"] is False for x in r40_new)
other=r40["remaining_14_original_ingredient_instances"]
assert len(other)==14 and {key(x) for x in other}==remaining-new_keys
assert all(x["legal_PASS"] is False and x["raw_CTR_source_candidate_count"]==0 for x in other)
assert sum(x["source_family"]=="water" for x in other)==4
assert sum(x["source_family"]=="asafoetida_oleoresin" for x in other)==1
assert sum(x["separate_FSSR_or_hygiene_evidence"] is not None for x in other)==5
assert all(x["separate_FSSR_or_hygiene_evidence"]["kind"]=="SCHEDULE_4_PROCESS_WATER_ONLY" for x in other if x["source_family"]=="water")
hingu=[x for x in other if x["source_family"]=="asafoetida_oleoresin"]
assert len(hingu)==1 and hingu[0]["separate_FSSR_or_hygiene_evidence"]["section"]=="2.9.29"
sources=r40["source_rows"]
assert len(sources)==len({x["id"] for x in sources})==3
assert [(s["analyte"],s["limit"],s["unit"],s["source_page_one_based"]) for s in sources]==[
("Lead",10,"mg/kg",3),("Total Aflatoxins",30,"µg/kg",14),("Aflatoxin B1",15,"µg/kg",14)]
assert all(s["source_pdf_page_image_verified"] is True for s in sources)
assert all(s["legally_applicable_to_actual_ingredient"] is False for s in sources)
assert all(s["auto_apply"] is False and s["whole_product_PASS"] is False for s in sources)
assert all(set(x["conditional_dried_ginger_CTR_source_ids"])=={s["id"] for s in sources} for x in r40_new)
assert r39["R36_through_R39_cumulative_raw_source_reference_links"]==88
assert r40["R40_additional_ingredient_source_reference_links"]==2*3==6
assert r40["R36_to_R40_total_source_reference_links"]==94
assert r40["R40_remaining_without_raw_CTR_reference"]==14
assert r40["original_catalogue_unique_product_ids"]==533
assert r40["original_ayurveda_recipe_ingredient_rows"]==46
assert r40["exact_finished_product_CTR_article_decisions_open"]==137
assert r40["whole_products_legally_confirmed"]==0 and r40["commercial_batch_releases"]==0
assert r40["live_product_master_modified"] is False and r40["live_numeric_rules_modified"] is False
assert r40["live_PMSV_app_modified"] is False and r40["audit_PR_2_keep_draft_unmerged"] is True
print(json.dumps({"status":"PASS","prior_unlinked":16,"ginger_new_candidates":2,"unlinked_after":14,"source_rows":3,"additional_source_links":6,"source_links_total":94,"unchanged_final_product_holds":137,"legal_PASS":0},indent=2))
