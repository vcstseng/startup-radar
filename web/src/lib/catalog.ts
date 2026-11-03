import { AXES, type CatalogRecord, type CatalogSummary, type Facets, type Supplements, type Taxonomy } from '../types.js';
import { validateSupplements } from './supplements.js';
import { detailFromBatch } from './company.js';

export interface PortalData { taxonomy: Taxonomy; facets: Facets; summary: CatalogSummary; allIds: Set<string> }
export async function loadPortal(signal: AbortSignal): Promise<PortalData> {
  const base = `${import.meta.env.BASE_URL}data/catalog/`;
  const get = async <T,>(file: string): Promise<T> => {
    const response = await fetch(base + file, { signal });
    if (!response.ok) throw new Error(`無法載入分類資料（${response.status}）`);
    return response.json() as Promise<T>;
  };
  const index = await get<{ files: Record<string, string>; build_id: string }>('index.json');
  const [taxonomy, facets, summary] = await Promise.all([
    get<Taxonomy>(index.files.taxonomy), get<Facets>(index.files.facets), get<CatalogSummary>(index.files.summary),
  ]);
  if (summary.build_id !== index.build_id) throw new Error('資料版本正在更新，請重新載入。');
  const allIds = new Set(Object.values(facets.dimensions.industry_customer).flatMap(bucket => bucket.record_ids));
  if (allIds.size !== summary.record_count || AXES.some(axis => !taxonomy.dimensions[axis])) {
    throw new Error('分類資料不完整，請重新載入。');
  }
  return { taxonomy, facets, summary, allIds };
}

const cachedRecords = new Map<string, CatalogRecord[]>();
export interface ResultsData { records: CatalogRecord[]; supplements: Supplements | null; supplementWarning: boolean }
export async function loadResults(portal: PortalData, signal: AbortSignal): Promise<ResultsData> {
  const dataset = portal.summary.dataset_id;
  const key = portal.summary.build_id;
  const records = cachedRecords.get(key) ?? await (async () => {
    const response = await fetch(`${import.meta.env.BASE_URL}data/catalog/records.json`, { signal });
    if (!response.ok) throw new Error('暫時無法讀取紀錄，請重試。');
    const body = await response.json() as { dataset_id: string; records: CatalogRecord[] };
    if (body.dataset_id !== dataset || !Array.isArray(body.records) || body.records.length !== portal.allIds.size ||
        new Set(body.records.map(row => row.id)).size !== portal.allIds.size || body.records.some(row => !portal.allIds.has(row.id))) {
      throw new Error('紀錄版本不一致，請重新整理頁面。');
    }
    cachedRecords.set(key, body.records);
    return body.records;
  })();
  let supplements: Supplements | null = null;
  let supplementWarning = false;
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/supplements/companies.json`, { signal });
    if (!response.ok) throw new Error();
    supplements = validateSupplements(await response.json(), dataset, portal.allIds);
  } catch (error) {
    if (signal.aborted) throw error;
    supplementWarning = true;
  }
  return { records, supplements, supplementWarning };
}

const cachedDetails = new Map<string, unknown>();
export async function loadCompanyDetail(portal: PortalData, record: CatalogRecord, signal: AbortSignal) {
  if (!/^details\/batch-\d{3}\.json$/.test(record.detail_file)) throw new Error('找不到可讀取的來源資料。');
  const key = `${portal.summary.build_id}:${record.detail_file}`;
  let batch = cachedDetails.get(key);
  if (!batch) {
    const response = await fetch(`${import.meta.env.BASE_URL}data/catalog/${record.detail_file}`, { signal });
    if (!response.ok) throw new Error('暫時無法載入來源原文，請稍後重試。');
    batch = await response.json();
  }
  const detail = detailFromBatch(batch, portal.summary.dataset_id, record);
  cachedDetails.set(key, batch);
  return detail;
}

