# GitHub 儲存庫

日期：2026-11-02。使用者指定在與 99 Problems 相同的 `vcstseng` 帳號，新建公開 repository。

- 本專案：<https://github.com/vcstseng/startup-radar>
- 網站：<https://vcstseng.github.io/startup-radar/>（GitHub Pages，與 99 Problems 採同一平台）
- 99 Problems：<https://github.com/vcstseng/99-problems>（獨立專案，不混入本儲存庫）
- 原始資料來源：<https://github.com/yigitmeteozcan/startups>
- 本機工作目錄：`D:\startup-radar`
- 主要分支：`main`

保存程式、分類設定、原始下載快照、正式批次、衍生 catalog、review 紀錄與 docs。所有來源資訊及已知限制沿用各資料 manifest；未新增對上游資料的授權宣稱。

排除相依套件、建置產物、複製至網站公開目錄的衍生資產、暫存、機器設定及憑證。`.gitattributes` 保留檔案原始位元組，避免換行轉換破壞既有 SHA-256 驗證。

GitHub repository 保存原始碼與資料；網站另以 GitHub Pages 發布。目前已有 Layer 1 與 Layer 2，查看結果入口已啟用；Layer 3 尚未實作。

部署設定在 `.github/workflows/deploy-pages.yml`：推送 main → npm ci → 12 項測試 → 以 `/startup-radar/` 為 base 建置 → 發布 `web/dist`。網站資產只包含準備腳本允許的 catalog 與補充 JSON，不直接發布 repository 的 raw／review 目錄。`.gitattributes` 不改既有 manifest 所驗證的位元組。

前端啟動及檢查方式見 `layer-one-portal.md`。複製儲存庫後，於 `web` 執行 `npm ci`，再執行 `npm run dev -- --port 4173 --strictPort`。`npm run build` 會準備網站所需資料並建置。
