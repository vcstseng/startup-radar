# 全量網站資料格式 1.0

## 2026-11-04：雙語顯示補充

分類 ID、篩選及正式資料均不改；翻譯位於前端字典。英文列表主欄位用既有大分類英文名稱，原中文細 tags 可展開。建置及開發啟動從 21 份 detail 批次衍生 `web/public/data/localization/source-texts.json`，以 build_id 及原 ID 連接 4,085 筆完整 evidence.text；不將原文當新驗證或新摘要。英文介紹節錄最多 360 字元（加省略號），完整原文在公司頁。詳見 [雙語規格](bilingual-website.md)。

2026-11-03 展示合併：本契約與 catalog 繼續保存全部 4,085 筆 source_record，不覆寫、不刪除。網站另讀 `data/processed/display/v1/duplicates.json`，先用原始紀錄篩選，再對符合項計算展示群組：目前合併 84 組明確重複，展示總數 4,000。這是展示去重，不是公司身分全量辨識；詳見 `exact-duplicates-2026-11-03.md`。下文計數與分布指原始 catalog，不能直接當作合併後網站筆數。

2026-11-03：Layer 2 已使用既有 records／facets 建立動態列表；手動補充摘要另存 `data/supplements/v1/companies.json`，以 dataset_id＋紀錄 ID 連接，詳見 `layer-two-results.md`。本資料契約、原始批次及 catalog 不因新增頁面而改寫。

2026-11-02 分類修正：schema 仍為 1.0，taxonomy 更新為 `catalog-1.0.1`。聊天機器人不再因「機器人」子字串被分進實體機器人大類；12 筆移除該衍生分類，原 tags／原文及詳情未改。詳見 `reviews/2026-11-02-robotics-correction.json`。網站目前已有本機 Layer 1，以下資料交付描述保留作契約背景。

目前交付的是本地資料集，不包含網站介面或部署。根目錄：`data/processed/catalog/v1/`。本次新增的是衍生網站格式，既有公司批次 schema 1.0 不變。

## 檔案與載入順序

| 檔案 | 用途 |
| --- | --- |
| `index.json` | 入口、資料集 ID、建置 ID、分類版本、資產路徑 |
| `taxonomy.json` | 三維大類的穩定 ID、中文名稱、類型與說明 |
| `summary.json` | 全量數量、來源分布、分類分布、涵蓋程度與計數限制 |
| `records.json` | 全部 4,085 筆輕量卡片、原 tags、大類與詳情路徑 |
| `facets.json` | 每個大類的完整 ID 集合、筆數與示例 ID |
| `cross-tabs.json` | 三組維度交叉表，只存非零格子；零格子可由分類清單補齊 |
| `details/batch-NNN.json` | 21 份詳情，`records_by_id` 保存完整原文、註記及原始索引 |
| `tag-map.json` | 每個正規化細 tag 對應哪些大類、命中的規則及原出現筆數 |
| `unmapped-tags.json` | 尚未歸類的細 tags，供後續改善規則 |
| `manifest.json` | 所有輸入與輸出 SHA-256，供重建與完整性檢查 |

首頁可先載入 `index`、`taxonomy`、`summary`；需要篩選與清單時讀 `facets`、`records`；開啟個別紀錄時再讀該筆 `detail_file`。入口與其他檔案使用相對資料集根目錄路徑，未綁定框架或 HTTP 路由。

目前未壓縮檔案約為：summary 19 KB、records 4.9 MB、facets 0.5 MB、cross-tabs 0.5 MB；不必為初始總覽先載入全部原文。實際大小以輸出檔為準。

## 一筆紀錄

主表每筆有：

- `id`：原始 `upstream-NNNNN`，固定 raw 快照內索引的穩定參照，不是跨未來快照的公司身分。
- `name`、`summary_zh`：完全沿用批次；摘要可為 null。
- `source`：7 個來源之一。
- `website`、`website_status`：僅整理現有網址格式，不重新連線。缺漏、格式不合或共用來源網域留 null，勿生成公司官網按鈕。
- `tags`：原始三維細 tags，未改寫。
- `normalized_tags`：套用既有少量精確同義詞後的 tags。
- `categories`：每維大類 ID 陣列，可多選；沒有資料或未能歸類時使用下述系統 ID。
- `classification_status`：各維規則涵蓋狀態，與資料正確性分開。
- `detail_file`：例如 `details/batch-020.json`，讀取後用 `records_by_id[id]` 取得 evidence、notes、source 與 upstream_position。

詳情只帶入必要整理欄位，沒有把上游整筆 raw、創辦人或其他額外欄位複製進網站資料。詳情中保留 `evidence.field`，Antler 介紹可能來自 location。

## 大類與未知

三個維度：`industry_customer`、`problem_workflow`、`solution`。每維 category ID 只在該維度內解讀，與 `taxonomy.dimensions[axis].categories` 對應。

| classification_status | 意思 | categories |
| --- | --- | --- |
| `mapped` | 所有現有細 tags 均有規則對應 | 一個或多個正常大類 |
| `partial` | 部分有對應、部分待歸類 | 正常大類及 `__other` |
| `unmapped` | 有 tags，但目前規則全未涵蓋 | 只有 `__other` |
| `missing` | 原本該維沒有 tags | 只有 `__missing` |

`__missing` 顯示「原始資訊不足」，`__other` 顯示「其他已描述／待歸類」。兩者不是同一件事，也不是「不使用 AI」或「不屬於任何產業」。

`generic-ai` 指細 tag 只是概括 AI，同筆可能另有明確方式。`summary.solution_generic_only_records` 才是只有該大類的紀錄數。平台、agents、SaaS 等屬形式，不因此補出任務或技術。

`kind` 區分領域、角色、工作、技術、能力、交付形式及狀態。這不是互斥的產業分類樹；例如人資團隊是客群角色，並非公司產業。

## 計數與篩選

計數單位一律為 `source_record`。`deduplicated` 為 false；同名、同網域甚至同介紹的不同 ID 仍分別保留。不宣稱有 4,085 家獨立公司。

- 大類內用唯一 ID 計數。同筆可同時落入多類，所以各類百分比與筆數可相加超過 100% 或 4,085。
- 分布的 `share_of_all_records` 是 0–1，分母固定 4,085。不要直接當成已篩選結果占比。
- 交叉格子的 `record_count` 是左、右大類 ID 集合交集，不是兩個計數相乘，也不是單筆 tag 配對次數。
- 同維多選取聯集（OR），不同維之間取交集（AND），來源篩選再取交集。
- 篩選後如需重算分類圖表，使用篩選集合與各分類索引再取交集，不使用原先全量總數。
- `example_ids` 是固定排序、來源分散並避免同名重複的少量展示例子，不是完整成員或公司排名。完整成員在 `record_ids`。
- 交叉表沒寫出的格子是零，不代表資料載入失敗；未知分類的格子仍保留。

## Provenance 與版本

`dataset_id` 識別固定原始快照與入選集合；`taxonomy_version` 識別分類版本；`build_id` 是輸入檔雜湊集合的摘要，用來辨識同一資料集的不同建置。入口、摘要與 manifest 帶相同 build_id，未填造假更新日期。

分類規則：`config/taxonomy/catalog-taxonomy-v1.json`。它只對本維度已存在的細 tags 比對，可回查 `tag-map.json`，不從名稱、網址、另一維度或原文關鍵字直接補新資訊。`overrides` 可供未來精確 tag 覆寫，目前沒有使用。

對照與限制保留原檔；`summary`、`facets`、交叉表都由完整主表重算，不手填統計。未覆寫 `overview/v1` 或 `overview/theme-review-v1`，先前主題僅作歷史探索。

JSON Schema：`config/schemas/website-catalog-records.schema.json`。建置與驗證：

```text
python scripts/analyze/build_catalog.py
python scripts/analyze/validate_catalog.py
```

驗證包含：4,085 個 ID 的完全覆蓋、原始摘要與 evidence 對應、21 個詳情檔、每個分類完整索引、全部交叉表集合運算、數量分母與語意邊界回歸案例。這不代表全量二次人工語意複核或產品宣稱驗證。

需要改規則時，先檢查命中細 tags 與具體紀錄，保留未歸類與未知，不以提高覆蓋率作唯一目標。正式對外使用或變更版本時，再另行確認資料載入位置、資產版本策略與公開範圍；本次沒有部署網站。
