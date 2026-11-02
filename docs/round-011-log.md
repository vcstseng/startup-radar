# 第十一輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 2,085 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十輪全部已完成 ID。種子 52，最大餘數法分配：500 12、Alchemist 7、Antler 18、EF 9、Plug and Play 35、Techstars 38、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-011.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-011-review/`。

## 留空及必要註記

- 摘要 null 3 筆：Health Tech、Neural Pocket、Cogent Labs；原文只有領域或廣泛定位，缺乏具體產品資訊。
- 產業／客群空值 4 筆；問題／工作環節空值 19 筆；解法空值 2 筆。空值可重疊，不相加當作公司數。
- Origa 的 screening calls 未說明篩選對象，不從舊名 Big.Jobs 補定招募功能。
- Corelayer 的 production engineer 未明示製造或軟體正式環境，不補定領域。
- TIL Inc. 描述使用 RECORIS、Piction Health 描述使用 LuminDx、SweetieDev 描述使用 DeepVibes，保留原文並註記關係未確認。
- 原文中的 FDA、EPA 核准宣稱保留為未查證來源資訊，不推定核准範圍或產品成效。
- 名稱中的 AI、AI 媒體、授權基礎設施及責任保險，不一律視為產品本身使用 AI。
- 不去重、不重新篩選母體、不修改既有批次。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前十輪資料保持原樣。

第十一輪完成當時累積 2,200／4,085 筆、剩餘 1,885 筆，當時下一輪為 round 12。第十二輪後已完成，最新進度以 `progress.json` 為準。
