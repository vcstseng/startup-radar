# Tags 定義區

目前全量網站大分類為 `catalog-taxonomy-v1.json`：25 個產業／客群、22 個工作、28 個解法大類，另有未知與待歸類狀態。規則只對本維度的既有細 tags 歸納，保留重疊及未涵蓋部分；不是對公司重新推定功能，也不是完整互斥產業樹。輸出與格式見 `docs/catalog-overview.md`、`docs/website-data-contract.md`。

`overview-aliases-v1.json` 只做少量精確同義詞對照；`overview-themes-v1.json`、`reviewed-themes-v1.json` 等保存歷史主題探索，不限定全量分類。下列 100 筆說明為最初試標階段。

現有 100 筆樣本已完成 draft-0.1 試標；尚未建立正式標籤表。

`sample-annotations.json` 保存第 6–100 筆人工試標，前五筆沿用 `data/processed/companies/sample-first-5.json`。編譯腳本整合為 `sample-100.json`，不代表已選定正式標籤詞彙。

目前仍有粗細與近義詞差異（例如 AI、機器學習、AI agent），可用於討論，尚不適合直接把 tag 頻率當作市場熱度排行。

主要維度：

- 產業／客群：服務誰、在哪個領域使用。
- 問題／工作環節：改善哪個問題或工作步驟。
- 解法：採用什麼方式處理問題。

正式標籤建議包含穩定 ID、顯示名稱、定義、同義詞與版本。每家公司每個維度通常 1–3 個 tags，資訊不足允許留空，原始標籤另行保留。
