"""Convert the existing reviewed 200 records to the agreed lightweight format.

This does not query external sources or start a new review round. Earlier files
are preserved. Corrections below remove interpretations beyond the raw text.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from tag_rules import normalize_company

ROOT = Path(__file__).resolve().parents[2]
OLD = ROOT / "data/processed/companies/ai-review-200/companies.json"
RAW = "data/raw/snapshots/full-20261101T150331066Z/all.json"
POPULATION = "data/processed/ai-filter/full-20261101T150331066Z/explicit.json"
OUT = ROOT / "data/processed/companies/batches"

# Keyed by existing review_position, guarded by expected name.
# Tag keys below replace just that dimension; omitted dimensions remain intact.
CORRECTIONS = {
    15: ("The Cognity", {"industry_customer": ["教育", "自閉症者"]}),
    35: ("Wubble.ai", {"problem_workflow": [], "notes": ["原文只說音樂與音訊平台，未說明製作、授權或其他具體工作。"]}),
    56: ("Tiwaki", {"industry_customer": [], "notes": ["未說明可用產品與服務對象。"]}),
    66: ("Procuro", {"industry_customer": [], "notes": []}),
    68: ("Nexxa.ai", {"problem_workflow": ["工作流程自動化", "工具整合"]}),
    73: ("Celus", {"industry_customer": ["電子設計"]}),
    75: ("Javelin", {"industry_customer": ["企業"]}),
    81: ("Perch", {"problem_workflow": ["運動安全", "運動效果"], "notes": []}),
    84: ("Roby", {"industry_customer": ["辦公室"], "problem_workflow": [], "notes": ["未說明 service hub 涵蓋哪些服務。"]}),
    86: ("Qluu", {"industry_customer": [], "notes": ["未說明實際採購者。"]}),
    88: ("BeneKinetic", {"industry_customer": ["醫療", "醫療支付方"]}),
    94: ("Xolani.Health", {"summary_zh": "以 AI 協助放射科醫師選擇個人化病人方案。", "problem_workflow": ["病人方案選擇"], "notes": ["原文 protocol 的具體內容未說明，不限定為檢查方案。"]}),
    98: ("Inner Peak AI", {"notes": ["描述使用 Peak 名稱，與名錄 Inner Peak AI 的關係未確認。"]}),
    104: ("Oceanciews", {"notes": ["公司名稱為 Oceanciews，描述中的產品名稱為 Oceanviews AI；關係未確認。"]}),
    110: ("VAUX", {"industry_customer": ["音訊技術"]}),
    112: ("Sage Hero", {"summary_zh": "為企業提供客製化且有引導的培訓課程。", "problem_workflow": ["培訓課程"], "notes": ["deep learning 可能指技術或教學語彙，無法確認 AI 關聯。"]}),
    123: ("Synkrino Biotherapeutics", {"summary_zh": "提供名為 SATIS 的 AI 探索系統；介紹截斷。", "industry_customer": [], "problem_workflow": [], "notes": ["介紹截斷，未說明探索對象與應用領域。"]}),
    129: ("Biodock", {"industry_customer": [], "problem_workflow": ["顯微作業自動化"], "solution": ["雲端 AI"], "summary_zh": "提供雲端 AI 顯微作業自動化。", "notes": ["原文只有 Cloud AI microscopy automation，未明示醫療用途或影像分析功能。"]}),
    130: ("Rejoy Health", {"summary_zh": "以 AI workers 為臨床人員執行預約、紀錄、編碼、解讀與問答。", "problem_workflow": ["預約", "紀錄製作"], "notes": ["code 與 interpret 的具體涵義未說明，不推定為醫療編碼或影像判讀。"]}),
    144: ("Variance", {"industry_customer": [], "notes": ["原文未說明服務產業與實際使用者。"]}),
    146: ("Finic", {"solution": ["AI"], "notes": ["未說明防詐技術或工作流程。"]}),
    156: ("Entangl", {"industry_customer": ["資料中心"]}),
    158: ("SchemeFlow", {"industry_customer": ["工程", "環境審查"], "notes": []}),
    159: ("Handled", {"industry_customer": ["消費品牌", "財務營運團隊"]}),
    167: ("Codevisor", {"summary_zh": "提供面向 agentic engineering 的原生應用。", "industry_customer": [], "problem_workflow": [], "solution": ["原生應用"], "notes": ["原文未說明 agentic engineering 的範圍與具體功能。"]}),
    188: ("Revnu", {"summary_zh": "以 AI growth hire 為產品定位。", "industry_customer": [], "problem_workflow": [], "solution": [], "notes": ["原文只有 Your AI growth hire，未說明職務、產品形式與工作。"]}),
    190: ("Stoa", {"summary_zh": "以 AI 硬體市場為定位。", "problem_workflow": [], "notes": ["market 可能指交易平台或市場資訊，產品形式未明。"]}),
    199: ("Aikido Technologies", {"industry_customer": ["AI 基礎設施"], "notes": ["服務 AI 運算，不代表設施營運本身使用 AI；clean 是原文訴求。"]}),
}


def load(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    old_hash = digest(OLD)
    old = load(OLD)["companies"]
    manifest = load(OLD.with_name("manifest.json"))
    raw_manifest = load((ROOT / RAW).with_name("manifest.json"))
    assert digest(ROOT / POPULATION) == manifest["input_sha256"]
    assert digest(ROOT / RAW) == raw_manifest["sha256"]
    population = load(ROOT / POPULATION)
    raw = load(ROOT / RAW)
    allowed = {r["id"] for r in population}
    assert len(old) == 200 and len({r["id"] for r in old}) == 200
    rows = []
    for r in old:
        assert r["id"] in allowed
        assert r["original_record"] == raw[r["upstream_position"]]
        assert r["evidence"]["text"] == raw[r["upstream_position"]][r["evidence"]["field"]]
        notes = list(dict.fromkeys([text for text in [r["notes"], *r["flags"]] if text]))
        company = {"id": r["id"], "name": r["name"], "summary_zh": r["summary_zh"],
                   "tags": {k: list(v) for k, v in r["tags"].items()},
                   "evidence": dict(r["evidence"]), "notes": notes}
        if r["review_position"] in CORRECTIONS:
            expected, changes = CORRECTIONS[r["review_position"]]
            assert r["name"] == expected
            for key, value in changes.items():
                if key in company["tags"]:
                    company["tags"][key] = value
                elif key == "notes":
                    company["notes"] = list(dict.fromkeys([*value, *r["flags"]]))
                else:
                    company[key] = value
        normalize_company(company)
        rows.append(company)
    batch = {"schema_version": "1.0", "round": 1, "source_file": RAW, "companies": rows}
    ids = [r["id"] for r in rows]
    assert ids == manifest["sample_ids"]
    OUT.mkdir(parents=True, exist_ok=True)
    progress_path = OUT / "progress.json"
    progress = load(progress_path) if progress_path.exists() else {
        "schema_version": "1.0", "source_file": POPULATION,
        "source_sha256": digest(ROOT / POPULATION), "raw_file": RAW,
        "raw_sha256": digest(ROOT / RAW), "total_records": len(population),
        "batch_size": 200, "rounds": []}
    assert progress["source_sha256"] == digest(ROOT / POPULATION)
    assert progress["raw_sha256"] == digest(ROOT / RAW)
    other_rounds = [entry for entry in progress["rounds"] if entry["round"] != 1]
    other_ids = [i for entry in other_rounds for i in entry["company_ids"]]
    assert not set(ids) & set(other_ids), "Round 1 overlaps existing later rounds."
    assert len(other_ids) == len(set(other_ids))
    assert set(other_ids) <= allowed
    filename = OUT / "round-001.json"
    output = json.dumps(batch, ensure_ascii=False, indent=2) + "\n"
    previous_round = next((entry for entry in progress["rounds"] if entry["round"] == 1), None)
    entry = {"round": 1, "file": str(filename.relative_to(ROOT)).replace("\\", "/"),
             "status": "completed", "record_count": len(rows), "company_ids": ids,
             "completed_at_utc": previous_round["completed_at_utc"] if previous_round else datetime.now(timezone.utc).isoformat(),
             "sha256": hashlib.sha256(output.encode("utf-8")).hexdigest()}
    progress["rounds"] = sorted([entry, *other_rounds], key=lambda r: r["round"])
    progress["completed_records"] = len(ids) + len(other_ids)
    progress["remaining_records"] = len(population) - progress["completed_records"]
    completed_numbers = {entry["round"] for entry in progress["rounds"]}
    next_round = 1
    while next_round in completed_numbers:
        next_round += 1
    progress["next_round"] = next_round
    filename.write_text(output, encoding="utf-8", newline="\n")
    progress_path.write_text(json.dumps(progress, ensure_ascii=False, indent=2)+"\n", encoding="utf-8", newline="\n")
    assert digest(OLD) == old_hash
    print(json.dumps({"round": 1, "records": len(rows), "conservatively_corrected_records": len(CORRECTIONS),
                      "completed": progress["completed_records"], "remaining": progress["remaining_records"],
                      "next_round": progress["next_round"], "batch_file": entry["file"]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
