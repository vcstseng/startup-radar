"""Reproducible, offline AI relevance triage with field-level evidence."""
import hashlib
import json
import random
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/raw/snapshots/full-20261101T150331066Z/all.json"
OUT = ROOT / "data/processed/ai-filter/full-20261101T150331066Z"


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def save(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


RULES = load(ROOT / "config/ai-filter-rules.json")
PATTERNS = {group: {key: re.compile(pattern, re.I) for key, pattern in rules.items()}
            for group, rules in RULES.items() if group in ("explicit", "possible")}


def hits(text, field, group):
    result = []
    for rule, pattern in PATTERNS[group].items():
        for match in pattern.finditer(text):
            result.append({"rule": rule, "field": field, "term": match.group(),
                           "start": match.start(), "end": match.end(),
                           "context": text[max(0, match.start()-80):min(len(text), match.end()+100)]})
    return result


def classify(record, position):
    description = record.get("description") or ""
    field = "description"
    correction = None
    if record.get("source") == "antler" and description.strip() == (record.get("name") or "").strip():
        description = record.get("location") or ""
        field = "location"
        correction = "Antler description equals name; used location as product description."
    strong = hits(description, field, "explicit")
    weak = hits(description, field, "possible")
    name = record.get("name") or ""
    # Keywords occurring only inside company names do not prove product functionality.
    names = [name]
    old = re.search(r"fka\s+([^()]+)", name, re.I)
    if old:
        names += [old.group(1).strip(), re.split(r"\s*\(", name)[0]]
    spans = [(m.start(), m.end()) for alias in names if alias for m in re.finditer(re.escape(alias), description, re.I)]
    retained = []
    for hit in strong:
        if hit["rule"] == "ai" and any(start <= hit["start"] and hit["end"] <= end for start, end in spans):
            weak.append({**hit, "reason": "AI appears within company name, not a product claim."})
        else:
            retained.append(hit)
    strong = retained
    weak += [{**h, "reason": "Company name signal only."} for h in hits(name, "name", "explicit")]
    for index, tag in enumerate(record.get("tags") or []):
        weak += [{**h, "reason": "Upstream tag only."} for h in hits(tag, f"tags[{index}]", "explicit")]
    try:
        host = urlparse(record.get("website") or "").hostname or ""
    except ValueError:
        host = ""
    if host.lower().endswith(".ai"):
        weak.append({"rule": "ai_domain", "field": "website", "term": host,
                     "context": record["website"], "reason": ".ai domain is a weak clue, not proof."})
    category = "explicit" if strong else "possible" if weak else "no_evidence"
    return {"id": f"upstream-{position:05d}", "upstream_position": position,
            "name": name, "source": record.get("source"), "category": category,
            "effective_description": description, "description_field": field,
            "field_correction": correction, "strong_evidence": strong, "weak_evidence": weak,
            "external_verification": "not_performed", "original_record": record}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    before = SOURCE.read_bytes()
    digest = hashlib.sha256(before).hexdigest()
    manifest = load(SOURCE.with_name("manifest.json"))
    assert digest == manifest["sha256"]
    raw = json.loads(before)
    results = [classify(record, i) for i, record in enumerate(raw)]
    groups = {key: [r for r in results if r["category"] == key]
              for key in ("explicit", "possible", "no_evidence")}
    assert sum(map(len, groups.values())) == len(raw)
    for key, rows in groups.items():
        save(f"{key}.json", rows)
    # Convenient standalone raw-shaped collection; evidence remains in explicit.json.
    save("ai-startups.json", [r["original_record"] for r in groups["explicit"]])
    metadata = {
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "source_file": str(SOURCE.relative_to(ROOT)), "source_sha256": digest,
        "rules_version": RULES["version"],
        "rules_sha256": hashlib.sha256((ROOT / "config/ai-filter-rules.json").read_bytes()).hexdigest(),
        "unit": "source records, not deduplicated companies", "total": len(raw),
        "counts": {key: len(rows) for key, rows in groups.items()},
        "by_source": {source: dict(Counter(r["category"] for r in results if r["source"] == source))
                      for source in sorted({r["source"] for r in results})},
        "field_corrections": sum(bool(r["field_correction"]) for r in results),
        "explicit_rule_counts": dict(Counter(rule for r in groups["explicit"] for rule in {h["rule"] for h in r["strong_evidence"]})),
        "policy": RULES["policy"],
    }
    save("summary.json", metadata)
    save("rules.json", RULES)
    # Reproducible random inspection set: not an accuracy benchmark.
    rng = random.Random(42)
    review = {key: rng.sample(rows, min(20, len(rows))) for key, rows in groups.items()}
    save("spot-check.json", review)
    sample_manifest = load(ROOT / "data/raw/sample-manifest.json")
    audit = load(ROOT / "data/processed/companies/sample-100-ai-audit.json")
    previous = {r["id"]: category for category, entries in audit["groups"].items() for r in entries}
    comparison = []
    for entry in sample_manifest["sample_indices"]:
        pos = entry["sample_position"]
        result = results[entry["upstream_position"]]
        assert result["name"] == entry["name"]
        comparison.append({"sample_position": pos, "name": result["name"],
                           "previous": previous[f"sample-{pos:03d}"], "current": result["category"]})
    save("sample-100-comparison.json", comparison)
    assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == digest
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
