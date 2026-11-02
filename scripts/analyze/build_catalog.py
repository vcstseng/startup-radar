"""Build the complete, offline website data catalog from immutable review batches."""
import hashlib
import itertools
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/processed/catalog/v1"
AXES = ("industry_customer", "problem_workflow", "solution")


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def digest(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n",
                    encoding="utf-8", newline="\n")


def website(value):
    if not value or not value.strip():
        return None, "missing"
    candidate = value.strip()
    if "://" not in candidate:
        candidate = "https://" + candidate
    try:
        parsed = urlsplit(candidate)
        if (parsed.scheme not in ("http", "https") or not parsed.hostname
                or "." not in parsed.hostname or parsed.username or parsed.password
                or any(c.isspace() for c in candidate)):
            return None, "invalid"
        if parsed.hostname.lower().removeprefix("www.") == "antler.co":
            return None, "shared_source"
    except ValueError:
        return None, "invalid"
    return candidate, "provided_unverified"


def main():
    progress_file = "data/processed/companies/batches/progress.json"
    taxonomy_file = "config/taxonomy/catalog-taxonomy-v1.json"
    alias_file = "config/taxonomy/overview-aliases-v1.json"
    schema_file = "config/schemas/website-catalog-records.schema.json"
    inputs = {p: digest(p) for p in (progress_file, taxonomy_file, alias_file, schema_file,
                                    "scripts/analyze/build_catalog.py")}
    progress, rules, aliases = read(progress_file), read(taxonomy_file), read(alias_file)["aliases"]
    assert progress["completed_records"] == 4085 and progress["remaining_records"] == 0
    raw = read(progress["raw_file"])
    for key, sha_key in (("raw_file", "raw_sha256"), ("source_file", "source_sha256")):
        assert digest(progress[key]) == progress[sha_key]
        inputs[progress[key]] = progress[sha_key]
    dataset_id = "startup-radar-" + progress["raw_sha256"][:16] + "-4085"
    normalized = defaultdict(Counter)
    source_records, batch_by_id = {}, {}
    for entry in progress["rounds"]:
        assert digest(entry["file"]) == entry["sha256"]
        inputs[entry["file"]] = entry["sha256"]
        batch = read(entry["file"])
        assert [r["id"] for r in batch["companies"]] == entry["company_ids"]
        for record in batch["companies"]:
            identifier = record["id"]
            assert identifier not in source_records
            old = raw[int(identifier.split("-")[1])]
            assert record["name"] == old["name"] and record["evidence"]["text"] == old[record["evidence"]["field"]]
            source_records[identifier] = record
            batch_by_id[identifier] = entry["round"]
            for axis in AXES:
                for tag in set(aliases[axis].get(t, t) for t in record["tags"][axis]):
                    normalized[axis][tag] += 1
    assert set(source_records) == {r["id"] for r in read(progress["source_file"])}
    assert len(source_records) == 4085

    taxonomy, tag_map, group_lookup = {}, {}, {}
    for axis in AXES:
        definition = rules["dimensions"][axis]
        categories = definition["categories"]
        assert len({c["id"] for c in categories}) == len(categories)
        group_lookup[axis] = {c["id"]: c for c in categories + rules["system_categories"]}
        compiled = [(c, [re.compile(p, re.I) for p in c["patterns"]],
                     [re.compile(p, re.I) for p in c.get("exclude_patterns", [])]) for c in categories]
        tag_map[axis] = {}
        for tag, count in sorted(normalized[axis].items()):
            matches = []
            override = rules.get("overrides", {}).get(axis, {}).get(tag)
            for category, patterns, excludes in compiled:
                if any(p.search(tag) for p in excludes):
                    continue
                hit = [p.pattern for p in patterns if p.search(tag)]
                if hit:
                    matches.append({"category_id": category["id"], "patterns": hit})
            groups = sorted({m["category_id"] for m in matches})
            if override is not None:
                groups = override
                assert set(groups) <= set(group_lookup[axis]) - {"__missing", "__other"}
            tag_map[axis][tag] = {"category_ids": groups or ["__other"],
                                  "record_count": count, "matches": matches,
                                  "override_applied": override is not None}
        taxonomy[axis] = {"label_zh": definition["label_zh"], "description_zh": definition["description_zh"],
                          "categories": [{k: v for k, v in c.items() if k not in ("patterns", "exclude_patterns")}
                                         for c in categories + rules["system_categories"]]}

    rows, details, members = [], defaultdict(dict), {a: defaultdict(set) for a in AXES}
    for identifier, original in sorted(source_records.items()):
        index = int(identifier.split("-")[1])
        old, number = raw[index], batch_by_id[identifier]
        groups, statuses, tags = {}, {}, {}
        for axis in AXES:
            tags[axis] = list(dict.fromkeys(aliases[axis].get(t, t) for t in original["tags"][axis]))
            mapped = {g for tag in tags[axis] for g in tag_map[axis][tag]["category_ids"]}
            groups[axis] = sorted(mapped) if tags[axis] else ["__missing"]
            statuses[axis] = ("missing" if not tags[axis] else "unmapped" if mapped == {"__other"}
                              else "partial" if "__other" in mapped else "mapped")
            for group in groups[axis]:
                members[axis][group].add(identifier)
        url, status = website(old.get("website"))
        detail_file = f"details/batch-{number:03d}.json"
        rows.append({"id": identifier, "name": original["name"], "summary_zh": original["summary_zh"],
                     "source": old["source"], "website": url, "website_status": status,
                     "tags": original["tags"], "normalized_tags": tags,
                     "categories": groups, "classification_status": statuses,
                     "detail_file": detail_file})
        details[number][identifier] = {**original, "source": old["source"], "upstream_position": index}
    by_id = {r["id"]: r for r in rows}

    def examples(identifiers, limit=5):
        # Deterministic, source-diverse illustrations; no popularity or quality ranking.
        queues = defaultdict(list)
        for identifier in sorted(identifiers):
            if by_id[identifier]["summary_zh"] is not None:
                queues[by_id[identifier]["source"]].append(identifier)
        result, names = [], set()
        while any(queues.values()) and len(result) < limit:
            for source in sorted(queues):
                while queues[source]:
                    identifier = queues[source].pop(0)
                    name = " ".join(by_id[identifier]["name"].split()).casefold()
                    if name not in names:
                        result.append(identifier)
                        names.add(name)
                        break
                if len(result) == limit:
                    break
        return result

    facets, coverage, distribution = {}, {}, {}
    for axis in AXES:
        facets[axis], distribution[axis] = {}, []
        for category in taxonomy[axis]["categories"]:
            group, identifiers = category["id"], members[axis][category["id"]]
            facets[axis][group] = {"record_count": len(identifiers), "record_ids": sorted(identifiers),
                                  "example_ids": examples(identifiers)}
            distribution[axis].append({"category_id": group, "label_zh": category["label_zh"],
                                       "kind": category["kind"], "record_count": len(identifiers),
                                       "share_of_all_records": round(len(identifiers) / len(rows), 6)})
        coverage[axis] = {"statuses": dict(Counter(r["classification_status"][axis] for r in rows)),
                          "distinct_tags": len(tag_map[axis]),
                          "unmapped_distinct_tags": sum(v["category_ids"] == ["__other"] for v in tag_map[axis].values()),
                          "unmapped_tag_occurrences": sum(v["record_count"] for v in tag_map[axis].values() if v["category_ids"] == ["__other"])}
        assert set().union(*(set(v["record_ids"]) for v in facets[axis].values())) == set(by_id)

    cross_tabs = []
    for left, right in itertools.combinations(AXES, 2):
        cells = []
        for a, left_members in sorted(members[left].items()):
            for b, right_members in sorted(members[right].items()):
                intersection = left_members & right_members
                if intersection:
                    cells.append({"left_category_id": a, "right_category_id": b,
                                  "record_count": len(intersection), "example_ids": examples(intersection, 3)})
        cross_tabs.append({"left_dimension": left, "right_dimension": right, "cells": cells})
    build_id = hashlib.sha256(json.dumps(inputs, sort_keys=True).encode("utf-8")).hexdigest()
    summary = {"schema_version": "1.0", "dataset_id": dataset_id, "build_id": build_id, "record_count": len(rows),
               "unit": "source_record", "deduplicated": False,
               "source_counts": dict(sorted(Counter(r["source"] for r in rows).items())),
               "null_summaries": sum(r["summary_zh"] is None for r in rows),
               "solution_generic_only_records": sum(r["categories"]["solution"] == ["generic-ai"] for r in rows),
               "website_status_counts": dict(Counter(r["website_status"] for r in rows)),
               "coverage": coverage, "distributions": distribution,
               "counting": {"multi_label": True, "denominator": len(rows),
                            "cross_tab_cell": "unique_record_id_intersection",
                            "examples": "source-diverse deterministic illustrations, not rankings"},
               "limitations_zh": ["未去重的名錄紀錄數，不是公司數、市場份額或成長率。",
                                   "大類是既有 tags 的規則彙整，不是重新驗證所有原文。",
                                   "大類內同一 ID 只計一次；大類與交叉表可重疊，不可相加當總數。",
                                   "未分類、資訊不足與僅概括 AI 均明確保留。",
                                   "原文、摘要及網址未查證產品現況或效果，網址也未重新連線。"]}
    catalog = {"schema_version": "1.0", "dataset_id": dataset_id, "record_count": len(rows), "records": rows}
    from jsonschema import Draft202012Validator
    Draft202012Validator(read(schema_file)).validate(catalog)
    assert all(digest(p) == sha for p, sha in inputs.items())
    outputs = {"records.json": catalog, "taxonomy.json": {"schema_version": "1.0",
        "taxonomy_version": rules["taxonomy_version"], "dimensions": taxonomy},
        "summary.json": summary, "facets.json": {"schema_version": "1.0", "dimensions": facets},
        "cross-tabs.json": {"schema_version": "1.0", "tables": cross_tabs},
        "tag-map.json": tag_map,
        "unmapped-tags.json": {a: [{"tag": tag, "record_count": item["record_count"]}
            for tag, item in sorted(tag_map[a].items(), key=lambda x: (-x[1]["record_count"], x[0]))
            if item["category_ids"] == ["__other"]] for a in AXES}}
    for number, items in sorted(details.items()):
        outputs[f"details/batch-{number:03d}.json"] = {"schema_version": "1.0", "dataset_id": dataset_id,
                                                       "records_by_id": items}
    outputs["index.json"] = {"schema_version": "1.0", "dataset_id": dataset_id,
        "build_id": build_id,
        "taxonomy_version": rules["taxonomy_version"], "record_count": len(rows),
        "files": {"taxonomy": "taxonomy.json", "summary": "summary.json", "records": "records.json",
                  "facets": "facets.json", "cross_tabs": "cross-tabs.json"},
        "detail_loading": "Use record.detail_file, then records_by_id[record.id].",
        "count_unit_zh": "未去重名錄紀錄；分類可重疊。", "release_status": "local_review_dataset"}
    for name, value in outputs.items():
        write(OUT / name, value)
    write(OUT / "manifest.json", {"schema_version": "1.0", "dataset_id": dataset_id, "build_id": build_id,
        "inputs": inputs, "outputs": {name: digest((OUT / name).relative_to(ROOT)) for name in outputs}})
    print(json.dumps({"records": len(rows), "category_counts_excluding_system": {
        a: len(rules["dimensions"][a]["categories"]) for a in AXES}, "coverage": coverage,
        "detail_files": len(details), "cross_tab_cells": [len(t["cells"]) for t in cross_tabs]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
