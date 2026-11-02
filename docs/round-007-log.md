# 第七輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不產生本輪趨勢或 ideas。

從 2,885 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前六輪全部已完成 ID。種子 48，最大餘數法分配：500 11、Alchemist 8、Antler 18、EF 10、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-007.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-007-review/`。

## 留空及必要註記

- 摘要 null 1 筆：Martian 只有相對單一 LLM 的效能與成本訴求，未交代產品機制。
- 產業／客群空值 11 筆；問題／工作環節空值 24 筆；解法空值 5 筆。空值可重疊，不相加當作公司數。
- Qiznalo 有兩筆同名同描述，保留不同 ID；原文 nursing care prevention 語意未明，不推定細部功能。
- Hatch 的 CSR、Payna 的 licensing、byways 的 yard 缺乏足夠語境，不強行細分。
- Sedso.ai 描述使用 CorFin.AI；NexMind 描述使用 NexLaw；名稱關係未確認，保留原文並註記。
- Raindrop 只以 Sentry 作類比，不補成監控或錯誤追蹤產品。
- 跨來源同名、同描述紀錄仍獨立保存；未去重、未更改原有 AI 篩選母體。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前六輪資料保持原樣。

第七輪完成當時累積 1,400／4,085 筆、剩餘 2,685 筆，當時下一輪為 round 8。第八輪後已完成，最新進度以 `progress.json` 為準。
