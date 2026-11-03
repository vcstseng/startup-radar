# Layer 3：動態公司資料頁

日期：2026-11-03。使用者確認保留三層架構，並授權開發、部署共用公司詳情模板。

## 完成範圍

- Layer 2 的公司名稱與「查看詳情」都能進入；採真正連結，可另開分頁。
- 一個共用模板依 URL 的紀錄 ID 找到 `detail_file`，按需讀取既有 21 份詳情 JSON 之一，不為每筆預建頁面，不呼叫 AI。
- 顯示名稱、原始整理摘要、實際命中的已選大分類、完整三維細 tags、來源原文與名錄來源。
- 只有 notes 非空才顯示資料註記；有可用 HTTP／HTTPS 網址才顯示外部網站，標示原名錄提供且尚未查證現況。
- 有人工補充才另列內容、來源與日期，不混入原始摘要或原文。沿用 `data/supplements/v1/companies.json`，目前沒有實際補充紀錄。
- 命中 tags 及細 tags 都是唯讀，不會意外改變篩選條件。沒有條件直接開啟公司頁時不顯示命中列。
- 可複製公司連結；返回探索結果時保留條件、頁次與位置，支援重新整理及瀏覽器上一頁／下一頁。
- 找不到 ID、來源讀取失敗或資料集不一致時顯示提示及返回／重試操作，不拿別筆內容填入。

沒有增加收藏、評分、相似公司、自動補查或 99 Problems 對應。原文只有一句就保持簡短，不增加原文不支持的功能、成效或業務推論。

## 網址與返回

```text
直接分享公司：
/startup-radar/?view=company&id=upstream-10109

帶探索條件：
/startup-radar/?industry=healthcare&work=sales-marketing&solution=agents&view=company&id=upstream-10109

從結果第二頁進入：
/startup-radar/?industry=healthcare&solution=voice-conversation&view=company&page=2&id=upstream-16596
```

view、ID、分類條件與頁次保存在 query；捲動位置存在該瀏覽器的 history entry。若直接開公司連結沒有列表歷史，返回時依網址條件／頁次產生結果；未提供條件則返回全部紀錄。分享連結不攜帶另一位使用者的捲動位置。

目前 upstream ID 僅識別這份固定快照內的紀錄，不宣稱是跨快照的永久公司 ID。資料載入與補充仍核對 dataset_id。

## 實作接點

- `src/lib/route.ts`：新增 `view=company` 與 `id`；返回 results 的網址移除公司 ID，保留條件／頁次。
- `src/lib/useExploreRoute.ts`：保存 results 位置並提供 returnToResults。
- `src/lib/catalog.ts`：集中讀取詳情，成功後以 build_id＋detail_file 快取；只允許既有分批詳情路徑。
- `src/lib/company.ts`：確認詳情的 dataset_id、ID、名稱、摘要、source、tags 與主表一致；驗證原文與 notes 類型；限制外部網址為 HTTP／HTTPS。
- `src/components/CompanyPage.tsx`：共用資料頁，空的補充／註記／網站區塊不顯示。
- `src/components/RecordContext.tsx`：Layer 2／3 共用命中 tags、細 tags 與來源名稱。

直接開公司頁仍須讀取輕量主表以找到詳情路徑，但不下載全部 21 份原文；Layer 1／2 也不因此預載詳情。官網連結只是使用者自行前往，程式未擷取或驗證官網。

## 驗證紀錄

- 18 項測試通過：既有 14 項＋公司網址往返、全部 4,085 筆的 21 批詳情對應、錯誤資料拒絕、外部網址限制。
- TypeScript 與正式建置通過，部署使用 `/startup-radar/` base。
- 10x：原文為「AI Sales Teams for Dental Practices」，保留原短摘要、三個命中大類與牙科診所／銷售／AI agents 細 tags，沒有增加功能。
- Aaron.ai：顯示既有 notes「未說明紀錄、電話或其他任務。」；從醫療＋語音第二頁進入，詳情重新整理後返回，仍為 21–24／24 筆、page=2，捲動位置從 y=432 還原至 y=432。
- Parsed：無條件直接分享，不顯示命中 tags；沒有可用網址，不顯示外部網站區塊。
- 無效 ID：顯示找不到紀錄及返回結果操作。
- 手機 390×844 的 DOM 與尺寸檢查無水平溢出；複製連結顯示成功狀態。桌面及手機實際畫面均確認，公開版截圖見下。
- 原始快照、正式批次、catalog、分類規則與補充資料均未改寫。沒有新填寫公司資料。

## 公開部署

功能版本 `35bd41d` 已上線，[部署 41638101441](https://github.com/vcstseng/startup-radar/actions/runs/41638101441) 成功。公開公司頁可直接讀取原文，返回結果後可再次從公司名稱進入。

- [10x 公司頁範例](https://vcstseng.github.io/startup-radar/?industry=healthcare&work=sales-marketing&solution=agents&view=company&id=upstream-10109)
- [公開版手機畫面](screenshots/layer-three-company.jpg)

本輪到此完成，未新增公司資料或外部查證內容。
