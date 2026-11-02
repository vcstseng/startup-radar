# 第十七輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 885 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十六輪全部已完成 ID。種子 58，最大餘數法分配：500 11、Alchemist 8、Antler 19、EF 9、Plug and Play 35、Techstars 37、YC 81。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-017.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-017-review/`。

## 留空及必要註記

- 摘要 null 3 筆：Minded、Hyper、6thSense；原文僅有產品比喻或概括定位，缺乏具體功能資訊。
- 產業／客群空值 23 筆；問題／工作環節空值 32 筆；解法空值 6 筆。空值可重疊，不相加當作公司數，也不代表錯誤率。
- SuperAnnotate AI 有兩筆同名同描述，各自保留 ID；Passionate Genius 等跨輪同名紀錄也不合併。
- ABIVO 明確提逾期發票、Argovox 明確提病患帳單，因此可分類為對應催收工作；Weav Ai 的 underwriting、claims 沒有明確產業語境，保留原詞並留空相關分類。
- healthKERI 將 AI 列為防範威脅，LyRise 服務 AI 人才市場，均不推定產品本身使用 AI。
- Gohaus 描述使用 Goohaus 且截斷；Sports Vision、ROSS、AlgoSurg、Rootly 等截斷介紹僅整理可讀內容。
- Lavender Health、Hypotenuse AI、Bravi 等未列工作模組，不補寫；Fed10 的政府事務不等於客戶必為政府機關。
- TrueClaim 的 TPA 未展開，不補寫具體服務。
- 不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則、抽樣可重現性及累積進度。raw、AI 篩選母體與前十六輪資料保持原樣。

第十七輪完成時累積 3,400／4,085 筆，剩餘 685 筆。後續第十八輪已完成，詳見 `round-018-log.md`；最新進度以 `progress.json` 為準。
