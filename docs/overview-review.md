# 4,085 筆整理後：第一份彙整 review

目前主要總覽已改為 [完整 4,085 筆分類分布](catalog-overview.md) 與網站資料集 `data/processed/catalog/v1/`。本頁與後續三主題 review 保留為歷史探索，不能用來代表全部資料。

後續第一步 review 已完成，見 [主題 review 與三題建議](theme-review-step-1.md)。對全量做候選檢索並人工回讀 120 筆後，建議優先追款、文件交付及牙科非治療營運；以下 7 題與 25 案例保留為原始初稿，本次沒有覆寫該初稿或逐筆資料。

逐筆閱讀已完成。這次接續工作是把現有結果整理為可討論的展示主題，沒有重寫 21 輪批次、補查官網或建立網站。

目前最有用的成果是 7 個主題、25 筆代表案例，每個案例都保留原始 ID、批次位置與完整原文。這是展示主題初稿，不是全量公司分類或成長排名。

## 做了什麼

1. 建立完整 tag 詞彙清單，包含出現筆數及對應 ID。
2. 對確定相同的字串建立 18 條同義詞規則，套用到獨立彙整檔。
3. 列出同名及同網站 hostname 候選，不自動合併公司。
4. 逐一挑選及核對 25 筆代表原文，整理 7 個主題的觀察、可探索想法與限制。

## 主題初稿

| 主題 | 能比較什麼 | 代表案例 |
| --- | --- | --- |
| 追到款項：從提醒到催收 | 應收帳款、病患帳單、B2B 債務如何接觸與跟進 | Tennis Finance、Argovox、AgentCollect、MaiCall |
| 文件如何變成下一步工作 | 同樣處理文件，交付的是談判資料、風險審閱還是回覆 | Glidely、Propaya、Inventive AI |
| 誰准 AI 做事，誰檢查結果 | 授權、核准、資料存取及失敗分析 | Clawvisor、withHuman、Opsin Security、Agnost AI |
| 讓現場工作可觀察、可交接 | 音訊、庫存影像、維修及專家知識的資訊入口 | Storefox.ai、Peckish、Pairio、InSkill |
| 用 AI 經營服務公司 | 直接做投資銀行、經紀、協會管理或廣告代理 | OffDeal、Obia、Assembly HOA、Adside.ai |
| 寫完程式之後 | 單元測試、軟體測試修復、行動應用測試的不同範圍 | Ponicode、TestSprite、Aucert |
| 同一客群的不同工作入口 | 牙科筆記、牙科銷售與一般診所接待 | Kiroku、10x、Lyngo |

最後一組刻意標示 Lyngo 是一般醫療診所，不把它擴寫成牙科專用產品。Ponicode 選取單筆代表紀錄，不因同名多筆而增加案例權重。

這些主題支持兩種探索方式：從工作看跨產業做法，或從客群看不同工作入口。兩者都能沿用既有三維 tags 與原始 ID；目前不需要擴充逐筆 schema。

完整主題及逐筆原文：[themes.json](../data/processed/overview/v1/themes.json)。人工選取輸入：[overview-themes-v1.json](../config/taxonomy/overview-themes-v1.json)。

## Tags：先修確定相同的字，不假裝已完成分類

18 條精確對照在衍生檔中影響 514 筆紀錄，合計 532 個標籤替換。例如：製造 → 製造業、模型監控 → 模型監測、AI agents → AI agent。原始分類沒有改寫，每筆替換都可追溯。

| 維度 | 原始不同 tags | 同義詞整理後 |
| --- | ---: | ---: |
| 產業／客群 | 1,166 | 1,159 |
| 問題／工作環節 | 3,449 | 3,445 |
| 解法 | 1,577 | 1,574 |

這個結果很重要：少量同義詞整理能改善一致性，但不能解決粒度差異。例如「醫療合規」是「合規」的一種，不是完全同義詞；不能為了壓低 tag 數就直接替換。AI agent、AI 助理、AI copilot、AI workforce 也不假定能力相同。

因此目前適合先用少量主題作導航，不把數千個細 tags 直接顯示為網站篩選選單，也不按未統一的 tags 做熱門排名。細 tags 仍可保留作案例檢索線索。

對照表：[overview-aliases-v1.json](../config/taxonomy/overview-aliases-v1.json)。衍生分類：[tags-view.json](../data/processed/overview/v1/tags-view.json)。變更清單：[tag-changes.json](../data/processed/overview/v1/tag-changes.json)。

## 重複候選：可以優先 review，但現在不刪資料

- 135 組同名候選，共涉及 279 筆紀錄；其中 80 組的完整介紹相同。這仍不是已確認的重複公司數。
- 105 組有相同網站 hostname，其中一組是 `antler.co`，涉及 9 家不同名稱。這是共用來源網站，不能當成公司身分。
- 同名不同描述也不能直接合併。例如 Axle 分別指向 `axlepayments.com` 與 `axle.insure`；Palisade、Lark 也有不同網址及不同工作介紹。
- 不同名稱而同網站可能是別名、改名、錯置或其他關係；目前只列候選，不推定關係。
- 同名群組與同網站群組有重疊，兩個數字不能相加。

候選清單含 ID、來源、原始網址、摘要與批次位置：[duplicate-candidates.json](../data/processed/overview/v1/duplicate-candidates.json)。沒有進行公司合併或去重。

## 能信到哪一層

4,085 筆均有唯一 ID 並完整覆蓋固定母體。54 筆摘要留空，336 筆沒有產業／客群、493 筆沒有工作環節、90 筆沒有解法；這些數字可重疊，不是錯誤率。

資料描述仍有截斷、口號及公司自述。主題有原文案例支持，但沒有驗證產品現況、效果、客戶採用或商業成功。資料也不能證明哪個題目隨時間成長。

本次驗證覆蓋原檔及批次雜湊、母體 ID、衍生分類對應、計數、重複候選引用與 25 個案例原文。它不代表已對所有 4,085 筆中文解讀進行第二次獨立語意複核。

## 下一次討論的起點

先 review 這 7 個主題是否容易理解、能否幫忙產生想法，再決定先展示哪幾個。無需先把所有細 tags 重做，也無需為了展示案例先完成公司去重。

如果接下來要做公司數量圖表，應先確定公司身分及主題歸屬口徑；如果先做主題與代表案例，現有底稿已可支援內容設計。網站框架、公開發布及外部補查尚未開始。

重建彙整：`python scripts/analyze/build_overview.py`。輸出集中於 `data/processed/overview/v1/`；`manifest.json` 保存來源與輸出雜湊，`summary.json` 保存統計。這個流程不呼叫網路、不改寫原始資料或既有批次。
