"""Compile human-reviewed tags and editorial direction cards for the AI 200 sample."""
import hashlib
import json
import re
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data/processed/companies/ai-review-200"


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")


def main():
    sample = load(OUT / "sample.json")
    manifest = load(OUT / "manifest.json")
    source = ROOT / manifest["input"]
    assert hashlib.sha256(source.read_bytes()).hexdigest() == manifest["input_sha256"]
    annotations = load(ROOT / "config/taxonomy/ai-200-annotations.json")
    assert hashlib.sha256((OUT / "sample.json").read_bytes()).hexdigest() == annotations["sample_sha256"], "Sample changed; review annotations before compiling."
    rows = annotations["rows"]
    assert len(rows) == len(sample) == 200
    assert [r[0] for r in rows] == list(range(200))
    role_labels = {"use_ai": "使用 AI", "enable_ai": "AI 工具／基礎設施", "adjacent_ai": "AI 產業周邊", "unclear": "角色不明"}
    quality_labels = {"clear": "清楚", "partial": "部分清楚", "review": "待確認"}
    records = []
    for row, original in zip(rows, sample):
        i, summary, industry, problem, solution, role, quality, notes = row
        assert i == original["review_position"] and role in role_labels and quality in quality_labels
        tags = {key: text.split("、") if text else [] for key, text in zip(
            ("industry_customer", "problem_workflow", "solution"), (industry, problem, solution))}
        assert all(len(values) <= 3 for values in tags.values())
        flags = []
        if original["field_correction"]:
            flags.append("介紹從 location 讀取；原始欄位不改。")
        if "…" in original["effective_description"]:
            flags.append("介紹含省略號，可能截斷。")
        if "\ufffd" in original["effective_description"]:
            flags.append("原文含編碼損壞字元。")
        records.append({"id": original["id"], "review_position": i,
                        "name": original["name"], "source": original["source"],
                        "upstream_position": original["upstream_position"],
                        "summary_zh": summary, "tags": tags, "ai_role": role,
                        "ai_role_label": role_labels[role], "quality": quality,
                        "quality_label": quality_labels[quality], "notes": notes,
                        "flags": flags, "external_verification": "not_performed",
                        "evidence": {"field": original["description_field"], "text": original["effective_description"]},
                        "original_record": original["original_record"]})
    definitions = load(ROOT / "config/taxonomy/ai-200-directions.json")
    directions = []
    for d in definitions["directions"]:
        members = [records[i] for i in d["positions"]]
        assert all(r["quality"] != "review" for r in members)
        assert set(d["examples"]) <= set(d["positions"])
        examples = [records[i] for i in d["examples"]]
        directions.append({**d, "status": "candidate_observation_not_growth_trend",
                           "selected_case_count": len(members),
                           "clear_case_count": sum(r["quality"] == "clear" for r in members),
                           "source_count": len({r["source"] for r in members}),
                           "members": [{"id": r["id"], "name": r["name"], "quality": r["quality"]} for r in members],
                           "example_cards": [{"id": r["id"], "name": r["name"], "summary_zh": r["summary_zh"],
                                              "evidence": r["evidence"]} for r in examples]})
    # Flag candidate duplicates; no automatic merges across brands or domains.
    duplicates = []
    for key in ("name", "domain"):
        groups = {}
        for r in records:
            value = re.sub(r"\W+", "", r["name"].lower()) if key == "name" else (urlparse(r["original_record"].get("website") or "").hostname or "").lower().removeprefix("www.")
            if value:
                groups.setdefault(value, []).append(r["id"])
        duplicates += [{"kind": key, "value": value, "ids": ids} for value, ids in groups.items() if len(ids) > 1]
    summary = {
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "sample_records": 200, "sampling": manifest,
        "annotation_sha256": hashlib.sha256((ROOT / "config/taxonomy/ai-200-annotations.json").read_bytes()).hexdigest(),
        "scope": annotations["scope"], "role_definitions": annotations["role_definitions"],
        "quality_definitions": annotations["quality_definitions"],
        "quality_counts": dict(Counter(r["quality"] for r in records)),
        "ai_role_counts": dict(Counter(r["ai_role"] for r in records)),
        "by_source": {s: {"total": sum(r["source"] == s for r in records),
                          "quality": dict(Counter(r["quality"] for r in records if r["source"] == s))}
                      for s in sorted({r["source"] for r in records})},
        "empty_dimensions": {k: sum(not r["tags"][k] for r in records) for k in records[0]["tags"]},
        "candidate_duplicates": duplicates,
        "role_quality_cross_table": {role: dict(Counter(r["quality"] for r in records if r["ai_role"] == role)) for role in role_labels},
        "suspected_filter_boundaries": [{"id": records[i]["id"], "name": records[i]["name"], "notes": records[i]["notes"]} for i in [72,112]],
        "limitations": ["200 source records, not verified unique companies; possible cross-source duplication remains.",
                        "Source-proportional sample of the explicit keyword group only; excludes the possible group.",
                        "No external validation, revenue, growth or market-demand evidence.",
                        "Draft tags mix broad and specific terms; frequency is not a market popularity ranking.",
                        "Direction memberships are editorial overlapping subsets, not an exhaustive classification."]}
    write(OUT / "companies.json", {"taxonomy_version": annotations["version"], "scope": annotations["scope"], "companies": records})
    write(OUT / "summary.json", summary)
    write(ROOT / "data/processed/trends/ai-200-directions.json", {"scope": definitions["scope"], "directions": directions})
    vocabulary = {}
    for key in records[0]["tags"]:
        c = Counter(t for r in records for t in r["tags"][key])
        vocabulary[key] = [{"tag": t, "sample_record_count": n} for t, n in sorted(c.items(), key=lambda x: (-x[1], x[0]))]
    write(OUT / "draft-tags.json", {"warning": "試標詞彙清單，尚未定版；頻率不是市場熱度。", "dimensions": vocabulary})
    lines = ["# AI 200 筆閱讀與試標", "", "## 範圍與抽樣", "",
             "從第一輪有明確 AI 線索的 4,085 筆中，按來源比例分層隨機抽樣 200 筆；種子 42，最大餘數法分配。尚未公司去重、查官網或驗證產品。", "",
             "已逐筆閱讀有效描述，產出中文摘要、三維 tags、AI 主要角色、資訊可用程度與限制。資訊不足允許留空；AI 角色及品質均為人工暫定判斷。", "",
             "## 可用程度", "", "| 狀態 | 筆數 |", "|---|---:|"]
    for key, label in quality_labels.items():
        lines.append(f"| {label} | {summary['quality_counts'].get(key,0)} |")
    lines += ["", "## AI 主要角色", "", "角色只代表描述中的主要定位；使用 AI 與提供 AI 工具可能重疊。", "", "| 角色 | 筆數 |", "|---|---:|"]
    for key, label in role_labels.items():
        lines.append(f"| {label} | {summary['ai_role_counts'].get(key,0)} |")
    lines += ["", "## 來源分布", "", "| 來源 | 母體筆數 | 抽樣筆數 |", "|---|---:|---:|"]
    for s, n in manifest["sample_counts"].items():
        lines.append(f"| {s} | {manifest['population_counts'][s]} | {n} |")
    lines += ["", "## 候選方向卡片", "", definitions["scope"], ""]
    for d in directions:
        lines += [f"### {d['title']}", "", d["observation"], "",
                  f"挑選案例 {d['selected_case_count']} 筆，其中資訊清楚 {d['clear_case_count']} 筆，來自 {d['source_count']} 個來源。", ""]
        for r in d["example_cards"]:
            lines.append(f"- **{r['name']}**：{r['summary_zh']}")
        lines += ["", "可研究的 idea："+d["idea"], "", "待確認："+d["unknowns"], ""]
    lines += ["## 兩個第一輪篩選邊界", "",
              "- renatus robotics：AI 出現在母集團的介紹，不能確認自動化倉庫本身使用 AI；列為待確認。",
              "- Sage Hero：deep learning 也可能是教學語彙，不足以確定神經網路技術；保留部分資訊，但 AI 角色不明。",
              "", "這兩筆是閱讀時發現的疑點，不是經外部確認的錯誤率；不擅自修改 4,085 筆主檔。", "",
              "## 判斷與下一步", "",
              "資料足以產出有案例支撐的方向卡片，但不足以證明時間成長、市場需求或台灣缺口。短描述仍能辨認具體任務；泛用 AI 平台或 workforce 口號則常只能粗分。", "",
              "建議先討論上述卡片哪些值得保留，再為每張選 2–3 家代表公司補查。若要擴到 4,085 筆，應先整理問題／工作環節的共同詞彙及 AI 角色邊界，而非直接以自由 tags 做排行。", "",
              f"同名／同網域疑似重複組數：{len(duplicates)}；這只是簡單比對，不能排除別名與跨來源重複。", "",
              "## 全部 200 筆", "",
              "表格編號從 1 開始，JSON review_position 從 0 開始。原文、上游位置與原始紀錄保存在 companies.json。", "",
              "| # | 公司 | 摘要 | 產業／客群 | 問題／工作環節 | 解法 | AI 角色 | 可用程度 | 限制 |",
              "|---:|---|---|---|---|---|---|---|---|"]
    def cell(text):
        return text.replace("|", "／").replace("\n", " ")
    for r in records:
        values = [str(r["review_position"]+1), r["name"], r["summary_zh"],
                  *["、".join(r["tags"][key]) or "資訊不足" for key in ("industry_customer", "problem_workflow", "solution")],
                  r["ai_role_label"], r["quality_label"], "；".join([r["notes"], *r["flags"]]).strip("；") or "—"]
        lines.append("| " + " | ".join(cell(v) for v in values) + " |")
    (ROOT / "docs/ai-200-analysis.md").write_text("\n".join(lines)+"\n", encoding="utf-8")
    print(json.dumps({k:summary[k] for k in ("sample_records","quality_counts","ai_role_counts","empty_dimensions","candidate_duplicates")},ensure_ascii=False,indent=2))
    print(json.dumps([{k:d[k] for k in ('title','selected_case_count','clear_case_count','source_count')} for d in directions],ensure_ascii=False,indent=2))


if __name__ == "__main__":
    main()
