import { useLanguage } from '../lib/language.js';
import { AXES, type CatalogRecord, type Selection, type Taxonomy } from '../types.js';
import { LABELS } from './SelectionSummary.js';
import { selectionGroups } from '../lib/selectionGroups.js';

export const SOURCES: Record<string, string> = { techstars: 'Techstars', yc: 'Y Combinator', antler: 'Antler', '500': '500 Global', ef: 'Entrepreneur First', alchemist: 'Alchemist', plugandplay: 'Plug and Play' };
export function RecordMatches({ record, selected, taxonomy }: { record: CatalogRecord; selected: Selection; taxonomy: Taxonomy }) {
  const { lang, t } = useLanguage();
  const matched = selectionGroups(selected, taxonomy, record);
  if (!matched.length) return null;
  return <div className="record-matches" aria-label={t("符合目前選擇的分類")}>
    <span className="match-label">{t("符合條件")}</span>
    <div className="matched-tags">{matched.flatMap(group => group.categories.map(category =>
      <span className="matched-tag" key={`${group.axis}-${category.id}`} title={`${t(LABELS[group.axis])}: ${t(category.label_zh)}`} aria-label={`${t(LABELS[group.axis])}: ${t(category.label_zh)}`}>{t(category.label_zh)}</span>
    ))}</div>
  </div>;
}
export function RecordFacts({ record, taxonomy }: { record: CatalogRecord; taxonomy: Taxonomy }) {
  const { lang, t } = useLanguage();
  return <>
    <dl className="record-facts">{AXES.map(axis => <div key={axis}><dt>{t(LABELS[axis])}</dt><dd>{lang === 'en' ? record.categories[axis].map(id => t(taxonomy.dimensions[axis].categories.find(c => c.id === id)?.label_zh ?? id)).join(', ') : record.tags[axis].length ? record.tags[axis].join('、') : t('原始資訊不足')}</dd></div>)}</dl>
    {lang === 'en' && <details className="original-annotations"><summary>Original Chinese tags</summary><dl className="record-facts" lang="zh-Hant">{AXES.map(axis => <div key={axis}><dt>{t(LABELS[axis])}</dt><dd>{record.tags[axis].join('、') || '—'}</dd></div>)}</dl></details>}
  </>;
}
