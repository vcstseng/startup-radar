"""Compile a manually reviewed lightweight batch and record completion.

Usage: python scripts/process/build_light_batch.py 2
Selection and manual reading must already be complete. No network/model calls.
"""
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from jsonschema import Draft202012Validator
from tag_rules import normalize_company

ROOT = Path(__file__).resolve().parents[2]


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def serialize(value):
    return json.dumps(value, ensure_ascii=False, indent=2)+"\n"


def main(number):
    folder = ROOT / f"data/processed/companies/round-{number:03d}-review"
    batch_folder = ROOT / "data/processed/companies/batches"
    manifest = load(folder / "manifest.json")
    annotations = load(folder / "annotations.json")
    sample = load(folder / "sample.json")
    progress = load(batch_folder / "progress.json")
    progress_before = digest(batch_folder / "progress.json")
    assert digest(folder / "sample.json") == manifest["sample_sha256"] == annotations["sample_sha256"]
    assert manifest["population_file"] == progress["source_file"]
    assert manifest["population_sha256"] == progress["source_sha256"] == digest(ROOT / progress["source_file"])
    assert digest(ROOT / progress["raw_file"]) == progress["raw_sha256"]
    assert manifest["round"] == number
    raw = load(ROOT / progress["raw_file"])
    pool = {r["id"] for r in load(ROOT / progress["source_file"])}
    other_rounds = [r for r in progress["rounds"] if r["round"] != number]
    assert all(r["status"] == "completed" for r in other_rounds)
    other_ids = [i for r in other_rounds for i in r["company_ids"]]
    assert len(other_ids) == len(set(other_ids))
    for entry in other_rounds:
        assert digest(ROOT / entry["file"]) == entry["sha256"], "Existing completed batch changed."
    assert set(other_ids) <= pool
    assert len(annotations["rows"]) == len(sample) <= progress["batch_size"]
    assert [row[0] for row in annotations["rows"]] == list(range(len(sample)))
    records = []
    for row, original in zip(annotations["rows"], sample):
        i, summary, industry, workflow, solution, note = row
        assert i == original["review_position"]
        source_record = raw[original["upstream_position"]]
        assert original["original_record"] == source_record
        assert original["effective_description"] == source_record[original["description_field"]]
        notes = [note] if note else []
        if original["field_correction"]:
            notes.append("Antler 介紹從 location 讀取，原始欄位不修改。")
        if "\ufffd" in original["effective_description"]:
            notes.append("原文含編碼損壞字元。")
        records.append({"id": original["id"], "name": original["name"], "summary_zh": summary,
                        "tags": {key: value.split("、") if value else [] for key, value in zip(
                            ("industry_customer", "problem_workflow", "solution"), (industry, workflow, solution))},
                        "evidence": {"field": original["description_field"], "text": original["effective_description"]},
                        "notes": notes})
    for record in records:
        normalize_company(record)
    ids = [r["id"] for r in records]
    assert ids == manifest["sample_ids"] and len(ids) == len(set(ids))
    assert not set(ids) & set(other_ids) and set(ids) <= pool
    batch = {"schema_version": "1.0", "round": number, "source_file": progress["raw_file"], "companies": records}
    Draft202012Validator(load(ROOT / "config/schemas/company-batch.schema.json")).validate(batch)
    filename = batch_folder / f"round-{number:03d}.json"
    output = serialize(batch)
    previous = next((r for r in progress["rounds"] if r["round"] == number), None)
    entry = {"round": number, "file": filename.relative_to(ROOT).as_posix(), "status": "completed",
             "record_count": len(ids), "company_ids": ids,
             "completed_at_utc": previous["completed_at_utc"] if previous else datetime.now(timezone.utc).isoformat(),
             "sha256": hashlib.sha256(output.encode("utf-8")).hexdigest()}
    progress["rounds"] = sorted([*other_rounds, entry], key=lambda r: r["round"])
    progress["completed_records"] = len(other_ids) + len(ids)
    progress["remaining_records"] = len(pool) - progress["completed_records"]
    completed = {r["round"] for r in progress["rounds"]}
    next_round = 1
    while next_round in completed:
        next_round += 1
    progress["next_round"] = next_round
    assert digest(batch_folder / "progress.json") == progress_before, "Progress changed during processing."
    filename.write_text(output, encoding="utf-8", newline="\n")
    (batch_folder / "progress.json").write_text(serialize(progress), encoding="utf-8", newline="\n")
    stats = {"round": number, "records": len(ids), "completed": progress["completed_records"],
             "remaining": progress["remaining_records"], "next_round": progress["next_round"],
             "null_summaries": sum(r["summary_zh"] is None for r in records),
             "empty_dimensions": {k: sum(not r["tags"][k] for r in records) for k in records[0]["tags"]}}
    print(serialize(stats))


if __name__ == "__main__":
    main(int(sys.argv[1]))
