import type { CatalogRecord } from '../types.js';

export interface DuplicateIndex {
  canonicalById: Map<string, string>; groups: Map<string, string[]>;
  sourceRecordCount: number; displayRecordCount: number;
}
export function duplicateIndex(value: unknown, datasetId: string, buildId: string, allIds: Set<string>): DuplicateIndex {
  const data = value as { schema_version?: string; dataset_id?: string; build_id?: string; rule?: string;
    source_record_count?: number; display_record_count?: number; groups?: Record<string, unknown> } | null;
  if (!data || data.schema_version !== '1.0' || data.dataset_id !== datasetId || data.build_id !== buildId ||
      data.rule !== 'exact_nonempty_name_website_evidence' || data.source_record_count !== allIds.size ||
      !data.groups || typeof data.groups !== 'object' || Array.isArray(data.groups)) throw new Error('展示資料版本不一致，請重新載入。');
  const canonicalById = new Map<string, string>();
  const groups = new Map<string, string[]>();
  for (const [canonical, ids] of Object.entries(data.groups)) {
    if (!Array.isArray(ids) || ids.length < 2 || ids[0] !== canonical ||
        ids.some(id => typeof id !== 'string' || !allIds.has(id) || canonicalById.has(id)) || new Set(ids).size !== ids.length) {
      throw new Error('重複紀錄對照不完整，請重新載入。');
    }
    for (const id of ids) canonicalById.set(id, canonical);
    groups.set(canonical, ids);
  }
  const displayRecordCount = allIds.size - [...groups.values()].reduce((sum, ids) => sum + ids.length - 1, 0);
  if (data.display_record_count !== displayRecordCount) throw new Error('展示筆數不一致，請重新載入。');
  return { canonicalById, groups, sourceRecordCount: allIds.size, displayRecordCount };
}
export function uniqueDisplayCount(ids: Iterable<string>, index?: DuplicateIndex): number {
  return new Set([...ids].map(id => index?.canonicalById.get(id) ?? id)).size;
}
export function duplicateIds(id: string, index: DuplicateIndex): string[] {
  return index.groups.get(index.canonicalById.get(id) ?? id) ?? [id];
}
// Filter source records FIRST; then retain the first matching member in each group.
// Never union tags across members before evaluating a cross-dimension query.
export function collapseRecords(records: CatalogRecord[], index: DuplicateIndex): CatalogRecord[] {
  const seen = new Set<string>();
  return records.filter(record => {
    const key = index.canonicalById.get(record.id) ?? record.id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  });
}
