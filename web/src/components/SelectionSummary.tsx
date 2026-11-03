import { useEffect, useState } from 'react';
import { AXES, type Axis, type Selection, type Taxonomy } from '../types.js';

export const LABELS: Record<Axis, string> = { industry_customer: '產業／客群', problem_workflow: '問題／工作', solution: '解法' };
interface Props {
  selected: Selection; taxonomy: Taxonomy; count: number; results: boolean; canUndo: boolean; routeKey: string;
  onRemove: (axis: Axis, id: string) => void; onClear: () => void; onUndo: () => void; onNext: () => void;
}
export function SelectionSummary({ selected, taxonomy, count, results, canUndo, routeKey, onRemove, onClear, onUndo, onNext }: Props) {
  const [copyMessage, setCopyMessage] = useState('');
  const [manualLink, setManualLink] = useState('');
  useEffect(() => { setCopyMessage(''); setManualLink(''); }, [routeKey]);
  useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(''), 2500);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);
  const chips = AXES.flatMap(axis => selected[axis].map(id => ({ axis, id,
    label: taxonomy.dimensions[axis].categories.find(category => category.id === id)?.label_zh ?? id })));
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setCopyMessage('連結已複製'); }
    catch { setManualLink(window.location.href); }
  }
  return <section className={`selection-panel${results ? ' results-selection' : ''}`} aria-label="目前選擇">
    <div className="selection-topline">
      <p className="match-count" role="status" aria-live="polite" aria-atomic="true"><span>{chips.length ? '同時符合目前條件：' : '全部紀錄：'}</span><strong>{count.toLocaleString()}</strong> 筆</p>
      <button className={results ? 'outline-button' : 'primary-button'} disabled={!results && count === 0} onClick={onNext}>{results ? '調整分類' : '查看結果 →'}</button>
    </div>
    {!results && <p className="selection-label">目前選擇</p>}
    {chips.length > 0 ? <div className="selected-chips">{chips.map(chip =>
      <button className="selected-chip" key={`${chip.axis}-${chip.id}`} aria-label={`移除${LABELS[chip.axis]}：${chip.label}`} onClick={() => onRemove(chip.axis, chip.id)}>
        <span>{LABELS[chip.axis]}</span>{chip.label}<span aria-hidden="true">×</span>
      </button>)}</div> : !results && <p className="selection-hint">尚未選擇，從下面任一欄開始。</p>}
    <div className="selection-bottom">
      {!results && <p className="selection-hint">每欄可以多選，符合其中一項即可；不同欄的條件則必須同時符合。不必選滿三欄。</p>}
      <div className="selection-actions">
        {!results && <button className="text-button" disabled={!canUndo} onClick={onUndo}>← 撤回上次選擇</button>}
        <button className="text-button" disabled={chips.length === 0} onClick={onClear}>清除條件</button>
        <button className="text-button" onClick={copyLink}>{copyMessage || '複製連結'}</button>
      </div>
    </div>
    {count === 0 && <p className="no-matches">目前組合沒有符合的紀錄。移除一個條件，或返回調整分類。</p>}
    {manualLink && <label className="manual-link">請手動複製此連結<input readOnly value={manualLink} onFocus={event => event.target.select()} /></label>}
  </section>;
}
