"""PMSV R38: verify delta against R36/R37 and legal fail-closed invariants."""
from pathlib import Path
import json
root = Path(__file__).resolve().parents[1]
def read(p): return json.loads((root/p).read_text(encoding="utf-8"))
r36=read("fssai-helper/ayurveda-ingredient-ctr-crosswalk-r36-2026-11-04.json")
r37=read("fssai-helper/ayurveda-unmapped-ingredient-source-review-r37-2026-11-04.json")
r38=read("fssai-helper/ayurveda-coconut-dates-copper-malathion-r38-2026-11-04.json")
master=read("fssai-product-helper-preview-01/data/product-master-v1.json")
assert len(master["catalog_products"]) == len({x["id"] for x in master["catalog_products"]}) == 533
assert r36["original_ingredient_records"] == 46
assert len(r36["ingredient_source_crosswalk"]) == 46
assert r36["raw_ingredient_source_reference_links"] == 67
assert r37["new_cumulative_source_links"] == 76
assert len(r37["all_24_prior_no_reference_ingredient_rows"]) == 24
unmatched={(x["recipe_number"],x["source_ingredient_serial"]): x for x in r37["all_24_prior_no_reference_ingredient_rows"] if not x["r37_named_source_row_ids"]}
assert len(unmatched) == 22
assert r38["original_exact_CTR_article_decisions_open"] == 137
assert r38["whole_products_legally_approved"] == 0
assert r38["legal_product_article_decisions_closed_this_pass"] == 0
assert r38["full_current_CTR_panels_verified"] == 0
assert r38["commercial_releases"] == 0
rows=r38["new_source_reference_rows"]
assert len(rows) == len({r["id"] for r in rows}) == 4
ids={r["id"] for r in rows}
assert r38["r38_additional_conditional_links"] == 4
assert r38["cumulative_raw_source_reference_links"] == 67+9+4 == 80
assert r38["cumulative_ingredient_instances_with_one_or_more_conditional_reference"] == 26
assert r38["r38_ingredient_instances_without_candidate"] == 20
keys={(x["recipe_number"],x["source_ingredient_serial"]) for x in r38["r38_row_links"]}
assert keys=={("14.3",2),("14.6",13)}
assert keys.issubset(unmatched)
for x in r38["r38_row_links"]:
 assert len(x["r38_source_ref_ids"]) == 2
 assert set(x["r38_source_ref_ids"]).issubset(ids)
 assert x["actual_ingredient_article_verified"] is False
 assert x["auto_apply"] is False
assert r38["r38_row_links"][1]["recipe_source_alignment_hold"] is True
for r in rows:
 assert r["source_pdf_page_image_verified"] is True
 assert r["current_gazette_amendments_fully_reconciled"] is False
 assert r["actual_SKU_process_and_article_confirmed"] is False
 assert r["finished_food_limit_auto_applies"] is False
 assert r["whole_product_legal_PASS"] is False
 assert r["commercial_release_authorized"] is False
assert {r["pesticide_table_printed_limit"] for r in rows[:2]} == {"$"}
assert all(r["numeric_pesticide_MRL_mg_kg"] is None for r in rows[:2])
assert all(r["source_pdf_page_one_based"]==21 and r["footnote_pdf_page_one_based"]==39 for r in rows[:2])
assert [(r["printed_food_article"],r["numeric_pesticide_MRL_mg_kg"]) for r in rows[2:]]==[("Fruits",4),("Dried fruits",8)]
assert all(r["numeric_CTR_rules_modified"] is False for r in [r38])
assert r38["product_master_modified"] is False and r38["live_application_modified"] is False
assert r38["draft_PR_2_unmerged"] is True
print(json.dumps({"status":"PASS","previous_unlinked":22,"now_unlinked":20,"new_source_rows":4,"total_reference_links":80,"original_product_holds":137,"legal_passes":0},indent=2))
