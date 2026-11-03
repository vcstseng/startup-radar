import { AXES, type CatalogRecord, type CompanyDetail } from '../types.js';

export function safeWebsite(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function detailFromBatch(value: unknown, datasetId: string, record: CatalogRecord): CompanyDetail {
  if (!value || typeof value !== 'object') throw new Error('來源資料格式不完整');
  const batch = value as { dataset_id?: string; records_by_id?: Record<string, CompanyDetail> };
  const detail = batch.records_by_id?.[record.id];
  if (batch.dataset_id !== datasetId || !detail || detail.id !== record.id || detail.name !== record.name || detail.source !== record.source ||
      detail.summary_zh !== record.summary_zh || !detail.evidence || typeof detail.evidence.text !== 'string' || typeof detail.evidence.field !== 'string' ||
      !Array.isArray(detail.notes) || detail.notes.some(note => typeof note !== 'string') || !detail.tags ||
      AXES.some(axis => !Array.isArray(detail.tags[axis]) || JSON.stringify(detail.tags[axis]) !== JSON.stringify(record.tags[axis]))) {
    throw new Error('來源資料與目前紀錄不一致，請重新整理或稍後重試。');
  }
  return detail;
}
