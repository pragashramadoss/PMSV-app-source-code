"""PMSV R52: independently reconcile parallel R39 ghee registers without double counting."""
import json
from pathlib import Path
P=Path(__file__).resolve().parents[1]
def rd(p): return json.loads((P/p).read_text(encoding="utf-8"))
a=rd("fssai-helper/ayurveda-ghee-dairy-ctr-fat-basis-r39-2026-11-04.json")
b=rd("fssai-helper/ayurveda-ghee-fat-basis-source-review-r39-2026-11-04.json")
r40=rd("fssai-helper/ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json")
r52=rd("fssai-helper/ayurveda-ghee-r39-overlap-reconciliation-r52-2026-11-04.json")
master=rd("fssai-product-helper-preview-01/data/product-master-v1.json")
assert len(master["catalog_products"])==len({x["id"] for x in master["catalog_products"]})==533
akey={(x["recipe_number"],x["serial"]) for x in a["ingredient_source_links"]}
bkey={(x["recipe_number"],x["source_ingredient_serial"]) for x in b["ingredient_links"]}
assert len(akey)==len(bkey)==4 and akey==bkey
assert r52["ghee_original_ingredient_rows_unique"]==len(akey)==4
assert r52["ghee_recipe_keys"]==sorted(f"{x}|{y}" for x,y in akey)
def name(z):return str(z["analyte"] if "analyte" in z else z["pesticide"]).split("(")[0].strip().lower()
def source(z):
 return (name(z),str(z.get("printed_food_article") or z.get("printed_article")).lower(),float(z.get("MRL_mg_kg") if "MRL_mg_kg" in z else z["numeric_source_MRL_mg_kg"]))
asources={source(x) for x in a["new_raw_CTR_source_rows"]}
bsources={source(x) for x in b["conditional_CTR_source_rows"]}
assert len(asources)==len(bsources)==2
assert len(asources & bsources)==1
assert len(asources|bsources)==3
assert len(asources-bsources)==len(bsources-asources)==1
assert r52["cross_file_duplicate_pesticide"]=="Carbofuran"
assert r52["unique_pesticide_source_rows_in_union"]==3
assert r52["naive_combined_ingredient_source_links"]==16
assert r52["duplicate_ingredient_source_links"]==4
assert r52["deduplicated_ghee_ingredient_source_links"]==len(akey)*len(asources|bsources)==12
assert r52["extra_unique_research_citation_links_over_canonical_r39"]==len(akey)*len(bsources-asources)==4
assert r40["R36_to_R40_total_source_reference_links"]==r52["current_canonical_r40_links"]==94
assert r40["R40_remaining_without_raw_CTR_reference"]==r52["current_canonical_r40_ingredients_without_source_candidate"]==14
assert r52["potential_merged_unique_research_citation_links_if_explicitly_integrated"]==94+4==98
assert r52["original_product_CTR_article_holds"]==137
assert r52["fully_legally_approved_products"]==0
assert r52["no_operational_limit_changed"] and r52["no_live_helper_updated"] and r52["no_new_product_approval"]
assert r52["recipe_14_6_source_alignment_hold"] and r52["PR_2_remains_draft"]
assert all(x["source_applies_to_actual_ghee"] is False for x in r52.get("reference_rows",[])) if "reference_rows" in r52 else True
print(json.dumps({"status":"PASS","ghee_ingredient_occurrences":4,"distinct_source_examples":3,"canonical_R40_links":94,"additional_research_links":4,"unmapped_ingredients":14,"open_finished_CTR_article_holds":137,"whole_product_legal_PASS":0},indent=2))
