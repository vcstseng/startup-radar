"""Package step-one theme review; screening creates candidates, never membership."""
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/processed/overview/theme-review-v1"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8-sig"))


def digest(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def main():
    paths = ["data/processed/companies/batches/progress.json",
             "config/taxonomy/overview-themes-v1.json",
             "config/taxonomy/theme-review-screen-v1.json",
             "config/taxonomy/theme-review-decisions-v1.json",
             "config/taxonomy/reviewed-themes-v1.json",
             "scripts/analyze/build_theme_review.py"]
    inputs = {p: digest(p) for p in paths}
    progress, original_themes, screen, manual, draft = [read(p) for p in paths[:5]]
    assert progress["completed_records"] == 4085 and progress["remaining_records"] == 0
    raw = read(progress["raw_file"])
    for key, sha_key in (("raw_file", "raw_sha256"), ("source_file", "source_sha256")):
        path = progress[key]
        assert digest(path) == progress[sha_key]
        inputs[path] = digest(path)
    records, origins = {}, {}
    for entry in progress["rounds"]:
        assert digest(entry["file"]) == entry["sha256"]
        inputs[entry["file"]] = entry["sha256"]
        for r in read(entry["file"])["companies"]:
            assert r["id"] not in records
            old = raw[int(r["id"].split("-")[1])]
            assert r["name"] == old["name"] and r["evidence"]["text"] == old[r["evidence"]["field"]]
            records[r["id"]], origins[r["id"]] = r, entry["file"]
    assert len(records) == 4085
    assert set(records) == {r["id"] for r in read(progress["source_file"])}
    scanned = []
    selected_pairs, core_pairs = set(), set()
    for theme in original_themes["themes"]:
        key = theme["id"]
        core = {c["id"] for c in theme["cases"]}
        core_pairs.update((key, i) for i in core)
        matches = sorted(r["id"] for r in records.values()
                         if re.search(screen["patterns"][key], r["evidence"]["text"], re.I))
        extra = [i for i in matches if i not in core]
        count = min(12, len(extra))
        picked = [extra[round(i * (len(extra) - 1) / (count - 1))] for i in range(count)] if count > 1 else extra
        selected_pairs.update((key, i) for i in picked)
        scanned.append({"theme_id": key, "pattern": screen["patterns"][key],
                        "candidate_record_count": len(matches), "candidate_ids": matches,
                        "reviewed_additional_ids": picked})
    assert selected_pairs == {(x[0], x[1]) for x in manual["rows"]}
    assert core_pairs == {(x[0], x[1]) for x in manual["core_rows"]}
    dental = {r["id"] for r in records.values()
              if re.search(screen["dental_pattern"], r["evidence"]["text"], re.I)}
    assert dental == {x[0] for x in manual["dental_rows"]}
    judgments = []
    for group in ("rows", "core_rows"):
        for theme, identifier, decision, reason in manual[group]:
            assert decision in manual["decisions"] and identifier in records
            judgments.append({"theme_id": theme, "id": identifier, "decision": decision,
                              "reason_zh": reason, "review_set": group})
    for identifier, decision, reason in manual["dental_rows"]:
        assert decision in manual["decisions"]
        judgments.append({"theme_id": "clinic-work-slices", "id": identifier,
                          "decision": decision, "reason_zh": reason, "review_set": "dental_rows"})
    reviewed_ids = {r["id"] for r in judgments}
    evidence = [{**records[i], "batch_file": origins[i]} for i in sorted(reviewed_ids)]
    assert len(draft["reviews"]) == 7
    assert {t["id"] for t in draft["reviews"]} == {t["id"] for t in original_themes["themes"]}
    recommended = [t for t in draft["reviews"] if t["decision"] == "recommend"]
    assert [t["id"] for t in recommended] == draft["recommended_theme_ids"]
    assert len(recommended) == 3
    for theme in draft["reviews"]:
        for identifier in theme.get("case_ids", []):
            assert identifier in reviewed_ids
        if theme["decision"] == "recommend":
            theme["cases"] = [{"id": i, "name": records[i]["name"],
                                "summary_zh": theme.get("case_wording_overrides", {}).get(i, records[i]["summary_zh"]),
                                "evidence": records[i]["evidence"], "batch_file": origins[i]}
                               for i in theme["case_ids"]]
    summary = {"scope": "step-1-theme-review-only", "screened_records": 4085,
               "original_core_case_count": len({i for _, i in core_pairs}),
               "additional_theme_record_judgments": len(manual["rows"]),
               "dental_record_count": len(dental),
               "manual_unique_records": len(reviewed_ids),
               "manual_judgments": len(judgments),
               "candidate_counts": {x["theme_id"]: x["candidate_record_count"] for x in scanned},
               "judgment_counts": dict(Counter(j["decision"] for j in judgments)),
               "recommended_theme_ids": draft["recommended_theme_ids"],
               "recommended_case_count": sum(len(t["cases"]) for t in recommended),
               "limits": screen["limits"] + ["人工判定包含同一紀錄的不同檢視，不可把判定次數當公司數。",
                                               "沒有對 4085 筆全部進行第二次人工語意複核。"]}
    assert all(digest(p) == sha for p, sha in inputs.items())
    OUT.mkdir(parents=True, exist_ok=True)
    outputs = {"candidate-screen.json": {"scope": screen["scope"], "themes": scanned},
               "manual-judgments.json": judgments, "reviewed-records.json": evidence,
               "reviewed-themes.json": draft, "summary.json": summary}
    for name, value in outputs.items():
        (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    (OUT / "manifest.json").write_text(json.dumps({"version": "theme-review-1.0", "inputs": inputs,
        "outputs": {n: digest((OUT / n).relative_to(ROOT)) for n in outputs}}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8", newline="\n")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
