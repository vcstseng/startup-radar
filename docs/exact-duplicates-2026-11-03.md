# 明確重複檢查與網站展示合併

日期：2026-11-03。依使用者授權檢查全部 4,085 筆，僅合併名稱、有效網址與來源原文三者字串完全相同且非空的紀錄。

## 結果

| 項目 | 數量 |
| --- | ---: |
| 原始紀錄 | 4,085 |
| 明確重複群組 | 84 |
| 群組內原始紀錄 | 169 |
| 減少的重複展示列 | 85 |
| 網站展示紀錄 | 4,000 |
| 缺名稱／可用網址／原文而不合併 | 487 |
| 未完全合併的同名群 | 49 |
| 摘要有差異的重複群 | 56 |
| 細 tags 有差異的重複群 | 44 |
| 大類有差異的重複群 | 36 |
| 註記有差異的重複群 | 37 |

4,000 是合併明確重複後的展示筆數，不宣稱有 4,000 家獨立公司。名字相同但網址、原文不同或缺漏的紀錄未自動合併；全量差異保存在 audit。

## 三層一致的處理方式

1. 原始快照、正式批次、catalog、原文、摘要、tags 與 notes 不刪除、不改寫；另存展示對照。
2. 先對每筆原始紀錄執行同欄 OR／跨欄 AND，再以相同對照計算唯一展示群組。不能先把群組內 tags 拼在一起，否則可能造成不存在於任何一筆原始紀錄的假交集。
3. Layer 1 上方筆數、分類候選計數與 Layer 2 列表總數均依相同方式合併。首頁介紹的 4,085 指原始紀錄，上方全量展示筆數為 4,000。
4. 列表保留同組第一筆實際符合條件的原始紀錄，沿用原本資料順序與該筆摘要／tags，不綜合編寫新介紹。不會因只保留固定代表筆而漏掉另一筆才命中的條件。
5. 原始 ID 連結繼續有效。Layer 3 顯示同組合併說明，提供可展開的原始摘要／tags／來源／ID 對照，以及切換該筆原文與 notes 的連結。原始紀錄頁仍套用同一模板，不另建靜態頁。
6. 有人工摘要時仍依原始 ID 保存；被合併紀錄的補充也可在原始整理對照內查看，不擅自套用到另一筆。
7. 全量分頁從原本 205 頁變成 200 頁；超出頁數的舊結果連結自動修正到最後有效頁。其他返回與位置處理沿用既有機制。

## Flyr 範例

`upstream-20666` 與 `upstream-21284` 的名稱、網址、原文相同，但摘要與 tags 不完全相同。航空＋行銷銷售條件下列表只出現一次；若再選只有第二筆含有的 software-platforms 大類，第二筆仍可命中並展示，沒有抹掉「管理系統」細 tag。詳情可回查兩個 ID。

## 檔案與重建

- `scripts/analyze/build_exact_duplicates.py`：只讀既有 catalog／詳情，產生展示對照與差異清單。
- `data/processed/display/v1/duplicates.json`：供網站讀取的精簡群組對照，綁定 dataset_id、build_id 與來源筆數。
- `data/processed/display/v1/audit.json`：全部 84 組原文、整理差異、487 筆缺比對欄位的 ID，以及 49 個未完全合併的同名群。
- `data/processed/display/v1/manifest.json`：audit／展示對照及輸入來源的雜湊。

來源或 catalog 更新後，執行 `python scripts/analyze/build_exact_duplicates.py`，再執行 `npm test` 與 `npm run build`。網站建置只複製 duplicates.json，不發布完整 audit；CI 會驗證對照未過期且所有群組仍符合完全相同比對規則。

## 驗證

23 項測試包含：全部 4,085 筆重新推導的群組與產出一致、84 組皆符合完整三欄比對、4000 筆展示總數、分類計數與結果一致、Flyr 次要紀錄仍可命中、舊 ID 回查、過期或重疊對照拒絕，以及不跨紀錄拼 tags 的反例。

瀏覽器確認入口及列表同為 4,000；航空＋行銷銷售條件顯示 Flyr 一筆並標示合併 2 筆，原始整理可展開／切換；手機展開後無水平溢出。

## 上線驗證

功能版本 `c448032` 已公開部署，[Actions 41641573618](https://github.com/vcstseng/startup-radar/actions/runs/41641573618) 的 23 項測試、建置與部署成功。公開航空＋行銷銷售結果已確認總數與列表同為 1，Flyr 只展示一次並標示已合併 2 筆。

- [查看 Flyr 合併展示](https://vcstseng.github.io/startup-radar/?industry=aerospace&work=sales-marketing&view=results)
- [公開畫面](screenshots/exact-duplicate-flyr.jpg)

## 明確重複群組完整清單

下列差異不直接視為錯誤，也未自動統一措辭。原文逐組完全相同，整理內容在 audit 中原樣保留。

| 名稱 | 原始 ID | 整理差異 |
| --- | --- | --- |
| SapplyM<br>(JV between Sony and M3) | upstream-15929、upstream-20861 | 無 |
| Tractable | upstream-16435、upstream-21237 | 摘要、細 tags、大類、註記 |
| Flexiv Robotics | upstream-16437、upstream-21289 | 摘要、細 tags |
| Lazarus AI | upstream-16486、upstream-21234 | 無 |
| Owkin | upstream-16535、upstream-21288 | 摘要、細 tags、大類 |
| Zesty.ai | upstream-16560、upstream-21233 | 摘要、細 tags |
| SoundHound | upstream-17036、upstream-21298 | 摘要、細 tags、大類、註記 |
| Qiznalo | upstream-17157、upstream-17875 | 註記 |
| Tiwaki | upstream-17203、upstream-18008 | 摘要、細 tags、大類、註記 |
| YAMATO | upstream-17238、upstream-17907 | 註記 |
| 株式会社アイズファクトリー | upstream-17302、upstream-17923 | 無 |
| ASHITA-TEAM | upstream-17319、upstream-17940 | 註記 |
| Qosmo, Inc | upstream-17478、upstream-17960 | 摘要 |
| RICOS | upstream-17490、upstream-17972 | 細 tags、大類 |
| SaveExpats | upstream-17498、upstream-17980 | 無 |
| Oneroots | upstream-17592、upstream-17844 | 摘要、細 tags、大類、註記 |
| Passionate Genius | upstream-17600、upstream-17944 | 無 |
| Preferred Networks | upstream-17609、upstream-17953 | 摘要、細 tags、大類、註記 |
| Pros Cons | upstream-17613、upstream-17957 | 摘要、細 tags、大類 |
| Pyrenee | upstream-17615、upstream-17959 | 摘要、細 tags、註記 |
| Dyad | upstream-18055、upstream-20210 | 摘要、註記 |
| InfrasAI | upstream-18058、upstream-20213 | 摘要、細 tags、大類 |
| Singularity.AI | upstream-18070、upstream-20225 | 摘要 |
| Iterative Health | upstream-18098、upstream-20094 | 摘要、註記 |
| Inytcer | upstream-18137、upstream-20047 | 摘要、註記 |
| Got It | upstream-18188、upstream-19969 | 摘要、細 tags、大類、註記 |
| EMAGIN (acq. by Innovyze) | upstream-18203、upstream-20195 | 摘要、註記 |
| Skan AI | upstream-18211、upstream-19871 | 摘要、細 tags、註記 |
| Jerry | upstream-18213、upstream-19873 | 摘要、細 tags、大類 |
| SuperAnnotate AI | upstream-18214、upstream-19874 | 無 |
| Turing | upstream-18218、upstream-19878 | 摘要、註記 |
| IDnow | upstream-18219、upstream-19879 | 無 |
| Tint | upstream-18226、upstream-19886 | 無 |
| DeepVu | upstream-18231、upstream-19891 | 摘要、細 tags、大類、註記 |
| SparkCognition | upstream-18233、upstream-19893 | 註記 |
| Automation Hero | upstream-18234、upstream-19894 | 註記 |
| DIMAAG | upstream-18242、upstream-20155 | 摘要、細 tags、大類、註記 |
| SportsSeam | upstream-18250、upstream-20245 | 摘要、細 tags、大類、註記 |
| Attestiv | upstream-18255、upstream-20250 | 摘要 |
| Kinta AI | upstream-18260、upstream-20255 | 細 tags、大類、註記 |
| Markable | upstream-18261、upstream-20256 | 摘要、細 tags、大類、註記 |
| nFlux | upstream-18271、upstream-20266 | 摘要、細 tags、大類、註記 |
| Zama | upstream-18272、upstream-20267、upstream-21301 | 細 tags、大類 |
| LinQuip | upstream-18289、upstream-19910 | 摘要、註記 |
| delt.ai | upstream-18302、upstream-19923 | 摘要、細 tags |
| Ponicode | upstream-18307、upstream-19928 | 無 |
| DriveX | upstream-18309、upstream-19930 | 註記 |
| Hypatos | upstream-18310、upstream-19931 | 摘要、細 tags、註記 |
| Pipra AG | upstream-18315、upstream-19936 | 無 |
| Vara | upstream-18316、upstream-19937 | 無 |
| SimpliRoute | upstream-18321、upstream-19942 | 摘要 |
| OpenSilo | upstream-18332、upstream-19997 | 摘要 |
| YOURIKA | upstream-18335、upstream-20000 | 註記 |
| IDnow | upstream-18339、upstream-20004 | 無 |
| Visionairy Health | upstream-18349、upstream-20014 | 摘要、註記 |
| askporter | upstream-18368、upstream-20159 | 無 |
| Gali Health Inc. | upstream-18373、upstream-20164 | 摘要、細 tags、大類 |
| FundGuard | upstream-18378、upstream-20169 | 摘要、註記 |
| Recogni | upstream-18383、upstream-20174 | 摘要、細 tags |
| E-AI | upstream-18396、upstream-20187 | 摘要、細 tags、大類 |
| Circle | upstream-18398、upstream-20189 | 摘要、細 tags、大類 |
| Senseye | upstream-18400、upstream-20191 | 摘要、細 tags、大類 |
| Concertio | upstream-18418、upstream-20128 | 無 |
| ForMotiv | upstream-18424、upstream-20134 | 摘要、細 tags、大類 |
| Celus | upstream-18428、upstream-20138 | 摘要、細 tags、大類 |
| QuadFi | upstream-18442、upstream-20152 | 摘要、細 tags、大類 |
| Sustainable Lab Inc. | upstream-18573、upstream-18924 | 無 |
| EdMuse | upstream-18577、upstream-18928 | 摘要、細 tags、大類、註記 |
| Scentmatic | upstream-18581、upstream-18932 | 摘要、細 tags、大類 |
| Ubitone Inc. | upstream-18646、upstream-18864 | 摘要、細 tags、大類、註記 |
| Hutzper | upstream-18664、upstream-18843 | 細 tags、大類、註記 |
| Tegaki | upstream-18667、upstream-18846 | 摘要、細 tags、大類 |
| Hatapro | upstream-18676、upstream-18855 | 無 |
| Origin Wireless Japan | upstream-18681、upstream-18860 | 摘要、細 tags、大類 |
| FutuRocket Co. | upstream-18836、upstream-18867 | 摘要、註記 |
| ABEJA | upstream-18839、upstream-18870 | 無 |
| zypl.ai | upstream-20390、upstream-21305 | 摘要、細 tags、大類 |
| Xatoms | upstream-20514、upstream-21218 | 摘要、細 tags、大類 |
| BigID | upstream-20658、upstream-21276 | 摘要 |
| Flyr | upstream-20666、upstream-21284 | 摘要、細 tags、大類 |
| Kisui Tech | upstream-20793、upstream-20904 | 摘要、細 tags、註記 |
| Lasiina | upstream-20796、upstream-20907 | 摘要、細 tags、大類、註記 |
| GreenAI | upstream-20808、upstream-20919 | 摘要 |
| Elix, Inc | upstream-20820、upstream-21155 | 摘要、細 tags、大類、註記 |
