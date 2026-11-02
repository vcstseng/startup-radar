# 第十四輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 1,485 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十三輪全部已完成 ID。種子 55，最大餘數法分配：500 11、Alchemist 7、Antler 18、EF 10、Plug and Play 35、Techstars 38、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-014.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-014-review/`。

## 留空及必要註記

- 摘要 null 4 筆：Interhuman、ZNIT、Aiforce Solutions、General Trajectory；原文只有概括定位或口號，缺乏具體產品資訊。
- 產業／客群空值 47 筆；問題／工作環節空值 32 筆；解法空值 7 筆。空值可重疊，不相加當作公司數，也不代表錯誤率。
- Thred、Finnt、Ventura、RealPact 等未列具體工作，不補寫財務或營運模組。
- DubPrime 原文明確為 lenders，因此 underwriting 可整理為授信評估；Callbook AI 的 collections 與 portfolios 語境仍不足，保留原詞並留空相關分類。
- Sendbird、Duckie 的 support 未明確指向客戶服務；Deeptrace 的 on-call 未指明工作領域，不靠名稱或常識補分類。
- Carelogy 不依 CatsMe 名稱推定使用對象；人體動作分析亦不自動判為醫療用途。
- Rest、Edwin 的介紹末尾截斷，保存完整原文並註記。
- 服務 AI 的電腦、雲端基礎設施與開放格式，按原文整理，不推定工具本身使用 AI。
- 同名紀錄保留原始 ID，不自動合併；不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前十三輪資料保持原樣。

第十四輪完成時累積 2,800／4,085 筆，剩餘 1,285 筆。後續第十五輪已完成，詳見 `round-015-log.md`；最新進度以 `progress.json` 為準。
