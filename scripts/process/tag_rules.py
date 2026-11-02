"""Small exact-match tag cleanup shared by batch compilers."""
import json
from pathlib import Path

RULES = json.loads((Path(__file__).resolve().parents[2] / "config/taxonomy/tag-aliases.json").read_text(encoding="utf-8-sig"))


def normalize_company(company):
    changes = []
    ambiguous = {t.casefold() for t in RULES["ambiguous_raw_tags"]}
    for dimension, before in company["tags"].items():
        aliases = RULES["aliases"][dimension]
        after = list(dict.fromkeys(aliases.get(t, t) for t in before if t.casefold() not in ambiguous))
        if before != after:
            changes.append({"id": company["id"], "dimension": dimension, "before": before, "after": after})
            company["tags"][dimension] = after
    return changes
