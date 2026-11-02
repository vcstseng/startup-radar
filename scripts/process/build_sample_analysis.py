"""Compile the manually reviewed local sample; no network calls or auto-invented tags."""
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(relative):
    return json.loads((ROOT / relative).read_text(encoding="utf-8-sig"))


def write(relative, value):
    path = ROOT / relative
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    raw_path = ROOT / "data/raw/startups-sample-100.json"
    raw = read("data/raw/startups-sample-100.json")
    first = read("data/processed/companies/sample-first-5.json")
    annotations = read("config/taxonomy/sample-annotations.json")["rows"]
    digest = hashlib.sha256(raw_path.read_bytes()).hexdigest()
    assert digest == first["source_file_sha256"], "Source changed; review annotations before compiling."
    assert len(raw) == 100 and len(annotations) == 95
    assert [row[0] for row in annotations] == list(range(5, 100))
    status_names = {"clear": "清楚", "partial": "部分清楚", "review": "待確認"}
    records = []
    for i, original in enumerate(raw):
        if i < 5:
            reviewed = first["companies"][i]
            assert reviewed["name"] == original["name"]
            summary, tags, notes = reviewed["summary_zh"], reviewed["tags"], reviewed["notes"]
            quality = {0: "review", 1: "clear", 2: "partial", 3: "review", 4: "clear"}[i]
        else:
            pos, summary, industry, problem, solution, quality, note = annotations[i - 5]
            assert pos == i and quality in status_names
            tags = dict(industry_customer=industry, problem_workflow=problem, solution=solution)
            notes = [note] if note else []
        field = "location" if original["source"] == "antler" else "description"
        if field == "location":
            notes = ["Antler 介紹誤放 location，本次從該欄讀取；原始資料不改動。", *notes]
        for values in tags.values():
            assert isinstance(values, list) and len(values) <= 3
        records.append({
            "id": f"sample-{i:03d}", "sample_position": i,
            "name": original["name"], "source": original["source"],
            "website": original.get("website") or None,
            "summary_zh": summary, "tags": tags,
            "quality": quality, "quality_label": status_names[quality],
            "review_status": first["companies"][i]["review_status"] if i < 5 else quality,
            "eligible_for_specific_groups": quality == "clear",
            "eligible_for_broad_groups": quality != "review",
            "external_verification": "not_performed", "notes": notes,
            "evidence": {"field": field, "text": original[field]},
            "original_tags": original.get("tags", []),
            "original_record": original,
        })
    metadata = {
        "schema_version": "0.2", "taxonomy_version": "draft-0.1",
        "source_file": "data/raw/startups-sample-100.json", "source_file_sha256": digest,
        "scope": "本機100筆逐筆描述分析，未上網查證，未下載全量；可用程度不代表公司真實性或產品成效。",
        "quality_definitions": {
            "clear": "描述足以形成相對具體的領域／問題／解法組合；客群可能僅知領域，實際買方不一定明確。",
            "partial": "可辨識部分方向，但問題、產品形式或實際工作流程仍模糊。",
            "review": "公司身分與描述關係未確認，或文字過於含糊，暫不參與方向統計。",
        },
        "inference_policy": "允許描述直接支持的概括及少量情境推測，重要推測在 notes 標示；不是每個 tag 都已查證。",
    }
    write("data/processed/companies/sample-100.json", {**metadata, "companies": records})

    # Explicit editorial group membership, with reviewed companies excluded.
    definitions = [
        ("專業領域 AI 工作工具", "AI 切入具體專業任務，並非所有案例都能完成整個流程。", [4, 16, 19, 21, 28, 47, 63, 71, 85, 91]),
        ("除錯、安全與可信任性", "定位錯誤、測試安全及驗證文件等不同任務。", [22, 59, 67, 74, 86]),
        ("餐飲經營", "咖啡店營運、餐廳採購與動態定價是不同切入點。", [15, 60, 61]),
        ("醫療與照護工作", "紀錄、實驗室、照護協調與診斷資料處理。", [21, 45, 47, 54, 63, 66, 85]),
        ("銷售與行銷工作", "來電歸因、開發、資訊整合及會議轉換。", [5, 18, 57, 73, 77, 92]),
        ("工業與實體作業", "探勘、檢查、車輛操作、機器人導航及工廠營運。", [4, 6, 7, 55, 58, 65, 75, 94, 99]),
        ("資源效率與永續", "輕量太陽能、農作物氮效率、碳捕集與轉化等不同技術路線。", [43, 70, 98]),
        ("人力與員工服務", "招募、員工投入、心理健康及彈性用工。", [9, 27, 33, 35, 37, 56, 72]),
    ]
    groups = []
    for title, interpretation, positions in definitions:
        members = [records[i] for i in positions]
        assert all(r["quality"] != "review" for r in members)
        groups.append({"title": title, "interpretation": interpretation,
                       "status": "candidate_direction_not_temporal_trend",
                       "members": [{"id": r["id"], "name": r["name"], "quality": r["quality"]} for r in members],
                       "count": len(members), "clear_count": sum(r["quality"] == "clear" for r in members),
                       "source_count": len({r["source"] for r in members})})
    write("data/processed/trends/sample-100-candidate-groups.json", {
        "scope": "人工挑選的重疊題目群，並非窮盡分類、排名、成長證據或市場需求驗證。部分清楚案例只作粗方向線索。",
        "groups": groups,
    })
    counts = Counter(r["quality"] for r in records)
    source_counts = {}
    for source in sorted({r["source"] for r in records}):
        subset = [r for r in records if r["source"] == source]
        source_counts[source] = {"total": len(subset), **{k: sum(r["quality"] == k for r in subset) for k in status_names}}
    write("data/processed/companies/sample-100-summary.json", {
        **metadata, "total": len(records), "quality_counts": dict(counts),
        "by_source": source_counts,
        "missing_website": sum(not r["website"] for r in records),
        "empty_tag_dimensions": {key: sum(not r["tags"][key] for r in records) for key in records[0]["tags"]},
        "review_companies": [r["name"] for r in records if r["quality"] == "review"],
    })
    lines = ["# 本機 100 筆試標結果", "", metadata["scope"], "",
             "可用程度是描述是否足以分類的人工判斷，不是正確率，也不代表產品已驗證。樣本按來源等量分層，比例不能外推至兩萬筆名錄或市場。", "",
             "## 可用程度", "", "| 狀態 | 筆數 | 用法 |", "|---|---:|---|",
             f"| 清楚 | {counts['clear']} | 可參與相對具體的問題分群 |",
             f"| 部分清楚 | {counts['partial']} | 只支援描述足夠的粗方向 |",
             f"| 待確認 | {counts['review']} | 保留紀錄，暫不支持方向統計 |", "",
             "## 各來源", "", "| 來源 | 總數 | 清楚 | 部分清楚 | 待確認 |", "|---|---:|---:|---:|---:|"]
    for source, c in source_counts.items():
        lines.append(f"| {source} | {c['total']} | {c['clear']} | {c['partial']} | {c['review']} |")
    lines += ["", "## 可討論的方向", "", "以下為人工挑選、彼此重疊的群組，不是趨勢熱度排名。", "",
              "| 方向 | 案例數 | 其中清楚 | 來源數 | 案例 |", "|---|---:|---:|---:|---|"]
    for g in groups:
        lines.append(f"| {g['title']} | {g['count']} | {g['clear_count']} | {g['source_count']} | " + "、".join(m["name"] for m in g["members"]) + " |")
    lines += ["", "## 是否繼續的討論依據", "",
              "- 這份資料能形成具體研究線索，但部分記錄只有產業或技術方向，不能強行產出詳細痛點。",
              "- 來源缺網址不等於不能分類，例如 EF 的 Kiroku、Flynt 仍有清楚任務。",
              "- 身分疑點暫停使用；已有 fka 說明的 Kav AI 不因舊名而自動排除。",
              "- 未填滿的 tags 留空；上游 AI、產業與地理欄位不直接當可信證據。",
              "- 目前 tags 是試標用自由詞彙，仍有粗細不一和近義詞；不應直接拿原始 tag 頻率排行當首頁。",
              "- 若繼續，先決定保留哪些問題維度及可公開的觀察，再設計全量流程。本輪不下載、不查官網、不建站。",
              "", "## 全部公司", "",
              "編號採檔案順序，從 1 開始；JSON sample_position 從 0 開始。", "",
              "| # | 公司 | 可用程度 | 摘要 | 產業／客群 | 問題／工作環節 | 解法 | 限制 |",
              "|---:|---|---|---|---|---|---|---|"]
    def cell(value):
        return value.replace("|", "／").replace("\n", " ")
    for r in records:
        tag_cells = ["、".join(r["tags"][k]) or "資訊不足" for k in ("industry_customer", "problem_workflow", "solution")]
        cells = [str(r["sample_position"] + 1), r["name"], r["quality_label"], r["summary_zh"], *tag_cells, "；".join(r["notes"]) or "—"]
        lines.append("| " + " | ".join(cell(x) for x in cells) + " |")
    (ROOT / "docs/sample-100-analysis.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"total": len(records), "quality_counts": dict(counts), "by_source": source_counts,
                      "outputs": ["sample-100.json", "sample-100-summary.json", "sample-100-candidate-groups.json", "docs/sample-100-analysis.md"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
