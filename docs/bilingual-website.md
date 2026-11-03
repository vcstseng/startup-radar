# 中英文網站

日期：2026-11-04。

## 使用方式

右上角「中文／English」切換三層共用介面。預設中文，英文網址使用 `?lang=en`（有其他參數時加 `&lang=en`）。語言不改資料母體、條件、頁次或公司 ID；切換採用目前歷史項目的 URL 更新，保留位置，不增加一個篩選撤回步驟。重新整理和分享由 URL 還原語言，舊中文連結繼續有效，不依瀏覽器語言自動跳轉。

Layer 1：三個入口、75 個大分類及各維度的資訊不足／待歸類、計數說明、操作、手機結果列皆雙語。Layer 2：條件、結果列表、分頁、來源與合併說明雙語。Layer 3：導覽、原文、網站、合併回查及限制說明雙語。文件語言同步為 `zh-Hant` 或 `en`，標題與可存取名稱一起切換。

## 資料內容的界線

- 中文版保持既有中文摘要、細 tags 和註記。
- 英文版公司介紹直接使用保存的來源原文節錄，最多 360 字元後加省略號；列表標示 original source text，詳情有完整原文。來源本身的截斷、語言、宣稱和過時資訊仍保留，沒有外部補查或重寫成已證實事實。
- 英文主分類欄顯示既有大類的英文名稱；逐筆細 tags 尚未逐條英譯，保留於「Original Chinese tags」可展開查看。資料註記標示 Original Chinese data notes。
- 重複群組中的原中文摘要差異繼續保存，標示 Original Chinese summary；人工補充若未來新增，詳情標示 Additional notes (Chinese)，不憑空產生英文補充。
- 語言差異不影響 OR／AND、去重、分布分母或 4,000 筆展示計數。正式 raw、21 輪批次、catalog、taxonomy 與 supplements 均不改。

## 實作與驗證

翻譯字典：`web/src/lib/translations.ts`；共用 context：`language.tsx`。`ExploreRoute` 新增可選的 `lang: en`，缺少時仍沿用舊格式。語言切換廣播相同頁面狀態更新，既有導覽保留選取／分頁／ID。

`web/scripts/prepare-source-texts.mjs` 在開發啟動、測試與正式建置時，從 detail 批次產生忽略追蹤的 `web/public/data/localization/source-texts.json`；只輸出 build_id 與 ID→原文對照。首頁不載入此檔；結果／詳情載入時檢查版本及 ID 完整性。檔案是衍生的公開原文索引，不是另一份公司分析結果。

27 項測試通過，包含所有大分類／明示介面鍵的翻譯覆蓋、雙語 URL 往返，以及全 4,085 筆原文逐字對照；保留既有分類、展示去重與補充驗證。TypeScript 與正式建置通過。

瀏覽器確認：醫療＋語音中英切換維持 24 筆，英文結果第二頁→Aaron.ai 詳情→語言往返→結果第二頁可用。重新整理保留英文；手機三維切換、固定結果列與兩種語言切換可用，首頁及結果無橫向溢出。

英文畫面：`screenshots/bilingual-english.jpg`。公開上線狀態記於當日進度。
