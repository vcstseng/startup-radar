# Startup Radar

最新進度：[2026-11-03 紀錄](docs/progress-2026-11-03.md)，包含 Layer 1、篩選決定、分類修正、公開部署及尚未實作的 UI／UX 建議。

接續已實作 Layer 2：從分類入口查看動態結果，單欄列表每頁 20 筆，保留條件／頁次／返回位置，支援獨立的人工摘要補充 JSON。見 [Layer 2 說明](docs/layer-two-results.md)。Layer 3 尚未實作，待 Layer 2 確認後再繼續；下文較早的「只有 Layer 1」為歷史階段狀態。

網站：[Startup Radar](https://vcstseng.github.io/startup-radar/)（GitHub Pages）。專案儲存庫：[vcstseng/startup-radar](https://github.com/vcstseng/startup-radar)（公開）。來源資料與上傳範圍見 [GitHub 說明](docs/github-repository.md)，本機啟動方式見 [Layer 1 操作說明](docs/layer-one-portal.md)。

從新創公司名錄整理高層次 trends 與 ideas，透過網站探索；使用者查看個別公司時，再按需取得詳細資訊。

目前已完成原始 21,348 筆快照下載、AI 篩選入選 4,085 筆及全部入選紀錄的輕量三維整理。Layer 1 已採 React／TypeScript／Vite 實作極簡三入口 Portal，包含交叉篩選、即時筆數、0 筆選項隱藏、回上一步與網址保存；依最新決定不提供搜尋。GitHub Pages 發布相同的 Layer 1；Layer 2／3 尚未實作，查看結果入口暫停用。下文的未建網站描述為先前資料階段的歷史狀態。

**目前主要成果是完整 4,085 筆的總覽資料**：`docs/catalog-overview.md` 列出全部分類分布；`data/processed/catalog/v1/index.json` 是未來網站讀取入口。包含 25 個產業／客群、22 個工作及 28 個解法大類、三組交叉表、完整分類 ID 索引與 21 份按需詳情 JSON。原始資訊不足與待歸類另列；資料未去重，分類可重疊。讀取約定見 `docs/website-data-contract.md`。

另已完成 AI 入選名錄中 200 筆的來源比例抽樣、人工閱讀、三維 tags 與候選方向卡片；詳見 `docs/ai-200-analysis.md`。

目前採用輕量 schema 1.0，已完成全部 4,085 筆，剩餘 0 筆；分為前 20 輪各 200 筆及最後第 21 輪 85 筆。正式批次在 `data/processed/companies/batches/`，格式與操作原則見 `docs/batch-data-format.md`。尚未去重；主題與部分同義詞彙整已有獨立初稿，網站展示仍待討論；先前詳細試標與方向卡片為歷史探索。

每輪先讀根目錄 `AGENTS.md` 再開始；完成後更新 docs。只在需要改範圍、格式、來源或有重大取捨時找使用者討論，一般資訊不足留空並繼續。

完成後已接續第一份彙整 review：`docs/overview-review.md`。包含 7 個展示主題、25 筆附原文代表案例、18 條衍生同義詞規則及重複候選清單；輸出在 `data/processed/overview/v1/`。這是可回查初稿，不是全量分群或市場排名；原始資料及 21 輪批次未改寫，尚未合併公司或建立網站。

先前第一步主題 review：`docs/theme-review-step-1.md`。對 4,085 筆原文做候選檢索，人工回讀 120 筆，整理三題建議；主題邊界、案例調整及逐筆判定另存在 `data/processed/overview/theme-review-v1/`。使用者後續選擇先看完整分布，三題保留為歷史探索，不用來限制全量分類。尚未建立網站原型。

## 目錄

```text
startup-radar/
├─ data/
│  ├─ raw/                       原始資料與抽樣紀錄，保留不覆寫
│  │  └─ snapshots/              後續全量下載，依批次／時間保存
│  ├─ processed/
│  │  ├─ companies/             公司摘要、標準化欄位與多維 tags
│  │  ├─ trends/                趨勢觀察、代表案例與證據
│  │  └─ ideas/                 延伸想法及其參考案例
│  └─ cache/
│     └─ company-details/       使用者查詢後取得的公司詳細資訊
├─ config/
│  └─ taxonomy/                 tags 定義、同義詞與版本
├─ scripts/
│  ├─ ingest/                   下載資料與記錄來源
│  ├─ process/                  欄位修正、去重、摘要與標籤
│  └─ analyze/                  分群、趨勢與 ideas 整理
├─ web/
│  ├─ src/                      現行 React Portal、元件與篩選工具
│  ├─ scripts/                  建置時複製允許公開的 catalog 資料
│  ├─ tests/                    真實資料上的分類與篩選驗證
│  └─ public/                   公開靜態素材
├─ server/
│  └─ services/                 按需查詢、來源擷取與快取邏輯
└─ docs/                        資料流程與產品設計紀錄
```

現行前端使用 Vite；早期 `web/app`、`web/components`、`web/lib` 空殼保留作歷史目錄，不是 Next.js 專案。不為兩萬多家公司逐一建立靜態頁面。

## 檔案
- `data/raw/startups-sample-100.json`：保留上游原始欄位，沒有修改或補值。
- `data/raw/sample-manifest.json`：下載時間、來源、上游雜湊、抽樣規則與原始位置。

Techstars、YC 各 15 筆；500 Global、Antler、EF、Alchemist、Plug and Play 各 14 筆。亂數種子 42。此抽樣用於比較來源品質，不代表整體分布，尚未去重、分析或查證公司官網。

## 整理原則

- 原始資料與整理結果分開，所有摘要保留來源對照。
- tags 採多維度：產業／客群、問題／工作環節、解法；先用 100 筆試標再定版。
- 趨勢與 ideas 分開記錄。反覆出現的方向，不直接等同於隨時間成長的趨勢。
- 詳細公司資訊按需查詢，保留來源、查詢時間與更新狀態。
- 原始資料與查詢快取不放在網站公開素材目錄。

## 100 筆分析結果

- `docs/sample-100-analysis.md`：全部公司的中文摘要、三維 tags、可用程度與限制，以及候選題目群。
- `data/processed/companies/sample-100.json`：完整結構化結果，含原始紀錄、來源對照及原文依據。
- `data/processed/companies/sample-100-summary.json`：可用程度與各來源統計。
- `data/processed/trends/sample-100-candidate-groups.json`：人工挑選的重疊題目群，尚非時間趨勢證據。
- `config/taxonomy/sample-annotations.json`：第 6–100 筆人工試標輸入；前五筆保留於 `sample-first-5.json`。

可用程度：清楚 62 筆、部分清楚 32 筆、待確認 6 筆。這是依描述是否足以分類的人工判斷，不是資料正確率，也不能外推整份名錄。

以 `python scripts/process/build_sample_analysis.py` 可重新產生分析檔案；不會連網或修改 raw。

100 筆試標的 tags 尚未正式定版。全量 raw 已完成第一輪 AI 規則篩選，詳見下方。

## 全量原始資料

- Repository：<https://github.com/yigitmeteozcan/startups>
- 檔案：`data/raw/snapshots/full-20261101T150331066Z/all.json`
- 下載與驗證紀錄：同資料夾的 `manifest.json`，包含實際筆數、來源分布、檔案大小與 SHA-256。
- 原始下載內容完整保留，尚未篩選、去重或標記。來源為可變動的 main 分支網址，這份快照以檔案雜湊識別，未擷取 commit SHA。

## 全量 AI 第一輪篩選

原始快照不修改；篩選結果另外存於 `data/processed/ai-filter/full-20261101T150331066Z/`。

- `ai-startups.json`：4,085 筆有明確 AI 線索的原始紀錄集合。
- `explicit.json`：入選紀錄與篩選依據。
- `possible.json`：3,482 筆可能相關的待確認紀錄。
- `no_evidence.json`：13,781 筆暫無證據紀錄。
- `summary.json`：統計及規則版本。

規則：`config/ai-filter-rules.json`；重跑：`python scripts/process/filter_ai.py`。

完整說明及抽查限制：`docs/ai-filter-results.md`。上述為未去重的紀錄數，明確組也可能包含服務 AI 產業的產品，不等同於已驗證產品使用 AI。

## AI 200 筆探索

- `docs/ai-200-analysis.md`：200 筆逐筆分析與 8 張候選方向卡片。
- `data/processed/companies/ai-review-200/companies.json`：三維 tags、AI 主要角色、資訊可用程度、原文與來源對照。
- 同資料夾的 `sample.json`、`manifest.json`、`summary.json`、`draft-tags.json`：抽樣、統計與試標詞彙。
- `data/processed/trends/ai-200-directions.json`：候選方向與代表案例，並非時間成長證據。
- `config/taxonomy/ai-200-annotations.json` 與 `ai-200-directions.json`：人工標註與方向卡片輸入。

抽樣種子 42，依來源比例分層抽取：500 11、Alchemist 7、Antler 18、EF 10、Plug and Play 35、Techstars 38、YC 81。清楚 121、部分清楚 78、待確認 1；AI 主要角色為使用 AI 155、工具／基礎設施 32、產業周邊 4、不明 9。均為名錄描述的人工判斷，未查證現況或效果。

重建抽樣：`python scripts/analyze/select_ai_200.py`；重建分析：`python scripts/analyze/build_ai_200.py`。原始資料與 4,085 筆主檔保持不變；兩個疑似篩選邊界案例另外標記，未擅自移除。

以上是較早的詳細探索流程，不是後續每輪的必填格式。若重跑上述分析程式，會重新產生歷史報告，不會自動更新 batches。

## 正式輕量批次

- `data/processed/companies/batches/round-001.json`：已完成 200 筆；摘要、三維 tags、原文、ID、必要註記。
- `data/processed/companies/batches/round-002.json`：第二輪已完成 200 筆；沒有重複處理第一輪 ID。
- `data/processed/companies/batches/round-003.json`：第三輪已完成 200 筆；排除所有已完成 ID。
- `data/processed/companies/batches/round-004.json`：第四輪已完成 200 筆；沿用相同格式並精簡 notes。
- `data/processed/companies/batches/round-005.json`：第五輪已完成 200 筆；沒有改動前四輪。
- `data/processed/companies/batches/round-006.json`：第六輪已完成 200 筆；沒有改動前五輪。
- `data/processed/companies/batches/round-007.json`：第七輪已完成 200 筆；沒有改動前六輪。
- `data/processed/companies/batches/round-008.json`：第八輪已完成 200 筆；沒有改動前七輪。
- `data/processed/companies/batches/round-009.json`：第九輪已完成 200 筆；沒有改動前八輪。
- `data/processed/companies/batches/round-010.json`：第十輪已完成 200 筆；沒有改動前九輪。
- `data/processed/companies/batches/round-011.json`：第十一輪已完成 200 筆；沒有改動前十輪。
- `data/processed/companies/batches/round-012.json`：第十二輪已完成 200 筆；沒有改動前十一輪。
- `data/processed/companies/batches/round-013.json`：第十三輪已完成 200 筆；沒有改動前十二輪。
- `data/processed/companies/batches/round-014.json`：第十四輪已完成 200 筆；沒有改動前十三輪。
- `data/processed/companies/batches/round-015.json`：第十五輪已完成 200 筆；沒有改動前十四輪。
- `data/processed/companies/batches/round-016.json`：第十六輪已完成 200 筆；沒有改動前十五輪。
- `data/processed/companies/batches/round-017.json`：第十七輪已完成 200 筆；沒有改動前十六輪。
- `data/processed/companies/batches/round-018.json`：第十八輪已完成 200 筆；沒有改動前十七輪。
- `data/processed/companies/batches/round-019.json`：第十九輪已完成 200 筆；沒有改動前十八輪。
- `data/processed/companies/batches/round-020.json`：第二十輪已完成 200 筆；沒有改動前十九輪。
- `data/processed/companies/batches/round-021.json`：最後一輪已完成 85 筆；全部母體處理完畢。
- `data/processed/companies/batches/progress.json`：完成輪次及 ID；下一輪排除所有已完成 ID。
- `config/schemas/company-batch.schema.json`：schema 1.0。
- `docs/batch-data-format.md`：格式、資料不足處理、進度與第一輪校正說明。

不明 tags 留空，摘要不足可用 null；不補猜測，不逐家補查。每輪保存資料與進度，全部完成後再統一整理方向。原始檔和舊分析不修改。

第二至二十一輪紀錄：`docs/round-002-log.md`、`docs/round-003-log.md`、`docs/round-004-log.md`、`docs/round-005-log.md`、`docs/round-006-log.md`、`docs/round-007-log.md`、`docs/round-008-log.md`、`docs/round-009-log.md`、`docs/round-010-log.md`、`docs/round-011-log.md`、`docs/round-012-log.md`、`docs/round-013-log.md`、`docs/round-014-log.md`、`docs/round-015-log.md`、`docs/round-016-log.md`、`docs/round-017-log.md`、`docs/round-018-log.md`、`docs/round-019-log.md`、`docs/round-020-log.md`、`docs/round-021-log.md`。全部 4,085 筆已完成，沒有待處理輪次。

簡單 tag 同義詞對照：`config/taxonomy/tag-aliases.json`。前兩輪 9 筆 tag 小幅優化的變更紀錄：`docs/tag-cleanup-v1.json`；摘要、ID、原文與完成筆數保持不變。
