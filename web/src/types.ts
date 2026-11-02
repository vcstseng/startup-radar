export const AXES = ['industry_customer', 'problem_workflow', 'solution'] as const;
export type Axis = typeof AXES[number];
export type Selection = Record<Axis, string[]>;
export interface Category { id: string; label_zh: string; kind: string; description_zh?: string }
export interface Taxonomy { dimensions: Record<Axis, { label_zh: string; description_zh: string; categories: Category[] }> }
export interface Bucket { record_count: number; record_ids: string[]; example_ids: string[] }
export interface Facets { dimensions: Record<Axis, Record<string, Bucket>> }
export interface CatalogSummary { record_count: number; dataset_id: string; build_id: string }
export interface CatalogRecord {
  id: string; name: string; summary_zh: string | null; source: string;
  website: string | null; website_status: string;
  tags: Record<Axis, string[]>; categories: Record<Axis, string[]>; detail_file: string;
}
