# 第十三輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 1,685 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十二輪全部已完成 ID。種子 54，最大餘數法分配：500 12、Alchemist 7、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-013.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-013-review/`。

## 留空及必要註記

- 摘要 null 2 筆：Bitgrit、Superinsight；原文缺乏足夠具體的產品資訊，不從口號推定功能或產業。
- 產業／客群空值 3 筆；問題／工作環節空值 18 筆；解法空值 2 筆。空值可重疊，不相加當作公司數。
- TAKUMANE 描述使用 Puff，關係未確認；保留原名與原文。
- GenEQTY 的 SMB 資料與企業客群關係不明，不把資料對象當作客群。
- Wind Fisher 依原文記錄服務 AI 設施的能源供應，不推定發電設備本身使用 AI。
- Clad Labs 未說明 AI support 所指流程，不直接補成客戶服務。
- EverSettled 未列出具體繼承作業模組，不補寫功能。
- 同名或相似描述仍各自保留原始 ID，不自動合併；不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前十二輪資料保持原樣。

第十三輪完成時累積 2,600／4,085 筆，剩餘 1,485 筆。後續第十四輪已完成，詳見 `round-014-log.md`；最新進度以 `progress.json` 為準。
