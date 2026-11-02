"""Verify website data integrity, count semantics, and known taxonomy boundaries."""
import hashlib
import json
from collections import Counter
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
FOLDER = ROOT / "data/processed/catalog/v1"
AXES = ("industry_customer", "problem_workflow", "solution")


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def main():
    manifest = load(FOLDER / "manifest.json")
    for path, sha in manifest["inputs"].items():
        assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == sha, path
    for path, sha in manifest["outputs"].items():
        assert hashlib.sha256((FOLDER / path).read_bytes()).hexdigest() == sha, path
    progress = load(ROOT / "data/processed/companies/batches/progress.json")
    canonical = {r["id"]: r for e in progress["rounds"] for r in load(ROOT / e["file"])["companies"]}
    population = load(ROOT / progress["source_file"])
    catalog = load(FOLDER / "records.json")
    Draft202012Validator(load(ROOT / "config/schemas/website-catalog-records.schema.json")).validate(catalog)
    records = {r["id"]: r for r in catalog["records"]}
    assert len(catalog["records"]) == len(records) == len(canonical) == 4085
    assert set(records) == set(canonical) == {r["id"] for r in population}
    assert catalog["record_count"] == len(records)
    taxonomy = load(FOLDER / "taxonomy.json")["dimensions"]
    facets = load(FOLDER / "facets.json")["dimensions"]
    summary = load(FOLDER / "summary.json")
    assert summary["build_id"] == manifest["build_id"] == load(FOLDER / "index.json")["build_id"]
    tag_map = load(FOLDER / "tag-map.json")
    detail_cache = {path: load(FOLDER / path)["records_by_id"] for path in {r["detail_file"] for r in records.values()}}
    assert sum(len(v) for v in detail_cache.values()) == 4085 and len(detail_cache) == 21
    for identifier, record in records.items():
        original, detail = canonical[identifier], detail_cache[record["detail_file"]][identifier]
        assert record["name"] == detail["name"] == original["name"]
        assert record["summary_zh"] == detail["summary_zh"] == original["summary_zh"]
        assert record["tags"] == detail["tags"] == original["tags"]
        assert detail["evidence"] == original["evidence"] and detail["notes"] == original["notes"]
        assert (record["website"] is not None) == (record["website_status"] == "provided_unverified")
        for axis in AXES:
            groups = set(record["categories"][axis])
            valid = {c["id"] for c in taxonomy[axis]["categories"]}
            assert groups and groups <= valid
            status = record["classification_status"][axis]
            if not record["tags"][axis]:
                assert groups == {"__missing"} and status == "missing"
            else:
                assert "__missing" not in groups
                assert (groups == {"__other"}) == (status == "unmapped")
                assert ("__other" in groups and len(groups) > 1) == (status == "partial")
            for group in groups:
                assert identifier in facets[axis][group]["record_ids"]
    sets = {}
    for axis in AXES:
        assert sum(summary["coverage"][axis]["statuses"].values()) == 4085
        assert summary["coverage"][axis]["statuses"] == dict(Counter(r["classification_status"][axis] for r in records.values()))
        assert summary["coverage"][axis]["statuses"]["missing"] == sum(not r["tags"][axis] for r in canonical.values())
        sets[axis] = {}
        for category, bucket in facets[axis].items():
            actual = {i for i, r in records.items() if category in r["categories"][axis]}
            assert len(bucket["record_ids"]) == len(set(bucket["record_ids"])) == bucket["record_count"]
            assert set(bucket["record_ids"]) == actual
            assert set(bucket["example_ids"]) <= actual
            assert len(bucket["example_ids"]) == len(set(bucket["example_ids"])) <= 5
            sets[axis][category] = actual
        assert set().union(*sets[axis].values()) == set(records)
        dist = {d["category_id"]: d for d in summary["distributions"][axis]}
        for category, bucket in facets[axis].items():
            assert dist[category]["record_count"] == bucket["record_count"]
            assert dist[category]["share_of_all_records"] == round(bucket["record_count"] / 4085, 6)
    assert sum(summary["source_counts"].values()) == 4085
    assert summary["source_counts"] == dict(Counter(r["source"] for r in records.values()))
    assert summary["null_summaries"] == 54
    tables = load(FOLDER / "cross-tabs.json")["tables"]
    assert len(tables) == 3
    for table in tables:
        left, right = table["left_dimension"], table["right_dimension"]
        cells = {(c["left_category_id"], c["right_category_id"]): c for c in table["cells"]}
        assert len(cells) == len(table["cells"])
        for a, members_a in sets[left].items():
            for b, members_b in sets[right].items():
                actual = members_a & members_b
                if actual:
                    cell = cells[a, b]
                    assert cell["record_count"] == len(actual)
                    assert set(cell["example_ids"]) <= actual
                else:
                    assert (a, b) not in cells
    # These are semantic regression cases, not just serializer checks.
    for axis, tag, forbidden in [
        ("solution", "AI 聊天機器人", "robotics"),
        ("solution", "聊天機器人", "robotics"),
        ("solution", "視覺化", "vision-imaging"),
        ("solution", "光場顯示", "vision-imaging"),
        ("solution", "服務機器人", "services"),
        ("industry_customer", "AI 開發者", "software-it"),
        ("industry_customer", "Excel 使用者", "consumer-household"),
        ("problem_workflow", "軟體採購", "software-development"),
        ("problem_workflow", "模型問題診斷", "healthcare-care"),
        ("problem_workflow", "輪胎健康分析", "healthcare-care"),
        ("problem_workflow", "土壤健康追蹤", "healthcare-care"),
        ("problem_workflow", "資產評估", "finance-accounting"),
        ("problem_workflow", "契合度評估", "risk-security")]:
        assert forbidden not in tag_map[axis][tag]["category_ids"], (axis, tag, forbidden)
    for axis, tag, required in [
        ("solution", "機器人", "robotics"),
        ("solution", "服務機器人", "robotics"),
        ("solution", "無人機", "robotics"),
        ("solution", "AI", "generic-ai"),
        ("solution", "AI agent", "agents"),
        ("solution", "太陽能", "energy-cooling"),
        ("problem_workflow", "模型訓練", "ai-lifecycle"),
        ("problem_workflow", "軟體採購", "supplychain-procurement"),
        ("problem_workflow", "醫療款項催收", "finance-accounting")]:
        assert required in tag_map[axis][tag]["category_ids"], (axis, tag, required)
    # Historical review artifacts must remain intact.
    for folder in ("data/processed/overview/v1", "data/processed/overview/theme-review-v1"):
        old = load(ROOT / folder / "manifest.json")
        for path, sha in old["outputs"].items():
            assert hashlib.sha256((ROOT / folder / path).read_bytes()).hexdigest() == sha
    print("PASS: full 4085-ID coverage, source/detail fidelity, schema, facet indexes, all cross-tab intersections, denominators, semantic boundaries and historical artifacts.")


if __name__ == "__main__":
    main()
