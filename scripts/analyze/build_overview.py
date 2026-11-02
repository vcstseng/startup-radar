"""Build a reversible overview of completed reviews; no network or batch edits."""
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/processed/overview/v1"
KEYS = ("industry_customer", "problem_workflow", "solution")


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def digest(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n",
                            encoding="utf-8", newline="\n")


def main():
    progress_path = "data/processed/companies/batches/progress.json"
    progress = read(progress_path)
    assert progress["remaining_records"] == 0
    raw = read(progress["raw_file"])
    population = read(progress["source_file"])
    assert digest(progress["raw_file"]) == progress["raw_sha256"]
    assert digest(progress["source_file"]) == progress["source_sha256"]
    inputs = {progress_path: digest(progress_path),
              "scripts/analyze/build_overview.py": digest("scripts/analyze/build_overview.py"),
              progress["raw_file"]: progress["raw_sha256"],
              progress["source_file"]: progress["source_sha256"]}
    records, origins = [], {}
    for entry in progress["rounds"]:
        assert digest(entry["file"]) == entry["sha256"]
        inputs[entry["file"]] = entry["sha256"]
        batch = read(entry["file"])
        assert [r["id"] for r in batch["companies"]] == entry["company_ids"]
        records.extend(batch["companies"])
        for record in batch["companies"]:
            origins[record["id"]] = entry["file"]
    ids = [r["id"] for r in records]
    assert len(ids) == len(set(ids)) == progress["completed_records"] == 4085
    assert set(ids) == {r["id"] for r in population}
    by_id = {r["id"]: r for r in records}
    for r in records:
        original = raw[int(r["id"].split("-")[1])]
        assert r["name"] == original["name"]
        assert r["evidence"]["text"] == original[r["evidence"]["field"]]

    alias_path = "config/taxonomy/overview-aliases-v1.json"
    theme_path = "config/taxonomy/overview-themes-v1.json"
    for path in (alias_path, theme_path):
        inputs[path] = digest(path)
    aliases = read(alias_path)["aliases"]
    for key in KEYS:
        assert not set(aliases[key].values()) & set(aliases[key]), "No alias chains"
    view, changes = [], []
    for r in records:
        tags = {}
        for key in KEYS:
            tags[key] = list(dict.fromkeys(aliases[key].get(t, t) for t in r["tags"][key]))
            for tag in r["tags"][key]:
                if tag in aliases[key]:
                    changes.append({"id": r["id"], "dimension": key,
                                    "from": tag, "to": aliases[key][tag]})
            assert len(tags[key]) <= len(r["tags"][key])
        view.append({"id": r["id"], "batch_file": origins[r["id"]], "tags": tags})

    inventory = {}
    for key in KEYS:
        original, normalized = defaultdict(list), defaultdict(list)
        for r, item in zip(records, view):
            for tag in set(r["tags"][key]):
                original[tag].append(r["id"])
            for tag in item["tags"][key]:
                normalized[tag].append(r["id"])
        inventory[key] = {"before_distinct_tags": len(original),
                          "after_distinct_tags": len(normalized),
                          "tags": [{"tag": t, "record_count": len(members), "record_ids": members}
                                   for t, members in sorted(normalized.items(), key=lambda x: (-len(x[1]), x[0]))]}

    name_groups, domain_groups = defaultdict(list), defaultdict(list)
    for r in records:
        original = raw[int(r["id"].split("-")[1])]
        url = original.get("website") or ""
        try:
            host = (urlsplit(url if "://" in url else "https://" + url).hostname or "").lower()
        except ValueError:
            host = ""
        if host.startswith("www."):
            host = host[4:]
        member = {"id": r["id"], "name": r["name"], "source": original.get("source"),
                  "website": url, "batch_file": origins[r["id"]],
                  "summary_zh": r["summary_zh"]}
        name_groups[" ".join(r["name"].split()).casefold()].append(member)
        if host:
            domain_groups[host].append(member)

    duplicates = {"policy": "候選清單，不表示同一公司，不合併、不刪除、不推定更名。網域為完整 hostname，不解析註冊主網域。",
                  "same_name": [], "same_website_host": []}
    for name, members in sorted(name_groups.items()):
        if len(members) < 2:
            continue
        texts = {by_id[m["id"]]["evidence"]["text"] for m in members}
        duplicates["same_name"].append({"normalized_name": name, "record_count": len(members),
                                        "distinct_descriptions": len(texts), "members": members})
    for host, members in sorted(domain_groups.items()):
        if len(members) > 1:
            duplicates["same_website_host"].append({"hostname": host, "record_count": len(members),
                                                    "shared_source_host": host == "antler.co",
                                                    "members": members})

    themes = read(theme_path)
    seen_themes = set()
    for theme in themes["themes"]:
        assert theme["id"] not in seen_themes
        seen_themes.add(theme["id"])
        assert len({c["id"] for c in theme["cases"]}) == len(theme["cases"])
        for case in theme["cases"]:
            record = by_id[case["id"]]
            assert case["name"] == record["name"]
            case["batch_file"] = origins[case["id"]]
            case["evidence"] = record["evidence"]

    summary = {"record_count": len(records), "round_count": len(progress["rounds"]),
               "null_summaries": sum(r["summary_zh"] is None for r in records),
               "empty_dimensions": {k: sum(not r["tags"][k] for r in records) for k in KEYS},
               "alias_rules": sum(len(aliases[k]) for k in KEYS),
               "changed_records_in_view": len({c["id"] for c in changes}),
               "tag_replacements": len(changes),
               "tag_counts": {k: {x: inventory[k][x] for x in ("before_distinct_tags", "after_distinct_tags")} for k in KEYS},
               "same_name_groups": len(duplicates["same_name"]),
               "records_in_same_name_groups": sum(g["record_count"] for g in duplicates["same_name"]),
               "same_name_same_description_groups": sum(g["distinct_descriptions"] == 1 for g in duplicates["same_name"]),
               "same_website_host_groups": len(duplicates["same_website_host"]),
               "shared_source_host_groups": sum(g["shared_source_host"] for g in duplicates["same_website_host"]),
               "theme_count": len(themes["themes"]),
               "representative_record_count": len({c["id"] for t in themes["themes"] for c in t["cases"]}),
               "limits": ["數量為名錄紀錄，不是去重公司數、時間趨勢或市場規模。",
                          "每筆可有多個 tags；各 tag 數量不可相加當作公司數。",
                          "標準化僅涵蓋少量確定同義詞，尚未建立完整分類樹。",
                          "主題案例是人工挑選，不代表該主題完整覆蓋或熱門排名。"]}
    assert all(digest(path) == sha for path, sha in inputs.items())
    OUT.mkdir(parents=True, exist_ok=True)
    outputs = {"tags-view.json": {"version": "overview-1.0", "records": view},
               "tag-changes.json": changes, "tag-inventory.json": inventory,
               "duplicate-candidates.json": duplicates, "themes.json": themes,
               "summary.json": summary}
    for name, value in outputs.items():
        write(name, value)
    write("manifest.json", {"version": "overview-1.0", "inputs": inputs,
                            "outputs": {name: digest((OUT / name).relative_to(ROOT)) for name in outputs}})
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
