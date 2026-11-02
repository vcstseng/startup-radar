# 資料流程草案

目前執行方式已收斂為每輪最多 200 筆的輕量分類，先不要求每輪產生趨勢或 ideas。正式格式及進度見 `docs/batch-data-format.md`；第一輪在 `data/processed/companies/batches/round-001.json`，進度在同資料夾的 `progress.json`。下方為較早的長期流程草案，非目前每輪要求。

1. `scripts/ingest` 取得名錄，存入 `data/raw/snapshots`，記錄來源、時間與抽樣／下載資訊。
2. `scripts/process` 讀取原始名錄，產出 `data/processed/companies` 的公司摘要與 tags，保留原始紀錄對照；不覆寫 raw。
3. `scripts/analyze` 將公司依問題與解法分群，產出 `data/processed/trends` 的觀察及 `data/processed/ideas` 的延伸想法。
4. 網站載入整理後的趨勢與摘要，用共用模板顯示公司內容。
5. 使用者要求深入查看公司時，由 `server/services` 查詢所需資料，結果存入 `data/cache/company-details`，附來源、查詢時間與待更新時間。

目前僅建立目錄與說明，以上流程尚未實作。儲存格式、資料庫、網站框架及查詢服務待後續選定；資料夾先作為各類資料的存放邊界。

首頁不以未確認意義的年份推論成長速度。即時查詢失敗時，應顯示已有摘要與資料時間，避免把舊資料當成最新資訊。
