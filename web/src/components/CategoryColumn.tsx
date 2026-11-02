import type { Axis, Category } from '../types.js';
import { availableCategories } from '../lib/filter.js';

interface Props {
  axis: Axis; number: string; question: string; label: string; categories: Category[];
  selected: string[]; counts: Record<string, number>; active: boolean;
  onToggle: (axis: Axis, id: string) => void;
}
export function CategoryColumn({ axis, number, question, label, categories, selected, counts, active, onToggle }: Props) {
  const normal = categories.filter(c => !c.id.startsWith('__'));
  const system = categories.filter(c => c.id.startsWith('__'));
  const visible = availableCategories(normal, selected, counts);
  const visibleSystem = availableCategories(system, selected, counts);
  function row(category: Category) {
    const checked = selected.includes(category.id);
    return <label className={`category-row${checked ? ' is-selected' : ''}${counts[category.id] === 0 && !checked ? ' is-unavailable' : ''}`} key={category.id}
      title={category.description_zh ?? category.label_zh}>
      <input type="checkbox" checked={checked} onChange={() => onToggle(axis, category.id)} />
      <span className="category-name">{category.label_zh}</span>
    </label>;
  }
  return <section className={`category-column${active ? ' mobile-active' : ''}`} aria-labelledby={`${axis}-heading`}>
    <header className="column-heading">
      <span className="column-number">{number}</span>
      <h2 id={`${axis}-heading`}>{question}</h2>
      <p>{label} <span aria-hidden="true">·</span> {normal.length} 類<span className="available-count">目前顯示 {visible.length} 類</span></p>
    </header>
    <div className="category-list">{visible.map(row)}</div>
    {visible.length === 0 && <p className="empty-category">目前沒有可加入的選項。試著移除已選條件，或撤回上次選擇。</p>}
    {visibleSystem.length > 0 && <details className="system-categories" open={selected.some(id => id.startsWith('__')) || undefined}>
      <summary>資訊不足與待歸類 <span>＋</span></summary>
      <div>{visibleSystem.map(row)}</div>
    </details>}
  </section>;
}
