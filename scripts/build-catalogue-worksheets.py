"""Compile the 533 product worksheets from the checked-in FSSAI evidence and rule profiles."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HELPER = ROOT / "fssai-helper"
RULES = ROOT / "fssai-product-helper-preview-01/data/rules"


def read(name):
    return json.loads((RULES / (name + ".json")).read_text())


def compact(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def get_global(file):
    return json.loads((HELPER / file).read_text().split("=", 1)[1].strip().removesuffix(";"))


def index_standards(value, result):
    if isinstance(value, dict):
        if isinstance(value.get("key"), str) and ("name" in value or "identity" in value):
            result[value["key"]] = value
        for k, v in value.items():
            if k.startswith(("source_", "legacy", "review")):
                continue
            if isinstance(v, dict) and "name" in v and (k[0].isdigit() or k == "general"):
                result[k] = v
            index_standards(v, result)
    elif isinstance(value, list):
        for v in value:
            index_standards(v, result)


def tidy(z):
    if isinstance(z, list):
        return [tidy(v) for v in z]
    if isinstance(z, dict):
        return {k: tidy(v) for k, v in z.items() if k not in ("catalog_id", "source_url", "source_verified_on", "source_pdf_pages", "source_content_status", "verification", "standard_key", "id", "batch_id", "commercial_release_authorized", "current_law_verified", "product_approved", "automatic_comparison_allowed", "r5_source_controls") and not k.startswith(("legacy", "audit_"))}
    return z


def linked_profile(rule, anchor):
    reconciled = anchor["basis"] == "Reviewed source edition and PDF fingerprint"
    controls = []
    rows = rule.get("reviewed_requirements") or rule.get("composition") or []
    if isinstance(rows, list):
        for v in rows:
            if not isinstance(v, dict) or not v.get("parameter"):
                continue
            public = tidy(v)
            numeric = v.get("operator") in ("<", "<=", ">", ">=", "=", "range") and v.get("unit") and (v.get("value") is not None or (v.get("min") is not None and v.get("max") is not None))
            unconditional = not any(v.get(k) for k in ("when", "exception", "condition", "alternative_group", "alternatives", "variant", "unless", "note", "qualifier", "exclusive_min", "exclusive_max"))
            auto = bool(numeric and reconciled and unconditional and v.get("automatic_comparison_allowed") is True and v.get("source_content_status") == "SOURCE_EDITION_ROW_RECONCILED" and not v.get("automatic_comparison_blocked"))
            controls.append({"spec": public, "compare": auto})
    sections = {}
    for k, v in rule.items():
        if not v or k in ("key", "name", "status", "composition", "reviewed_requirements") or k.startswith(("legacy", "historical", "source", "audit", "current_law", "full_compliance", "machine", "regulatory_", "conditional_rules_require")):
            continue
        if k in ("definition","identity","scope","description","age_scope","table_basis","variants","product_family","permitted_ingredients","permitted_ingredient_groups","prohibited_ingredients","prohibited_or_absent","required_ingredients","formula","formulation_rules","calculated_rules","other_limits","process_rules","storage_rules","quality_rules","quality_parameters","requirements","table","composition_core","physical_chemical","product_specific_label","label_rules","classification_rules","additives","identity_test","permitted_ingredient_examples","special_rules","specific_rules","form_rules","nutrients","packing_media","inheritance","applies_with","note","source_questions_r11"):
            sections[k] = tidy(v)
    if isinstance(rows, dict) or isinstance(rows, list) and any(not isinstance(v, dict) or not v.get("parameter") for v in rows):
        sections["composition_by_form"] = tidy(rows if isinstance(rows, dict) else [v for v in rows if not isinstance(v, dict) or not v.get("parameter")])
    issues = []
    for key, v in rule.items():
        if "source_questions" in key and v:
            issues.extend(v if isinstance(v, list) else [v])
        if key.startswith("source_content_review") and isinstance(v, dict):
            for q in ("source_questions", "general_source_questions"):
                for item in v.get(q, []) or []:
                    if item not in issues:
                        issues.append(item)
    # Preserve named tables that are outside the generic composition key. Keep their form boundaries.
    test_tables = {}
    for field in ("chocolate_types", "roasted_ground", "decaffeinated_roasted_ground", "soluble_coffee",
                  "decaffeinated_soluble", "regular_roasted_ground", "instant", "decaffeinated_instant",
                  "fruit_juice_table_r9", "mozzarella_table", "relative_composition", "essential_requirements_r13",
                  "conditional_requirements", "core_composition", "composition_rules"):
        if rule.get(field):
            test_tables[field] = tidy(rule[field])
    return {"name": rule["name"], "criteria": controls, "sections": sections, "issues": tidy(issues),
            **({"testTables": test_tables} if test_tables else {})}


def build():
    evidence = get_global("catalogue-source-evidence.js")
    master = json.loads((RULES.parent / "product-master-v1.json").read_text())
    special = {x["product_id"]: x for x in read("special-regulatory-routes-v1")["routes"]}
    standards, files, products = {}, {}, {}
    for sk, anchor in evidence["standards"].items():
        module, key = sk.split("#")
        if module not in files:
            files[module] = {}
            index_standards(json.loads((RULES / module).read_text()), files[module])
        standards[sk] = linked_profile(files[module][key], anchor)
    for v in master["catalog_products"]:
        pid = v["id"]
        s = special.get(pid, {})
        review = s.get("r14_source_review", {})
        products[pid] = {"name":v["name"], "fcs": v.get("fcs", ""), "category":v.get("appendix_fcs", ""), "related":s.get("appendix_a_related_categories", []),
                         "routeFinding":review.get("verified_finding") or s.get("official_source_part",""),
                         "routeContext":review.get("product_context_required",""), "checks":s.get("checks_required") or s.get("regulatory_checks",[])}
    assert set(products) == set(evidence["products"]) and len(products) == 533
    additive = read("appendix-a-v3-core")
    sets = {}
    for k,z in additive["loaded_permission_sets"].items():
        sets[k]={"name":z["name"],"rows":[[v["name"],v["ins"],v["limit"],v["condition"],v.get("note_refs",""),v.get("variant_id",""),v.get("specific","")] for v in z.get("entries",[])]}
    micro = read("appendix-b-v2-core")
    microprofiles = {}
    for family,tab in micro["tables"].items():
        for row in tab["categories"]:
            microprofiles[row["id"]]={"group": family, "pages":tab.get("source_pages"), "name":row["name"], "criteria":{k:tidy(v) for k,v in row.items() if k not in ("name","id","sl_no","source_notes")}}
    ctr = read("contaminants-v9-core")
    articles = {v["id"]:{"name":v["label"],"rows":[tidy(x) for x in v.get("rules",[])]} for v in ctr["profiles"] if v.get("id") and v.get("rules")}
    for p in ctr["profiles"]:
        for pid in p.get("catalog_ids", []):
            if pid in products and p.get("id") in articles and evidence["products"][pid]["directCTR"]:
                products[pid].setdefault("ctrProfiles",[]).append(p["id"])
    label = read("labelling-display-v8-core")
    packaging = read("packaging-current-core")
    claims = read("advertising-claims-v4-core")
    result = {"products":products,"standards":standards,"categories":sets,"notes":additive["note_texts"],"groups":additive["annexure_1_groups"],
              "aliases":additive["appendix_fcs_aliases"],"gmp":additive["gmp_table"],"micro":microprofiles,"organisms":micro["organism_labels"],"ctr":articles,
              "label":[[v["clause"],v["title"]] for v in label["general_prepackaged_rules"]],"allergens":label["allergen_rules"],
              "pack":packaging["primary_material_rules"],"claims":claims["general_principles"]}
    return "globalThis.PMSVCatalogueRules=" + compact(result) + ";\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    output = HELPER / "catalogue-rule-data.js"
    contents = build()
    if args.check:
        if not output.exists() or output.read_text() != contents:
            raise SystemExit("Regenerate catalogue-rule-data.js from the checked source evidence and profiles.")
    else:
        output.write_text(contents)
