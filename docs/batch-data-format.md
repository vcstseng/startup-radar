# 每輪 200 筆：輕量資料格式

## 現在進度

逐筆階段完成後，使用者另授權接續彙整，見 `docs/overview-review.md`。衍生同義詞、重複候選及主題案例另存在 `data/processed/overview/v1/`，不改動本頁所述 schema 1.0 或 21 輪正式資料。下列輪次紀錄保留完成當時狀態。

全部 4,085 筆已完成輕量分類，共 21 輪，均未查官網。每輪開始先讀根目錄 `AGENTS.md` 與進度，做完更新 docs；一般資訊不足留空。本次使用者指定一次做完最後 285 筆，仍以第 20 輪 200 筆及第 21 輪 85 筆保存。主題整理及 high-level view 尚未開始，待下一階段討論。

- 母體：第一輪 AI 規則篩選入選的 4,085 筆原始紀錄；不是去重後公司數。
- 已完成：4,085 筆（round 1–21）。
- 剩餘：0 筆。
- 下一輪：無，母體已全部完成。
- 保存方式：前 20 輪各 200 筆，最後第 21 輪 85 筆。

之後以 `data/processed/companies/batches/progress.json` 的實際紀錄為準，本頁數字是第二十一輪完成時的狀態。

## 檔案

- `data/processed/companies/batches/round-001.json`：第一輪的正式輕量資料。
- `data/processed/companies/batches/round-002.json`：第二輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-002-review/`。
- `data/processed/companies/batches/round-003.json`：第三輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-003-review/`。
- `data/processed/companies/batches/round-004.json`：第四輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-004-review/`。
- `data/processed/companies/batches/round-005.json`：第五輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-005-review/`。
- `data/processed/companies/batches/round-006.json`：第六輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-006-review/`。
- `data/processed/companies/batches/round-007.json`：第七輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-007-review/`。
- `data/processed/companies/batches/round-008.json`：第八輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-008-review/`。
- `data/processed/companies/batches/round-009.json`：第九輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-009-review/`。
- `data/processed/companies/batches/round-010.json`：第十輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-010-review/`。
- `data/processed/companies/batches/round-011.json`：第十一輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-011-review/`。
- `data/processed/companies/batches/round-012.json`：第十二輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-012-review/`。
- `data/processed/companies/batches/round-013.json`：第十三輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-013-review/`。
- `data/processed/companies/batches/round-014.json`：第十四輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-014-review/`。
- `data/processed/companies/batches/round-015.json`：第十五輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-015-review/`。
- `data/processed/companies/batches/round-016.json`：第十六輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-016-review/`。
- `data/processed/companies/batches/round-017.json`：第十七輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-017-review/`。
- `data/processed/companies/batches/round-018.json`：第十八輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-018-review/`。
- `data/processed/companies/batches/round-019.json`：第十九輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-019-review/`。
- `data/processed/companies/batches/round-020.json`：第二十輪的正式輕量資料；抽樣及閱讀輸入保存在 `data/processed/companies/round-020-review/`。
- `data/processed/companies/batches/round-021.json`：最後 85 筆正式輕量資料；閱讀輸入保存在 `data/processed/companies/round-021-review/`。
- 同資料夾的 `progress.json`：母體、來源雜湊、各輪檔案、完成 ID、筆數及下一輪。
- `config/schemas/company-batch.schema.json`：schema 1.0 的機器可讀定義。
- `data/processed/companies/ai-review-200/`：先前較詳細的分析，保留供回查，不再當作後續批次格式。

## 每輪格式

```json
{
  "schema_version": "1.0",
  "round": 1,
  "source_file": "data/raw/snapshots/full-20261101T150331066Z/all.json",
  "companies": [
    {
      "id": "upstream-12579",
      "name": "AiSensum",
      "summary_zh": "在既有系統內整合 AI 模組與資料自動化。",
      "tags": {
        "industry_customer": ["企業"],
        "problem_workflow": ["資料蒐集", "既有系統整合"],
        "solution": ["流程自動化", "AI 模組"]
      },
      "evidence": {
        "field": "description",
        "text": "此處保存完整原始介紹，不改寫或節錄。"
      },
      "notes": []
    }
  ]
}
```

上例只示範格式，evidence.text 的說明文字不是實際公司原文；正式檔案保存完整原文與必要註記。

## 填寫規則

- 摘要只改寫原文資訊；原文不足以摘要時使用 `null`，不使用字串 `"null"`。
- 三維 tags 分別是產業／客群、問題／工作環節、解法；每維最多 3 個，不明使用 `[]`。
- 不從公司名稱、上游產業標籤或常識推定產品功能、客群、技術與成效。
- 不把「AI 會計」補成記帳、報稅或對帳；不把未指明的 agentic engineering 自動當軟體開發。
- `evidence.text` 完整保留原文。`evidence.field` 目前為 `description` 或 `location`；Antler 從 location 讀到的產品介紹保留欄位出處。
- `notes` 為字串陣列，沒有必要註記時使用 `[]`。只記資訊不足、截斷、矛盾或欄位錯置等限制。
- 每筆不保存完整 raw record、品質分數、AI 角色或 trends／ideas。
- 這些摘要是對名錄文字的整理，不代表技術、合規、效益或產品現況已被查證。

## ID 與進度

`upstream-12579` 表示 `source_file` 中索引為 12579 的紀錄，從 0 開始。ID 僅在這份固定快照內穩定，不能直接套用到未來重新排序的下載檔案。

網站需要公司網址、來源或其他欄位時，依 ID 連回該 raw 快照。`progress.json` 保存快照和母體的 SHA-256，避免接錯資料。

每輪完成後，把該輪 `company_ids` 保存到進度紀錄。下一輪從母體排除所有 completed 輪次 ID 的聯集；不能只排除上一輪，也不能把試標的原始 100 筆另外算作已完成批次。跨來源同一公司去重尚未進行。

## 第一輪校正

200 筆都保留原 ID、順序、公司名稱與原文，28 筆的部分摘要、tags 或註記做保守校正。例如：

- Perch：移除原文未明說的動作評估。
- Rejoy Health：不把 code 直接判定為醫療編碼。
- Biodock：不從 microscopy 自動補成醫療用途或影像分析功能。
- Variance：移除推定的金融產業與風控使用者。
- Revnu：原文僅有 AI growth hire，不補上行銷流程與助理產品形式。
- Codevisor：保留 agentic engineering 用語，不推定為軟體開發工具。

先前 200 筆報告的品質統計、AI 角色與方向卡片保留為歷史探索，不重新寫成新版分類成果。網站和最後合併應使用 batches 下的輕量資料。

第一輪轉換程式：`python scripts/process/migrate_round_001.py`。只處理 round 1，保留舊分析及其他輪次紀錄；不是下一輪自動分類工具。

## 第二輪紀錄

第二輪從 3,885 筆未完成紀錄中，以種子 43 按剩餘來源比例抽出 200 筆。排除所有已完成 ID，未重新處理第一輪；原始同名但不同 ID 的公司紀錄不自動合併。

摘要不足使用 null：1 筆；產業／客群空值 20 筆、問題／工作環節空值原為 27 筆，移除模糊 tags 後為 29 筆；解法空值 5 筆。這些數字只表示哪些欄位缺乏足夠資訊，不是錯誤率。

詳見 `docs/round-002-log.md`。人工閱讀完成後，可用 `python scripts/process/build_light_batch.py 2` 重新編譯第二輪；此程式不會自動閱讀或產生分類，也不會啟動後續輪次。

## 同義詞與模糊詞處理

簡單對照表：`config/taxonomy/tag-aliases.json`。只做確定的同義詞統一，不把技術、產業與客群混為一類；模糊原文留在 evidence／notes，不作正式 tags。

本次前兩輪共改 9 筆：第一輪 6 筆統一 AI 資料分析／AI 分析、AI 流程自動化／AI 自動化；第二輪 3 筆移除缺乏語境的 community management、underwriting、collections tags。摘要、原文、名稱、ID、完成筆數不改。逐筆變更見 `docs/tag-cleanup-v1.json`，進度中的檔案雜湊已同步更新。

批次編譯與第一輪轉換程式皆套用相同對照，重跑不會還原已清理的 tags。第三輪已沿用此規則。

## 第三輪紀錄

第三輪從 3,685 筆剩餘紀錄中，以種子 44 按來源比例抽出 200 筆，排除前兩輪全部已完成 ID。

摘要 null 為 0 筆；產業／客群空值 23 筆、問題／工作環節空值 24 筆、解法空值 6 筆。空值不相加當作公司數。細節見 `docs/round-003-log.md`。

## 第四輪紀錄

依 AGENTS.md，從 3,485 筆剩餘紀錄中，以種子 45 按來源比例抽出 200 筆，排除前三輪全部已完成 ID。notes 只保留影響理解的限制，不重複填寫未查證說明；前三輪未因此重寫。

摘要 null 1 筆；產業／客群空值 11 筆、問題／工作環節空值 26 筆、解法空值 2 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-004-log.md`。

## 第五輪紀錄

依 AGENTS.md，從 3,285 筆剩餘紀錄中，以種子 46 按來源比例抽出 200 筆，排除前四輪全部已完成 ID。沿用 schema 1.0 與精簡 notes，不改前四輪。

摘要 null 3 筆；產業／客群空值 11 筆、問題／工作環節空值 31 筆、解法空值 1 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-005-log.md`。

## 第六輪紀錄

依 AGENTS.md，從 3,085 筆剩餘紀錄中，以種子 47 按來源比例抽出 200 筆，排除前五輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前五輪不改動。

摘要 null 4 筆；產業／客群空值 12 筆、問題／工作環節空值 34 筆、解法空值 7 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-006-log.md`。

## 第七輪紀錄

依 AGENTS.md，從 2,885 筆剩餘紀錄中，以種子 48 按來源比例抽出 200 筆，排除前六輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前六輪不改動。

摘要 null 1 筆；產業／客群空值 11 筆、問題／工作環節空值 24 筆、解法空值 5 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-007-log.md`。

## 第八輪紀錄

依 AGENTS.md，從 2,685 筆剩餘紀錄中，以種子 49 按來源比例抽出 200 筆，排除前七輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前七輪不改動；不提前建立 high-level view。

摘要 null 2 筆；產業／客群空值 9 筆、問題／工作環節空值 18 筆、解法空值 1 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-008-log.md`。

## 第九輪紀錄

依 AGENTS.md，從 2,485 筆剩餘紀錄中，以種子 50 按來源比例抽出 200 筆，排除前八輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前八輪不改動。

摘要 null 2 筆；產業／客群空值 6 筆、問題／工作環節空值 18 筆、解法空值 3 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-009-log.md`。

## 第十輪紀錄

依 AGENTS.md，從 2,285 筆剩餘紀錄中，以種子 51 按來源比例抽出 200 筆，排除前九輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前九輪不改動。

摘要 null 0 筆；產業／客群空值 2 筆、問題／工作環節空值 16 筆、解法空值 2 筆。可保留最小摘要不代表功能細節完整。空值可重疊，不代表錯誤率。細節見 `docs/round-010-log.md`。

## 第十一輪紀錄

依 AGENTS.md，從 2,085 筆剩餘紀錄中，以種子 52 按來源比例抽出 200 筆，排除前十輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十輪不改動。

摘要 null 3 筆；產業／客群空值 4 筆、問題／工作環節空值 19 筆、解法空值 2 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-011-log.md`。

## 第十二輪紀錄

依 AGENTS.md，從 1,885 筆剩餘紀錄中，以種子 53 按來源比例抽出 200 筆，排除前十一輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十一輪不改動。

摘要 null 5 筆；產業／客群空值 7 筆、問題／工作環節空值 27 筆、解法空值 3 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-012-log.md`。

## 第十三輪紀錄

依 AGENTS.md，從 1,685 筆剩餘紀錄中，以種子 54 按來源比例抽出 200 筆，排除前十二輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十二輪不改動。

摘要 null 2 筆；產業／客群空值 3 筆、問題／工作環節空值 18 筆、解法空值 2 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-013-log.md`。

## 第十四輪紀錄

依 AGENTS.md，從 1,485 筆剩餘紀錄中，以種子 55 按來源比例抽出 200 筆，排除前十三輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十三輪不改動。

摘要 null 4 筆；產業／客群空值 47 筆、問題／工作環節空值 32 筆、解法空值 7 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-014-log.md`。

## 第十五輪紀錄

依 AGENTS.md，從 1,285 筆剩餘紀錄中，以種子 56 按來源比例抽出 200 筆，排除前十四輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十四輪不改動。

摘要 null 5 筆；產業／客群空值 27 筆、問題／工作環節空值 20 筆、解法空值 11 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-015-log.md`。

## 第十六輪紀錄

依 AGENTS.md，從 1,085 筆剩餘紀錄中，以種子 57 按來源比例抽出 200 筆，排除前十五輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十五輪不改動。

摘要 null 4 筆；產業／客群空值 38 筆、問題／工作環節空值 24 筆、解法空值 7 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-016-log.md`。

## 第十七輪紀錄

依 AGENTS.md，從 885 筆剩餘紀錄中，以種子 58 按來源比例抽出 200 筆，排除前十六輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十六輪不改動。

摘要 null 3 筆；產業／客群空值 23 筆、問題／工作環節空值 32 筆、解法空值 6 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-017-log.md`。

## 第十八輪紀錄

依 AGENTS.md，從 685 筆剩餘紀錄中，以種子 59 按來源比例抽出 200 筆，排除前十七輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十七輪不改動。

摘要 null 3 筆；產業／客群空值 33 筆、問題／工作環節空值 25 筆、解法空值 4 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-018-log.md`。

## 第十九輪紀錄

依 AGENTS.md，從 485 筆剩餘紀錄中，以種子 60 按來源比例抽出 200 筆，排除前十八輪全部已完成 ID。沿用 schema 1.0、同義詞規則與精簡 notes，前十八輪不改動。

摘要 null 3 筆；產業／客群空值 17 筆、問題／工作環節空值 26 筆、解法空值 5 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-019-log.md`。

## 第二十輪紀錄

依 AGENTS.md，從 285 筆剩餘紀錄中，以種子 61 按來源比例抽出 200 筆，排除前十九輪全部已完成 ID。使用者本次指定一次完成剩餘紀錄，仍分輪保存。

摘要 null 7 筆；產業／客群空值 21 筆、問題／工作環節空值 25 筆、解法空值 6 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-020-log.md`。

## 第二十一輪與全量完成

開始前重新讀 AGENTS.md、資料格式及進度，取剩餘全部 85 筆，排除前二十輪的 4,000 個 ID。種子 62，所有剩餘紀錄都入選。

摘要 null 1 筆；產業／客群空值 2 筆、問題／工作環節空值 6 筆、解法空值 3 筆。空值可重疊，不代表錯誤率。細節見 `docs/round-021-log.md`。

全部批次 ID 聯集已完整覆蓋固定母體 4,085 筆，無遺漏或跨輪重複；這仍是紀錄數，不是去重公司數。進度的 `next_round` 沿用編譯器的下一編號 22，但 `remaining_records` 為 0，沒有實際待處理的第 22 輪。尚未改動 tags 分類表、去重或建立主題與網站。
