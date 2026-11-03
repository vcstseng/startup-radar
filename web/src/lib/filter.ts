import { AXES, type Axis, type Category, type Facets, type Selection, type Taxonomy } from '../types.js';
import { uniqueDisplayCount, type DuplicateIndex } from './duplicates.js';

export function availableCategories(categories: Category[], selected: string[], counts: Record<string, number>): Category[] {
  return categories.filter(category => selected.includes(category.id) || (counts[category.id] ?? 0) > 0);
}

export const emptySelection = (): Selection => ({ industry_customer: [], problem_workflow: [], solution: [] });
const QUERY_KEYS: Record<Axis, string> = { industry_customer: 'industry', problem_workflow: 'work', solution: 'solution' };

export function parseSelection(search: string, taxonomy: Taxonomy): Selection {
  const params = new URLSearchParams(search);
  const selected = emptySelection();
  for (const axis of AXES) {
    const allowed = new Set(taxonomy.dimensions[axis].categories.map(c => c.id));
    selected[axis] = [...new Set(params.getAll(QUERY_KEYS[axis]).filter(id => allowed.has(id)))];
  }
  return selected;
}
export function selectionQuery(selected: Selection): string {
  const params = new URLSearchParams();
  for (const axis of AXES) for (const id of [...selected[axis]].sort()) params.append(QUERY_KEYS[axis], id);
  return params.toString();
}
export function toggleSelection(selected: Selection, axis: Axis, id: string): Selection {
  return { ...selected, [axis]: selected[axis].includes(id) ? selected[axis].filter(x => x !== id) : [...selected[axis], id] };
}
export function matchingIds(selected: Selection, facets: Facets, allIds: Set<string>, omit?: Axis): Set<string> {
  let result = new Set(allIds);
  for (const axis of AXES) {
    if (axis === omit || !selected[axis].length) continue;
    const union = new Set(selected[axis].flatMap(id => facets.dimensions[axis][id]?.record_ids ?? []));
    result = new Set([...result].filter(id => union.has(id)));
  }
  return result;
}
export function categoryCounts(selected: Selection, facets: Facets, allIds: Set<string>, duplicates?: DuplicateIndex): Record<Axis, Record<string, number>> {
  const counts = {} as Record<Axis, Record<string, number>>;
  for (const axis of AXES) {
    // Ignore this column's selection so users can add OR alternatives in it.
    const context = matchingIds(selected, facets, allIds, axis);
    counts[axis] = Object.fromEntries(Object.entries(facets.dimensions[axis]).map(([id, bucket]) =>
      [id, uniqueDisplayCount(bucket.record_ids.filter(record => context.has(record)), duplicates)]));
  }
  return counts;
}

// Distribution uses the complete intersection, unlike candidate counts above.
export function distributionCounts(matches: Set<string>, facets: Facets, duplicates?: DuplicateIndex): Record<Axis, Record<string, number>> {
  return Object.fromEntries(AXES.map(axis => [axis, Object.fromEntries(
    Object.entries(facets.dimensions[axis]).map(([id, bucket]) =>
      [id, uniqueDisplayCount(bucket.record_ids.filter(id => matches.has(id)), duplicates)])
  )])) as Record<Axis, Record<string, number>>;
}
