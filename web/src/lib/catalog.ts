import { AXES, type CatalogSummary, type Facets, type Taxonomy } from '../types.js';

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

