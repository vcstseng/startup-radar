# 第六輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0 輕量分類、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不產生本輪趨勢或 ideas。

從 3,085 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前五輪全部已完成 ID。種子 47，最大餘數法分配：500 12、Alchemist 7、Antler 18、EF 9、Plug and Play 35、Techstars 38、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-006.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-006-review/`。

## 留空及必要註記

- 摘要 null 4 筆：Pixverse、CROSS SYNC、Ready、Mosaic；原文僅有技術、廣泛定位或截斷內容，產品資訊不足。
- 產業／客群空值 12 筆；問題／工作環節空值 34 筆；解法空值 7 筆。空值可重疊，不相加當作公司數。
- Sequin 的 collections calls 介紹截斷，沒有債務語境，不推定催收。
- Further AI 明示商業 P&C 保險，underwriting 可按核保語境整理。
- Headstart 在決策對象前截斷，不由名稱與常識補成候選人篩選。
- Zignyl 描述使用 Zigy、LVRG 描述使用 Leverage、Arbia 描述使用 Stocky AI；保留原文並註記關係未確認。
- 只有品牌中的 AI、不明確的產品類比與未來願景，不補成當前功能。
- 跨來源同名或同描述紀錄保持原 ID，不做去重或重新篩選母體。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前五輪資料保持原樣。

第六輪完成當時累積 1,200／4,085 筆、剩餘 2,885 筆，當時下一輪為 round 7。第七輪後已完成，最新進度以 `progress.json` 為準。
