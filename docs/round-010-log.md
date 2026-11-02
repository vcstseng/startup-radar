# 第十輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 2,285 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前九輪全部已完成 ID。種子 51，最大餘數法分配：500 11、Alchemist 8、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-010.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-010-review/`。

## 留空及必要註記

- 本輪 200 筆均能保留最小摘要，摘要 null 0 筆；不代表任務與功能完整。
- 產業／客群空值 2 筆；問題／工作環節空值 16 筆；解法空值 2 筆。空值可重疊，不相加當作公司數。
- Renna Health 的 ER、Resollect 的 recovery 等語境不足，不由名稱或相近產業補定功能。
- icustoms 的描述使用 ClearCustoms；Tatio 的描述使用 Skillset；Gopher App 的描述使用 Gophr。保留原文並註記關係未確認。
- Perform.AI、Arklex.AI 的其他名稱已在原文明示，不另外猜測身分關係。
- Dexto 只以 AWS 類比，不補定雲端、部署或託管產品能力。
- Candela IoT、Neuralwatt 等紀錄包含支援 AI 用電或運算的情境，未直接宣稱所有產品本身使用 AI。
- 保留不同 ID 的同名或同描述紀錄；未去重、未重新篩選母體。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則及累積進度。raw、AI 篩選母體與前九輪資料保持原樣。

第十輪完成當時累積 2,000／4,085 筆、剩餘 2,085 筆，當時下一輪為 round 11。第十一輪後已完成，最新進度以 `progress.json` 為準。
