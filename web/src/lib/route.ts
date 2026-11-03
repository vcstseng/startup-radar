import type { Selection, Taxonomy } from '../types.js';
import { parseSelection, selectionQuery } from './filter.js';

export interface ExploreRoute { view: 'portal' | 'results' | 'company'; selected: Selection; page: number; id?: string }
export const PAGE_SIZE = 20;
export function parseRoute(search: string, taxonomy: Taxonomy): ExploreRoute {
  const params = new URLSearchParams(search);
  const page = Number(params.get('page') ?? '1');
  return {
    view: params.get('view') === 'company' ? 'company' : params.get('view') === 'results' ? 'results' : 'portal',
    selected: parseSelection(search, taxonomy),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    ...(params.get('view') === 'company' ? { id: params.get('id') ?? '' } : {}),
  };
}
export function routeQuery(route: ExploreRoute): string {
  const params = new URLSearchParams(selectionQuery(route.selected));
  if (route.view !== 'portal') {
    params.set('view', route.view);
    if (route.page > 1) params.set('page', String(route.page));
    if (route.view === 'company' && route.id) params.set('id', route.id);
  }
  return params.toString();
}
export function paginate<T>(records: T[], requestedPage: number) {
  const pages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, requestedPage));
  return { page, pages, records: records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    first: records.length ? (page - 1) * PAGE_SIZE + 1 : 0, last: Math.min(page * PAGE_SIZE, records.length) };
}
