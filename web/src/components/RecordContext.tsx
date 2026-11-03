import { AXES, type CatalogRecord, type Selection, type Taxonomy } from '../types.js';
import { LABELS } from './SelectionSummary.js';
import { selectionGroups } from '../lib/selectionGroups.js';

export const SOURCES: Record<string, string> = { techstars: 'Techstars', yc: 'Y Combinator', antler: 'Antler', '500': '500 Global', ef: 'Entrepreneur First', alchemist: 'Alchemist', plugandplay: 'Plug and Play' };
export function RecordMatches({ record, selected, taxonomy }: { record: CatalogRecord; selected: Selection; taxonomy: Taxonomy }) {
  const matched = selectionGroups(selected, taxonomy, record);
  if (!matched.length) return null;
  return <div className="record-matches" aria-label="符合目前選擇的分類">
    <span className="match-label">符合條件</span>
    <div className="matched-tags">{matched.flatMap(group => group.categories.map(category =>
      <span className="matched-tag" key={`${group.axis}-${category.id}`} title={`${LABELS[group.axis]}：${category.label_zh}`} aria-label={`${LABELS[group.axis]}：${category.label_zh}`}>{category.label_zh}</span>
    ))}</div>
  </div>;
}
export function RecordFacts({ record }: { record: CatalogRecord }) {
  return <dl className="record-facts">{AXES.map(axis => <div key={axis}><dt>{LABELS[axis]}</dt><dd>{record.tags[axis].length ? record.tags[axis].join('、') : '原始資訊不足'}</dd></div>)}</dl>;
}
