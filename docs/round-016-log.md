# 第十六輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 1,085 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十五輪全部已完成 ID。種子 57，最大餘數法分配：500 12、Alchemist 7、Antler 18、EF 10、Plug and Play 34、Techstars 38、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-016.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-016-review/`。

## 留空及必要註記

- 摘要 null 4 筆：Project Mirage、ThirdFi、Julius、Gauge；原文只有願景、名詞或不明對象，缺乏具體產品資訊。
- 產業／客群空值 38 筆；問題／工作環節空值 24 筆；解法空值 7 筆。空值可重疊，不相加當作公司數，也不代表錯誤率。
- Dora 描述使用 Dora Pay，關係未確認；保留原始名稱。
- Just Appraised 不依名稱推定不動產估價；UpCodes 的 codes 與 Reprompt 的 Location 語境不足，不補具體任務。
- Spruce、Scritch 等營運系統未列模組，不補寫流程；Sully 涵蓋全部醫院營運是原文宣稱，不自行展開。
- VICTUS、Tailor-ED、Sekilo、Popsy 等原文截斷，保留可讀資訊及短註記。
- Canos 的貓隻檢測為未來計畫，不寫成現有功能。
- Life Log Technology 原文只描述團隊，解法留空；Kumuda 的 AI 僅在原文主題標記出現，不推定具體 AI 功能。
- Lark 按本筆經銷商流程描述整理，不與前輪同名紀錄合併。
- 不重新篩選母體、不補查公司現況；服務 AI 的基礎設施按原文分類。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則、抽樣可重現性及累積進度。raw、AI 篩選母體與前十五輪資料保持原樣。

第十六輪完成時累積 3,200／4,085 筆，剩餘 885 筆。後續第十七輪已完成，詳見 `round-017-log.md`；最新進度以 `progress.json` 為準。
