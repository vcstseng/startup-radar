# 第十九輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 485 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十八輪全部已完成 ID。種子 60，最大餘數法分配：500 12、Alchemist 7、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-019.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-019-review/`。

## 留空及必要註記

- 摘要 null 3 筆：Zensors、Zeroframe、Digipals；原文僅有概括願景，缺乏具體產品與工作資訊。
- 產業／客群空值 17 筆；問題／工作環節空值 26 筆；解法空值 5 筆。空值可重疊，不相加當作公司數，也不代表錯誤率。
- Horizon Technologies 描述使用 Quantrack AI，混入表單文字且截斷；Splash 描述使用 Popgun。保留原名與完整原文，不推定關係。
- 本輪兩筆 Axle 分別是貨運應收帳款融資及保險清算交換，分別保留 ID，不合併。
- Milo 原文在具體工作處截斷，不補家務或育兒任務；Musio 描述重複且語意不順，不補機器人用途。
- Accend 有銀行及金融科技的商業 underwriting 語境，整理為商業授信評估。
- Tennis Finance、AgentCollect 明確描述應收帳款或 B2B 債務催收，按具體工作分類。
- Fermi Dev、Jenz、Beacon Health 等未列工作，不補營運或醫療模組；會計、稅務、ERP 介紹亦不擴寫未列功能。
- Dedalo、Polar Search 等未明說 AI 方法，不從名稱或競品比較推定；資料與 AI 評估服務也按原文整理。
- Enrola 的 agent 對 agent 基礎設施是未來方向，不寫成現有功能；疾病防治與效率宣稱不當作已證實成果。
- 不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則、抽樣可重現性及累積進度。raw、AI 篩選母體與前十八輪資料保持原樣。

第十九輪完成時累積 3,800／4,085 筆，剩餘 285 筆。後續第二十輪已完成，詳見 `round-020-log.md`；最新進度以 `progress.json` 為準。
