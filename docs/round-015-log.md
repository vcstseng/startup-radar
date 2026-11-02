# 第十五輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 1,285 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十四輪全部已完成 ID。種子 56，最大餘數法分配：500 11、Alchemist 8、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-015.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-015-review/`。

## 留空及必要註記

- 摘要 null 5 筆：Avatar Factory、AI Infinity、MSPilot、Khoj、Blue；原文僅有比喻或概括定位，缺乏具體產品資訊。
- 產業／客群空值 27 筆；問題／工作環節空值 20 筆；解法空值 11 筆。空值可重疊，不相加當作公司數，也不代表錯誤率。
- Aidos Healthcare 描述使用 Inference Health，關係未確認，保留原名及完整原文。
- Zesty.ai 原文明確為保險，因此 underwriting 整理為保險核保；Bountifarm 的 financial underwriting 未指明類型，不補成授信或保險核保。
- VectorShift、Pax 等營運系統未列工作模組，相關分類留空；AI 助理也不補寫未明說任務。
- Elessar 未指明工程領域，不直接當軟體開發；Hippo Scribe 的 PT／OT／SLP 及 Hickory 的 BSA 保留原文縮寫，不增加具體作業。
- Posh、Cerrion 原文截斷，保存原文並註記；Cerrion 不補具體生產線事件。
- Nicslab、資料供應商與 AI 基礎設施按原文明列服務整理，不推定產品本身使用 AI。
- Hanomi 等同名紀錄各自保留原始 ID，不自動合併；不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則、抽樣可重現性及累積進度。raw、AI 篩選母體與前十四輪資料保持原樣。

第十五輪完成時累積 3,000／4,085 筆，剩餘 1,085 筆。後續第十六輪已完成，詳見 `round-016-log.md`；最新進度以 `progress.json` 為準。
