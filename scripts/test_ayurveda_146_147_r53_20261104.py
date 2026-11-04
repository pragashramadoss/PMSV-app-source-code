"""R53: cross-check FSSAI recipe source discrepancy packet and no-legal-PASS gates."""
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
def load(p): return json.loads((root/p).read_text(encoding="utf-8"))
doc=load("fssai-helper/ayurveda-recipe-authority-clarification-r53-2026-11-04.json")
r35=load("fssai-helper/ayurveda-category-a-recipe-evidence-r35-2026-11-04.json")
r40=load("fssai-helper/ayurveda-ginger-source-and-14-holds-r40-2026-11-04.json")
r43=load("fssai-helper/ayurveda-purity-and-variant-holds-r43-2026-11-04.json")
r50=load("fssai-helper/ctr-137-evidence-readiness-r50-2026-11-04.json")
master=load("fssai-product-helper-preview-01/data/product-master-v1.json")
assert len(master["catalog_products"])==len({r["id"] for r in master["catalog_products"]})==533
assert doc["catalogue_product_id_count"]==533
assert doc["original_ayurveda_recipes"]==len(r35["records"])==9
assert doc["original_ayurveda_ingredient_rows"]==r35["official_printed_ingredient_rows"]==46
assert r40["R36_to_R40_total_source_reference_links"]==doc["canonical_raw_ingredient_CTR_reference_links"]==94
assert r40["R40_remaining_without_raw_CTR_reference"]==doc["remaining_ayurveda_raw_CTR_source_gaps"]==14
assert doc["original_finished_product_CTR_legal_applicability_holds"]==len(r50["records"])==137
p0=[x for x in r50["records"] if x["priority"]=="P0"]
assert len(p0)==doc["original_p0_cases"]==4
assert len(doc["recipes"])==doc["two_Ayurveda_P0_reexamined"]==2
assert {r["number"] for r in doc["recipes"]}=={"14.6","14.7"}
base={x["recipe_number"]:x for x in r35["records"]}
for rec in doc["recipes"]:
  prior=base[rec["number"]]
  assert rec["catalogue_id"]==prior["catalogue_id"]
  assert rec["printed_ingredient_count"]==prior["ingredient_table_row_count"]==len(prior["ingredients"])
  assert rec["printed_ingredient_names"]==[v["source_name"] for v in prior["ingredients"]]
  assert rec["category"]==prior["official_recipe_category"]
  assert rec["official_title_method_alignment_hold"] is True
  assert rec["whole_product_legal_PASS"] is False
  assert rec["batch_release_authorized"] is False
  assert prior["route_status"]=="SOURCE_RECIPE_ALIGNMENT_HOLD"
  assert any(x["id"]==rec["catalogue_id"] for x in p0)
r146=next(x for x in doc["recipes"] if x["number"]=="14.6")
r147=next(x for x in doc["recipes"] if x["number"]=="14.7")
assert len(r146["source_method_variants"])==len(r43["recipe_14_6"]["variants"])==4
assert [x["variant"] for x in r146["source_method_variants"]]==["Ksheerapaka","Lehya","Ghatika","Sharkara"]
assert r146["method_only_names_not_in_ingredient_table"]==["Karpura","Kasturi"]
assert all(x not in r146["printed_ingredient_names"] for x in ["Karpura","Kasturi"])
assert "Ketaki" in r146["printed_ingredient_names"]
assert r146["food_use_permission_of_method_only_ingredients_confirmed"] is False
assert r146["stage_specific_regulatory_assignment_final"] is False
assert r147["printed_ingredient_names"]==["Mahishi Ksheera","Sugandhita pushpa","Jala","Sharkara"]
assert len(r147["aromatic_flower_footnote_examples"])==2
assert {(x["name"],x["botanical"]) for x in r147["aromatic_flower_footnote_examples"]}=={
  ("Ketaki","Pandanus tectorius"),("Jati","Jasminum officinale")}
assert all(x["example_only"] for x in r147["aromatic_flower_footnote_examples"])
assert r147["source_footnote_non_exhaustive_etc"] is True
assert r147["actual_manufacturer_selected_flower_species_confirmed"] is False
assert r147["unrestricted_flower_use_authorized"] is False
assert r147["flower_removal_proves_zero_transfer"] is False
assert doc["source_2025"]["parsed_text_inspected"] is True
assert doc["source_2025"]["page_image_confirmed"] is False
assert doc["source_2026_part2"]["reviewed_index_is_not_14_6_14_7_corrigendum"] is True
assert doc["source_2026_part2"]["nonexhaustive_notice_search"] is True
assert doc["authority_email_sent"] is False and doc["legal_corrigendum_obtained"] is False
assert doc["full_legal_product_approvals"]==doc["finished_product_ctr_articles_closed_this_round"]==0
assert doc["product_master_changed"] is False
assert doc["live_helper_changed"] is False
assert doc["operative_regulatory_limit_changed"] is False
assert doc["draft_pr_2_merge_authorized"] is False
print(json.dumps({"status":"PASS","recipes_with_source_hold":2,"remaining_original_product_ctr_holds":137,"ayurveda_unmapped_ingredient_rows":14,"new_legal_passes":0,"clarification_sent":False},indent=2))
