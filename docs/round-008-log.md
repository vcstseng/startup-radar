# 第八輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view；先完成全部 4,085 筆。

從 2,685 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前七輪全部已完成 ID。種子 49，最大餘數法分配：500 12、Alchemist 7、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-008.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-008-review/`。

## 留空及必要註記

- 摘要 null 2 筆：Rencom、Virtue AI；原文只有廣泛定位或口號，缺乏具體產品資訊。
- 產業／客群空值 9 筆；問題／工作環節空值 18 筆；解法空值 1 筆。空值可重疊，不相加當作公司數。
- Oneroots 的 withdrawal prediction 未指明對象，未分類成客戶流失或提款預測。
- Medicus 的描述使用 Urban Data Lab，關係未確認，原文與名稱照存。
- Open Swarm、HomeBase 等 AI 營運系統只記原文提供的領域與任務，不補模組。
- Contour、Wattson Health 等醫療通話產品未說明目的，不補成預約或理賠。
- 冷卻、UI 元件、資料與通訊等 AI 周邊服務，不直接宣稱產品本身使用 AI；不擅自剔除原有篩選母體。
- 同名與同描述的不同 ID 獨立保留，不做去重。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前七輪資料保持原樣。

第八輪完成當時累積 1,600／4,085 筆、剩餘 2,485 筆，當時下一輪為 round 9。第九輪後已完成，最新進度以 `progress.json` 為準。
