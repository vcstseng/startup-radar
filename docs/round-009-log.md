# 第九輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 2,485 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前八輪全部已完成 ID。種子 50，最大餘數法分配：500 11、Alchemist 7、Antler 18、EF 10、Plug and Play 35、Techstars 38、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-009.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-009-review/`。

## 留空及必要註記

- 摘要 null 2 筆：SparkCognition、GrubMarket；原文過於籠統或截斷，不由名稱補資料。
- 產業／客群空值 6 筆；問題／工作環節空值 18 筆；解法空值 3 筆。空值可重疊，不相加當作公司數。
- Juniper 的描述使用 Altrix，關係未確認，保留原文並註記。
- No Cap 的 AI startup investor 未區分 AI 投資工具或投資 AI 新創的機構，未建立投資工具功能 tags。
- Parsagon 只記公共政策追蹤與分析；沒有補成法律建議或合規判定。
- AI 營運系統、領域 AI 與專用 agents 只保留原文提供的任務；資訊不足留空。
- 不去重、不重新篩選母體、不查官網。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前八輪資料保持原樣。

第九輪完成當時累積 1,800／4,085 筆、剩餘 2,285 筆，當時下一輪為 round 10。第十輪後已完成，最新進度以 `progress.json` 為準。
