"""Regression checks for R24 FSSAI pesticide and veterinary source layers."""
from pathlib import Path
import hashlib,json
p=Path("fssai-product-helper-preview-01/data/rules/contaminants-v9-core.json")
core=json.loads(p.read_bytes())
r=core["residue_mrls"];v=core["antibiotic_and_pharmacological_substances"]
meta=core["r24_residue_regulatory_guards_2026_11_03"]
assert hashlib.sha256(p.read_bytes()).hexdigest()=="31e5b94800b4427d20a249ae3b99f258c912f248340b1dbe76ceac30d22953bf"
assert len(r["pesticides"])==213 and r["next_serial"]==214
assert r["pesticides"][-1]["serial"]==213
assert sum(len(x["rows"]) for x in r["pesticides"])==1098
assert len(v["veterinary_tolerance_limits"]["rows"])==49
assert sum(len(x["rows"]) for x in v["veterinary_tolerance_limits"]["rows"])==358
assert v["stage"]=="complete_current_version_ix_section_2_3_2"
assert len(v["prohibited_veterinary_practice_substances"]["substances"])==14
assert len(v["honey_antibiotic_mrpl"]["rows"])==12
assert v["honey_antibiotic_mrpl"]["unit"]=="ug/kg"
assert meta["pesticide_unfixed_mrl_tolerance"]["requires_no_specific_mrl_fixed_for_pesticide"] is True
assert meta["pesticide_unfixed_mrl_tolerance"]["auto_apply"] is False
assert meta["veterinary_prohibited_use"]["default_emrl_mgkg"]==0.001
assert meta["veterinary_prohibited_use"]["chloramphenicol_emrl_mgkg"]==0.0003
assert meta["veterinary_prohibited_use"]["emrl_is_not_permission_for_use"] is True
assert meta["honey_antibiotics"]["mrpl_is_detection_threshold_not_use_authorisation"] is True
assert meta["honey_antibiotics"]["mrpl_unit"]=="ug/kg"
assert meta["honey_antibiotics"]["use_not_permitted_during_production"] is True
assert meta["malathion"]["residue_definition"]=="sum of malathion and malaoxon"
assert meta["malathion"]["wheat_grain_mgkg"]==10
assert meta["malathion"]["maize_grain_mgkg"]==0.05
assert meta["malathion"]["other_food_grains_mgkg"]==4
assert meta["malathion"]["milled_food_grains_mgkg"]==1
assert meta["next_deferred_amendment_effective"]=="2026-12-01"
assert meta["deferred_rules_not_activated_as_of_review"] is True
assert meta["full_product_approvals"]==0
assert meta["commercial_release_authorized"] is False
assert meta["current_numeric_limits_modified"] is False
assert meta["production_engine_wired"] is False
master=Path("fssai-product-helper-preview-01/data/product-master-v1.json")
m=json.loads(master.read_text())
assert len(m["catalog_products"])==533
assert len({x["id"] for x in m["catalog_products"]})==533
future=json.loads(Path("fssai-product-helper-preview-01/data/rules/contaminants-2026-deferred-amendment-v1.json").read_text())
assert future["effective_date"]=="2026-12-01"
assert future["runtime_policy"]["active_on_review_date"] is False
print("R24 PASS: 34 source-count, unit, date, no-PASS and 533 catalogue invariants")
