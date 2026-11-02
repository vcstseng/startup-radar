# 第二輪完成紀錄

## 範圍

- 來源：既有 4,085 筆有明確 AI 文字線索的集合，扣除第一輪 200 筆後抽樣。
- 方式：按剩餘來源比例分層隨機抽樣，種子 43，最大餘數法分配。
- 來源分配：500 11、Alchemist 7、Antler 18、EF 10、Plug and Play 35、Techstars 38、YC 81。
- 完成：200 筆；未查官網、未補資料、未產生本輪趨勢或 ideas。
- Schema：1.0；摘要、三維 tags、原文、ID、必要註記。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-002.json`。
- 累積進度：同資料夾 `progress.json`，保存本輪 ID 與檔案雜湊。
- 本輪抽樣原文、抽樣紀錄及人工標記：`data/processed/companies/round-002-review/` 下的 `sample.json`、`manifest.json`、`annotations.json`。

## 資訊不足的處理

- 1 筆摘要為 null：coil inc. 的原文只有 ai。
- 產業／客群空值 20 筆；問題／工作環節空值 27 筆；解法空值 5 筆。空值可出現在同一筆，不可相加當作公司數。

後續小幅優化：移除 3 筆缺乏語境的原文 tags（community management、underwriting、collections），原文與摘要不變；問題／工作環節空值現為 29 筆。逐筆前後對照在 `docs/tag-cleanup-v1.json`。本輪其餘紀錄未重做。
- Pitchit.ai 的 first response 未交代用途，不判成客服或緊急救援。
- Two Dots 的 underwriting 未交代是授信或保險核保，保留原文，不強制歸入保險。
- HOAi 的 community management 未區分社群與物業社區，保留原文。
- EA Global AI 的描述使用 EthicsGrade；Shutterspeed 的描述使用 Manifest。保留原文並註記身分關係未確認。
- 本輪 Drafted 的住家設計描述與第一輪同名紀錄的招募描述不同；保持不同 ID，不合併或猜測改名。
- 部分紀錄只是服務 AI 市場、AI 使用者或 AI 內容，並非已證明產品本身使用 AI。仍保留原始入選集合，依描述整理，不擅自重新過濾。

## 完成檢查

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與原始索引對應、總數及進度一致，以及原始檔與第一輪檔案未變動。

第二輪完成當時累積 400／4,085 筆、剩餘 3,685 筆，當時下一輪為 round 3。第三輪後已完成，最新進度以 `progress.json` 與 `docs/batch-data-format.md` 為準。
