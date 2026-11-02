# 第五輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0 輕量分類與精簡 notes。不查外部資料、不新增欄位、不整理本輪趨勢或 ideas。

從 3,285 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前四輪全部已完成 ID。種子 46，最大餘數法分配：500 11、Alchemist 8、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-005.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-005-review/`。

## 留空及必要註記

- 3 筆摘要 null：SparkCognition、Nova、Logical；描述過於籠統或截斷，沒有足夠產品資訊。
- 產業／客群空值 11 筆；問題／工作環節空值 31 筆；解法空值 1 筆。可重疊，不相加當作公司數。
- Ask Clio 的 brokerages／RIAs、Opencall 的 practice 及 DeepReach 的 network 缺乏足夠語境，不補定具體產業或功能。
- Remote Gravity 明說服務貸款業者，因此 underwriting 按授信語境整理。
- Dyad 的 structured codes 不直接判成醫療帳務編碼。
- Repairit 描述使用 RepairsCard，名稱關係未確認，保留原文並註記。
- 同名或同描述的不同 ID 仍保持獨立；本輪不去重、不更改既有 AI 篩選母體。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪檔案雜湊、tag 同義詞規則及累積進度。raw、母體與前四輪資料保持原樣。

第五輪完成當時累積 1,000／4,085 筆、剩餘 3,085 筆，當時下一輪為 round 6。第六輪後已完成，最新進度以 `progress.json` 為準。
