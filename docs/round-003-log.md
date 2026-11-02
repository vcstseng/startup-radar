# 第三輪完成紀錄

## 工作約束

依根目錄 `AGENTS.md` 與 schema 1.0：只做摘要、三維 tags、原文、ID、必要註記；資訊不足留空。不查外部資料、不補功能、不新增角色或品質欄位、不產生本輪趨勢或 ideas。

## 本輪選取

- 從 3,685 筆未完成紀錄中排除全部已完成 ID，按來源比例分層隨機抽取 200 筆。
- 種子：44；最大餘數法分配。
- 來源分配：500 11、Alchemist 8、Antler 18、EF 9、Plug and Play 35、Techstars 38、YC 81。
- 正式結果：`data/processed/companies/batches/round-003.json`。
- 抽樣、來源對照與人工閱讀標記：`data/processed/companies/round-003-review/`。

## 本次已同意的優化

建立 `AGENTS.md` 作為後續每輪必讀指引，並建立 `config/taxonomy/tag-aliases.json` 簡單對照。前兩輪只修正 9 筆 tags，未改摘要、名稱、ID、原文或筆數；逐筆對照見 `docs/tag-cleanup-v1.json`。重新編譯時套用同一規則。

## 留空與限制

- 本輪 200 筆均能做最小摘要；摘要 null 0 筆。
- 產業／客群空值 23 筆；問題／工作環節空值 24 筆；解法空值 6 筆。可互相重疊，不代表錯誤率。
- TigerEye 只寫 AI for Construction，因此工作環節留空。
- Vocaire 的 journals 及 Brickanta 的 Society Builders 缺乏語境，保留原文，不升為正式問題或產業 tags。
- CRiskCo 明說替中小企業提供信用，因此 underwriting 可按授信語境整理；不是無條件把所有 underwriting 歸同類。
- LSVR 的描述使用 ARpalus、Osazomon 的描述使用 OSAZ，名稱關係未確認，保留原文並註記。
- 部分紀錄只是 AI 使用環境、AI 周邊服務或宣傳口號，不代表已驗證產品本身使用 AI；不擅自剔除母體。

## 完成檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與固定 raw 索引相符、同義詞清理可重複套用、來源檔未變及各輪雜湊與進度一致。

第三輪完成當時累積 600／4,085 筆、剩餘 3,485 筆，當時下一輪為 round 4。第四輪後已完成，最新進度以 `progress.json` 與 `docs/batch-data-format.md` 為準。
