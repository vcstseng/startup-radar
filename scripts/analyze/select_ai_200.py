"""Select a reproducible source-proportional 200-record AI review sample."""
import hashlib
import json
import math
import random
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "data/processed/ai-filter/full-20261101T150331066Z/explicit.json"
OUT = ROOT / "data/processed/companies/ai-review-200"


def main():
    payload = SOURCE.read_bytes()
    records = json.loads(payload)
    counts = Counter(r["source"] for r in records)
    exact = {s: 200 * n / len(records) for s, n in counts.items()}
    allocation = {s: math.floor(n) for s, n in exact.items()}
    for source in sorted(counts, key=lambda s: (-(exact[s] - allocation[s]), s))[:200-sum(allocation.values())]:
        allocation[source] += 1
    rng = random.Random(42)
    selected = []
    for source in sorted(allocation):
        pool = [r for r in records if r["source"] == source]
        for record in sorted(rng.sample(pool, allocation[source]), key=lambda r: r["upstream_position"]):
            selected.append({"review_position": len(selected), **record})
    assert len(selected) == 200 and len({r["id"] for r in selected}) == 200
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "sample.json").write_text(json.dumps(selected, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    manifest = {"seed": 42, "population_records": len(records), "sample_records": len(selected),
                "method": "source-proportional stratified random sample; largest-remainder allocation; no company deduplication",
                "input": str(SOURCE.relative_to(ROOT)), "input_sha256": hashlib.sha256(payload).hexdigest(),
                "population_counts": dict(sorted(counts.items())), "sample_counts": dict(sorted(allocation.items())),
                "sample_ids": [r["id"] for r in selected]}
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    print(json.dumps(manifest["sample_counts"]))


if __name__ == "__main__":
    main()
