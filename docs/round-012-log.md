# 第十二輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 1,885 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十一輪全部已完成 ID。種子 53，最大餘數法分配：500 11、Alchemist 8、Antler 18、EF 10、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-012.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-012-review/`。

## 留空及必要註記

- 摘要 null 5 筆：Quant-Co、Mindi、Wonderly、Ecliptor、Liva AI；原文過於籠統、只有技術名詞或截斷，缺乏具體產品資訊。
- 產業／客群空值 7 筆；問題／工作環節空值 27 筆；解法空值 3 筆。空值可重疊，不相加當作公司數。
- DriveX 兩筆同名同描述，各自保留 ID，不去重。
- Candidate Tools 描述使用 xVector.us，關係未確認；保留原名與原文。
- Lunavo 的 carriers、Sonans 的 onboard 對象不明，不補成特定產業或流程。
- Freestyle 只依本筆沙盒描述分類，不與前面同名紀錄合併。
- AI 營運系統及 agents 未列工作時，對應 tags 留空；不補預約、帳務等模組。
- 不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前十一輪資料保持原樣。

第十二輪完成當時累積 2,400／4,085 筆，剩餘 1,685 筆。後續第十三輪已完成，詳見 `round-013-log.md`；最新進度以 `progress.json` 為準。
