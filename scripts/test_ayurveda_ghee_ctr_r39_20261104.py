"""R39: Independent evidence-counter, per-ingredient and no-auto-PASS regression."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
def read(p): return json.loads((ROOT / p).read_text(encoding="utf-8"))
r36=read("fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json")
r37=read("fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json")
r38=read("fssai-helper/ayurveda-coconut-dates-copper-malathion-r38-2026-11-04.json")
r39=read("fssai-helper/ayurveda-ghee-fat-basis-source-review-r39-2026-11-04.json")
master=read("fssai-product-helper-preview-01/data/product-master-v1.json")

assert len(master["catalog_products"])==len({x["id"] for x in master["catalog_products"]})==533
assert len(r36["ingredient_source_crosswalk"])==46
assert r36["raw_ingredient_source_reference_links"]==67
assert r37["new_cumulative_source_links"]==76
assert r38["cumulative_raw_source_reference_links"]==80
assert r39["r39_cumulative_ingredient_to_CTR_source_links"]==88
assert r39["original_ayurveda_ingredient_row_count"]==46
assert r39["r39_new_ingredient_rows_with_conditional_CTR_source"]==4
assert r39["r39_remaining_ingredient_rows_without_CTR_source_candidate"]==16
assert r39["cumulative_original_ingredient_rows_with_conditional_CTR_source"]==30
assert r39["r39_new_distinct_CTR_source_rows"]==2
assert r39["r39_new_ingredient_to_CTR_source_links"]==8
assert r39["r38_ingredient_rows_without_conditional_CTR_source"]==20

r37_none=[x for x in r37["all_24_prior_no_reference_ingredient_rows"] if not x["r37_named_source_row_ids"]]
r38_keys={(x["recipe_number"],x["source_ingredient_serial"]) for x in r38["r38_row_links"]}
remaining={(x["recipe_number"],x["source_ingredient_serial"]):x for x in r37_none if (x["recipe_number"],x["source_ingredient_serial"]) not in r38_keys}
assert len(remaining)==20
ghee_expected={key for key,x in remaining.items() if x["source_family"]=="ghee"}
assert ghee_expected=={("13.1",7),("14.4",3),("14.5",2),("14.6",7)}
links=r39["ingredient_links"]
assert len(links)==4
assert len({(x["recipe_number"],x["source_ingredient_serial"]) for x in links})==4
assert {(x["recipe_number"],x["source_ingredient_serial"]) for x in links}==ghee_expected
ref_rows=r39["conditional_CTR_source_rows"]
assert len(ref_rows)==len({x["id"] for x in ref_rows})==2
ref_ids={x["id"] for x in ref_rows}
assert {x["pesticide"] for x in ref_rows}=={"Carbofuran","Phorate"}
assert all(x["printed_article"]=="Milk and Milk products" for x in ref_rows)
assert all(x["numeric_source_MRL_mg_kg"]==0.05 for x in ref_rows)
assert all(x["pdf_page_image_checked"] is True for x in ref_rows)
assert all(x["legal_article_for_actual_ghee_SKU_confirmed"] is False for x in ref_rows)
assert all(x["automatic_finished_food_MRL"] is False for x in ref_rows)
assert {x["pdf_page_one_based"] for x in ref_rows}=={19,33}
assert r39["fat_basis_definition_source"]["source_pdf_page_one_based"]==39
assert "Fat Basis" in r39["fat_basis_definition_source"]["printed_text"]
assert r39["ghee_standard"]["ghee_published_minimum_milk_fat_percent"]==99.5
assert r39["ghee_standard"]["ghee_published_maximum_moisture_percent"]==0.5
assert r39["ghee_standard"]["identity_standard_not_a_residue_limit"] is True
for row in links:
  orig=remaining[(row["recipe_number"],row["source_ingredient_serial"])]
  assert row["ingredient_name"]==orig["source_name"]
  assert row["original_ingredient_identity"]==orig["source_identity"]
  assert set(row["conditional_CTR_reference_ids"])==ref_ids
  assert row["conditional_reference_count"]==2
  assert row["actual_supplier_ingredient_identity_and_purity_confirmed"] is False
  assert row["residue_panel_complete"] is False
  assert row["legal_current_gazette_reconciliation_complete"] is False
  assert row["no_automatic_application_to_ghee_or_finished_recipe"] is True
  assert row["whole_product_legal_PASS"] is False
  assert row["commercial_release_authorized"] is False
  assert row["recipe_alignment_hold"] == (row["recipe_number"]=="14.6")
assert r39["original_exact_finished_product_CTR_article_holds"]==137
assert r39["legally_closed_finished_product_CTR_articles"]==0
assert r39["full_current_CTR_panels_signed_off"]==0
assert r39["fully_legally_approved_products"]==0
assert r39["commercial_batches_released"]==0
assert r39["amendment_effective_on_review_date"] is False
assert r39["recipe_14_6_title_method_alignment_hold_preserved"] is True
assert r39["numerical_operational_rules_changed"] is False
assert r39["product_master_modified"] is False
assert r39["live_pmsv_engine_changed"] is False
assert r39["draft_pr_unmerged"] is True
print(json.dumps({
  "status":"PASS", "catalogue":533, "original_ayurveda_ingredient_rows":46,
  "new_ghee_ingredient_rows":4,"new_conditional_CTR_source_rows":2,
  "new_reference_links":8,"total_reference_links":88,
  "previous_without_CTR_candidate":20,"remaining_without_CTR_candidate":16,
  "original_legal_product_article_holds":137,
  "whole_product_legal_PASS":0
}, indent=2))
