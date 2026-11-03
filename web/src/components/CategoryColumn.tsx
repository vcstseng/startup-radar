import type { Axis, Category } from '../types.js';
import { availableCategories } from '../lib/filter.js';

interface Props {
  axis: Axis; number: string; question: string; label: string; categories: Category[];
  selected: string[]; counts: Record<string, number>; distribution: Record<string, number>; baseline: Record<string, number>; total: number; active: boolean;
  onToggle: (axis: Axis, id: string) => void;
}
export function CategoryColumn({ axis, number, question, label, categories, selected, counts, distribution, baseline, total, active, onToggle }: Props) {
  // Keep the overview order while choosing, so the clicked row does not jump.
  const normal = categories.filter(c => !c.id.startsWith('__')).sort((a, b) => baseline[b.id] - baseline[a.id]);
  const system = categories.filter(c => c.id.startsWith('__'));
  const visible = availableCategories(normal, selected, counts);
  const visibleSystem = availableCategories(system, selected, counts);
  const primary = visible.filter(c => distribution[c.id] > 0 || selected.includes(c.id));
  const alternatives = visible.filter(c => !distribution[c.id] && !selected.includes(c.id));
  function row(category: Category, alternative = false) {
    const checked = selected.includes(category.id);
    const count = distribution[category.id] ?? 0;
    const percent = total > 0 ? count / total * 100 : 0;
    return <label className={`category-row${checked ? ' is-selected' : ''}${counts[category.id] === 0 && !checked ? ' is-unavailable' : ''}`} key={category.id}
      title={category.description_zh ?? category.label_zh}>
      <input type="checkbox" aria-label={category.label_zh} aria-describedby={`${axis}-${category.id}-count`} checked={checked} onChange={() => onToggle(axis, category.id)} />
      <span className="category-content"><span className="category-line"><span className="category-name">{category.label_zh}</span>
        <span className="category-count" id={`${axis}-${category.id}-count`}>{alternative ? '可擴選' : `${count.toLocaleString()} 筆`}</span></span>
        {!alternative && <span className="distribution-track" aria-hidden="true"><span style={{ width: `${percent}%` }} /></span>}
      </span>
    </label>;
  }
  return <section className={`category-column${active ? ' mobile-active' : ''}`} aria-labelledby={`${axis}-heading`}>
    <header className="column-heading">
      <span className="column-number">{number}</span>
      <h2 id={`${axis}-heading`}>{question}</h2>
      <p>{label} <span aria-hidden="true">·</span> {normal.length} 類<span className="available-count">目前範圍涵蓋 {primary.filter(c => distribution[c.id] > 0).length} 類</span></p>
    </header>
    <div className="category-list">{primary.map(c => row(c))}</div>
    {visible.length === 0 && <p className="empty-category">目前沒有可加入的選項。試著移除已選條件，或撤回上次選擇。</p>}
    {alternatives.length > 0 && <details className="system-categories expansion-categories">
      <summary>其他可加入分類（{alternatives.length}）<span>＋</span></summary>
      <p>同欄多選符合任一項即可，加入以下分類可擴大目前範圍。</p>
      <div>{alternatives.map(c => row(c, true))}</div>
    </details>}
    {visibleSystem.length > 0 && <details className="system-categories" open={selected.some(id => id.startsWith('__')) || undefined}>
      <summary>資訊不足與待歸類 <span>＋</span></summary>
      <div>{visibleSystem.map(c => row(c))}</div>
    </details>}
  </section>;
}
