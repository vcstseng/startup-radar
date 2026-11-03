import type { ManualSummary, Supplements } from '../types.js';

export function validateSupplements(value: unknown, datasetId: string, validIds: Set<string>): Supplements {
  if (!value || typeof value !== 'object') throw new Error('補充資料格式錯誤');
  const data = value as Partial<Supplements>;
  if (data.schema_version !== '1.0' || data.dataset_id !== datasetId || !data.records_by_id ||
      typeof data.records_by_id !== 'object' || Array.isArray(data.records_by_id)) throw new Error('補充資料版本或資料集不符');
  for (const [id, item] of Object.entries(data.records_by_id)) {
    if (!validIds.has(id) || !item || typeof item !== 'object') throw new Error('補充資料的紀錄 ID 無效');
    const entry = item as ManualSummary;
    if (Object.keys(item).some(key => !['summary_zh', 'source_url', 'updated_at'].includes(key))) throw new Error('補充資料含尚未支援的欄位');
    if (typeof entry.summary_zh !== 'string' || !entry.summary_zh.trim() ||
        typeof entry.source_url !== 'string' || !/^https?:\/\//i.test(entry.source_url) ||
        typeof entry.updated_at !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.updated_at)) throw new Error('補充摘要缺少內容、來源或日期');
    try {
      const url = new URL(entry.source_url);
      if (!url.hostname || url.username || url.password) throw new Error();
    } catch { throw new Error('補充摘要來源網址無效'); }
    const date = new Date(entry.updated_at);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== entry.updated_at) throw new Error('補充摘要日期無效');
  }
  return data as Supplements;
}
