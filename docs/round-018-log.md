# 第十八輪完成紀錄

## 範圍與選取

本輪先讀 `AGENTS.md`、資料格式及進度，沿用 schema 1.0、同義詞規則與精簡 notes。不查外部資料、不新增欄位、不做本輪趨勢或 high-level view。

從 685 筆未完成紀錄中按來源比例分層抽取 200 筆，排除前十七輪全部已完成 ID。種子 59，最大餘數法分配：500 12、Alchemist 8、Antler 18、EF 10、Plug and Play 34、Techstars 38、YC 80。

## 保存位置

- 正式結果：`data/processed/companies/batches/round-018.json`。
- 進度：同資料夾 `progress.json`。
- 抽樣原文、來源對照、抽樣紀錄與人工標記：`data/processed/companies/round-018-review/`。

## 留空及必要註記

- 摘要 null 3 筆：Samaria、Coast、Phases；原文只有概括定位或未明確的工作對象，缺乏具體產品資訊。
- 產業／客群空值 33 筆；問題／工作環節空值 25 筆；解法空值 4 筆。空值可重疊，不相加當作公司數，也不代表錯誤率。
- Palisade 有兩筆不同描述：交易市集銷售 agents 與作業系統漏洞偵測修復，各自保留 ID，不合併。
- Invision AI 描述使用 Algocian；Lucor 描述使用 BlueStamp Health 與 BluePilot；Intellingece Design 描述使用 Intelligence Design。保留原名及原文並註記，不猜改名關係。
- PermitPortal 未列施工前具體作業，不依名稱補許可申請；GlocAI 未明示業別，不推定為營建。
- ThirdRoc 未明說 AI 功能；MarkOS 檢查人工或 AI 生成內容，也不直接推定檢查工具本身使用 AI。
- The AI Education Project 提供 AI 教育；晶片、資料及基礎設施按原文明列用途整理，不一概視為使用 AI 的產品。
- Marft、Paperspace、Taiv、Scalar Field 等介紹截斷，只整理可讀內容。
- Boton、CODEXA、Lexi 等未列模組，不補具體會計、財務或法律工作。
- 不重新篩選母體、不補查公司現況。

## 檢查與進度

已檢查 schema、200 個唯一 ID、跨輪次不重複、原文與 raw 索引對應、來源及各輪雜湊、同義詞規則、抽樣可重現性及累積進度。raw、AI 篩選母體與前十七輪資料保持原樣。

第十八輪完成時累積 3,600／4,085 筆，剩餘 485 筆。後續第十九輪已完成，詳見 `round-019-log.md`；最新進度以 `progress.json` 為準。
