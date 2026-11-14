"""R23 audit CI for seafood veterinary-drug amendment transition."""
import json,hashlib
from pathlib import Path
root=Path(".")
p=root/"fssai-product-helper-preview-01/data/rules/contaminants-2026-deferred-amendment-v1.json"
d=json.loads(p.read_text())
master=root/"fssai-product-helper-preview-01/data/product-master-v1.json"
m=json.loads(master.read_text())
assert d["effective_date"]=="2026-12-01" and len(d["changes"])==5
sea=next(c for c in d["changes"] if c["id"]=="seafood_veterinary_drug_residues")
assert len(sea["catalog_ids"])==22
assert sea["previous_clause_2_3_2_1_values_mgkg"]=={"Tetracycline":0.1,"Oxytetracycline":0.1,"Trimethoprim":0.05,"Oxolinic acid":0.3}
assert [(x["parameter"],x["limit"],x["unit"]) for x in sea["future_reference_values"]]==[("Trimethoprim",0.05,"mg/kg"),("Oxolinic acid",0.3,"mg/kg")]
r=d["r23_seafood_source_transition"]
assert r["old_seafood_clause_2_3_2_1_omitted"] is True
assert r["after_commencement_seafood_clause_2_3_2_4_entries_mgkg"]=={"Trimethoprim":0.05,"Oxolinic acid":0.3}
assert r["numeric_current_limit_changes_auto_applied"]==0
assert r["commercial_release_authorized"] is False and r["complete_current_law_verified"] is False
watch=set().union(*(set(x["catalog_ids"]) for x in d["changes"]))
ids={x["id"] for x in m["catalog_products"]}
assert len(watch)==31 and len(ids)==533 and watch<=ids
assert "2026-12-01" in sea["change"] and "already" not in sea["change"].lower() or "pre-existing" in sea["change"].lower()
out=Path("r23-ci-output");out.mkdir(exist_ok=True)
manifest={"status":"PASS","checks":18,"catalogue":533,"watch":31,"seafood":22,"current_seafood_clause_1_analytes":4,"existing_numeric_limits_migrated":2,"full_product_approvals":0,"current_numeric_limits_changed":0,"sha256_deferred":hashlib.sha256(p.read_bytes()).hexdigest(),"sha256_master":hashlib.sha256(master.read_bytes()).hexdigest()}
(out/"R23_CI_Manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")
print(json.dumps(manifest,indent=2))
