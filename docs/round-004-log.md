# 第四輪完成紀錄

## 範圍

本輪先讀 `AGENTS.md`、資料格式說明與進度，沿用 schema 1.0，逐筆整理本機有效介紹。不查官網、不補資料、不新增欄位、不產生趨勢或 ideas。

從 3,485 筆未完成紀錄中按來源比例分層抽取 200 筆，種子 45，最大餘數法分配：500 11、Alchemist 7、Antler 18、EF 10、Plug and Play 35、Techstars 38、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-004.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-004-review/`。

## 本輪處理

- 摘要 null 1 筆：bitgrit 原文只有 Democratic AI，不足以產出具體摘要。
- 產業／客群空值 11 筆；問題／工作環節空值 26 筆；解法空值 2 筆。可重疊，不相加當作公司數。
- YOURIKA 有兩筆同名同描述紀錄；各自 ID 不同，保留並註記，未去重。
- Narrative 的不同紀錄分別描述合規風控與影片編輯；不因同名合併，也不猜改名。
- AI 營運系統與 AI workers 未提供細項時，不補上預約、庫存或帳務等模組。
- Medicare agencies 的類型與任務未明，保留原文，不硬建客群 tags。
- CollectWise 明確提 consumer debt collection，因此可分類債務回收，不等同缺乏語境的 collections。
- 從本輪起精簡 notes，只記影響理解的限制；前三輪不為文字長短重改。raw、第一至三輪及母體保持原樣。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪檔案雜湊、同義詞規則及累積進度。

第四輪完成當時累積 800／4,085 筆、剩餘 3,285 筆，當時下一輪為 round 5。第五輪後已完成，最新進度以 `progress.json` 為準。
