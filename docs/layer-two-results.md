# Layer 2：動態探索結果

日期：2026-11-03。使用者授權先完成 Layer 2，Layer 3 待 Layer 2 確認後再討論。

## 功能與範圍

### 條件與命中 tags 小改版（2026-11-03）

上方已選條件依「服務誰／工作／做法」分行；同組多選以「或」連接，仍可逐項取消。只顯示有選擇的組別，不增加新篩選。

每家公司在摘要下方新增唯讀「符合條件」大類 tags，由該筆 `categories` 與目前 `selected` 的交集計算。標示公司為何出現在結果，不將未命中的選取項貼到公司上。原有三維細 tags 保留供比較。沒有選條件看全部紀錄時，不顯示命中列。

本次不改同欄 OR／跨欄 AND、資料、分頁或 Layer 1，仍不建立 Layer 3。14 項測試通過；新增檢查多選下不誤貼條件，以及無條件與未知分類的顯示。

瀏覽器確認：醫療／教育 × 行銷銷售／客服 × agents／語音共有 11 筆；10x 僅標示醫療、行銷銷售及 agents，原細 tags 仍為牙科診所／銷售／AI agents。手機檢查無水平溢出；清除後回 4,085 筆且命中列消失。

功能版本 `1f12a9c` 已上線，[部署 41635586268](https://github.com/vcstseng/startup-radar/actions/runs/41635586268) 成功，包含 14 項測試與建置。公開頁面已確認分組條件及 10x 的實際命中 tags 正常顯示；[新版畫面](screenshots/layer-two-match-tags.jpg)。

- Layer 1 的「查看結果」已啟用，單選、多選及未選條件皆可進入；零筆組合停用入口。
- 共用結果模板以 `facets` 找完整符合 ID，再從 `records` 讀取紀錄，不以 `example_ids` 代替完整結果。
- 單欄列表，每頁 20 筆；呈現公司名稱、中文摘要、三維原始細 tags 與名錄來源。
- 保持 catalog 原有順序，標示「非排名」；缺漏直接標示，不補推測。
- 可移除單項條件或全部清除，條件改變後回第一頁。
- 「調整分類」與返回入口回到 Layer 1，保留條件、原本位置及手機維度，不重複三欄選擇器。
- 網址保存條件與頁次，支援分享、重新整理、上一頁／下一頁；歷史紀錄另存捲動位置。
- 載入、失敗重試、零筆結果與頁次越界都有對應處理。

本輪不做 Layer 3，不放詳情按鈕或假的跳轉。不新增搜尋、登入、收藏、AI 補查、官網查證或 99 Problems 對應。99 Problems 源自 104 JD，本輪不據此宣稱企業需求已驗證。

## 網址與資料讀取

```text
分類入口：/?industry=healthcare&solution=voice-conversation
結果第一頁：/?industry=healthcare&solution=voice-conversation&view=results
結果第二頁：/?industry=healthcare&solution=voice-conversation&view=results&page=2
```

線上網址位於 `/startup-radar/`。同欄 OR／跨欄 AND 不變。未知分類 ID 忽略；非法頁次回第一頁，超出頁數修正到最後一頁。

`src/lib/catalog.ts` 集中讀取資料。首次進入 Layer 2 才載入 records，依 build_id 在當次瀏覽中快取重用；不預載詳情。未來 API 可在此資料讀取層銜接。

- `src/lib/route.ts`：網址解析與分頁。
- `src/lib/useExploreRoute.ts`：前進、返回、歷史與位置還原。
- `src/components/SelectionSummary.tsx`：兩層共用條件摘要。
- `src/components/ResultsList.tsx`：列表與分頁。

upstream ID 是固定快照內的紀錄參照，不是跨快照永久公司身分。補充資料以 dataset_id＋紀錄 ID 核對。

## 手動補充摘要

編輯 `data/supplements/v1/companies.json`，不直接改 catalog 或正式批次。目前 `records_by_id` 為空，沒有示範或臆測資料。

以下僅為格式示意；實際 ID、介紹、來源及日期須換成真實且有依據的內容：

```json
{
  "schema_version": "1.0",
  "dataset_id": "startup-radar-d2af24ed6a509b85-4085",
  "records_by_id": {
    "upstream-xxxxx": {
      "summary_zh": "有來源支持的人工補充介紹",
      "source_url": "https://example.com/product",
      "updated_at": "2026-11-03"
    }
  }
}
```

本版只支援摘要，須附 HTTP／HTTPS 來源與有效日期。若有人工摘要，列表優先呈現，標示人工補充、來源及日期；原摘要仍保留在 catalog，沒有覆寫。tags 與分類不受補充摘要影響。其他欄位待需要時再擴充。

修改後執行 `npm test`、`npm run build`，通過後 commit／push main 自動部署。開發預覽直接讀補充檔，建置複製到允許公開的資產目錄。補充檔版本、ID、來源或日期有誤時 CI 失敗；執行時若載入失敗，提示並提供重試，仍顯示原有紀錄。

## 驗證

- 12 項測試：既有 8 項＋網址與頁次、20 筆分頁、實際補充檔、人工補充驗證。
- 正式建置與 GitHub Pages 子路徑建置。
- 醫療＋語音 24 筆分為 20＋4；第二頁重新整理後保留，移除語音回醫療 452 筆第一頁。
- 返回分類保留條件；以實際畫面操作驗證捲動 y=1028.8 返回後還原到相同位置；瀏覽器上一頁可回結果。
- 零筆仍可調整；手機 390×844 下顯示 20 筆且無水平溢出。
- 未改 raw、正式批次、catalog 或分類規則；沒有補寫真實公司的介紹。

截圖：`screenshots/layer-two-desktop.jpg`。上線結果以 GitHub Pages／Actions 為準。

## 上線紀錄

已推送功能版本 `b238b9d`，GitHub Actions [41632997678](https://github.com/vcstseng/startup-radar/actions/runs/41632997678) 的 build／12 項測試／deploy 全部成功。公開結果頁已確認載入 24 筆醫療＋語音結果，第一頁 20 筆；補充檔正常，不顯示錯誤提示。

- [公開 Layer 2 範例](https://vcstseng.github.io/startup-radar/?industry=healthcare&solution=voice-conversation&view=results)
- [公開版截圖](screenshots/layer-two-live.jpg)

本輪完成後停止；Layer 3 等使用者確認後再開始。
