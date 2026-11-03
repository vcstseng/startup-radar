import { AXES, type CatalogRecord, type Selection, type Supplements, type Taxonomy } from '../types.js';
import { LABELS } from './SelectionSummary.js';
import { paginate } from '../lib/route.js';
import { selectionGroups } from '../lib/selectionGroups.js';

const SOURCES: Record<string, string> = { techstars: 'Techstars', yc: 'Y Combinator', antler: 'Antler', '500': '500 Global', ef: 'Entrepreneur First', alchemist: 'Alchemist', plugandplay: 'Plug and Play' };
interface Props { records: CatalogRecord[]; supplements: Supplements | null; selected: Selection; taxonomy: Taxonomy; page: number; onPage: (page: number) => void }
export function ResultsList({ records, supplements, selected, taxonomy, page, onPage }: Props) {
  const window = paginate(records, page);
  return <section className="results" aria-label="探索結果列表">
    <div className="results-heading"><h2>符合的紀錄</h2><p>依資料原有順序，非排名</p></div>
    {records.length > 0 ? <>
      <p className="result-range" role="status">顯示第 {window.first}–{window.last} 筆，共 {records.length.toLocaleString()} 筆</p>
      <div className="record-list">{window.records.map(record => {
        const manual = supplements?.records_by_id[record.id];
        const matched = selectionGroups(selected, taxonomy, record);
        return <article className="record-row" key={record.id}>
          <h3>{record.name}</h3>
          <p className="record-summary">{manual?.summary_zh ?? record.summary_zh ?? '現有資料未提供足夠介紹。'}</p>
          {manual && <p className="manual-source">人工補充介紹 · <a href={manual.source_url} target="_blank" rel="noopener noreferrer">來源 ↗</a> · {manual.updated_at}</p>}
          {matched.length > 0 && <div className="record-matches" aria-label="符合目前選擇的分類">
            <span className="match-label">符合條件</span>
            <div className="matched-tags">{matched.flatMap(group => group.categories.map(category =>
              <span className="matched-tag" key={`${group.axis}-${category.id}`} title={`${LABELS[group.axis]}：${category.label_zh}`} aria-label={`${LABELS[group.axis]}：${category.label_zh}`}>{category.label_zh}</span>
            ))}</div>
          </div>}
          <dl className="record-facts">{AXES.map(axis => <div key={axis}><dt>{LABELS[axis]}</dt><dd>{record.tags[axis].length ? record.tags[axis].join('、') : '原始資訊不足'}</dd></div>)}</dl>
          <p className="record-source">名錄來源：{SOURCES[record.source] ?? record.source}</p>
        </article>;
      })}</div>
      {window.pages > 1 && <nav className="pagination" aria-label="結果分頁">
        <button className="outline-button" disabled={window.page === 1} onClick={() => onPage(window.page - 1)}>← 上一頁</button>
        <span>第 {window.page} / {window.pages} 頁</span>
        <button className="outline-button" disabled={window.page === window.pages} onClick={() => onPage(window.page + 1)}>下一頁 →</button>
      </nav>}
    </> : <p className="empty-results">沒有符合的紀錄。可以移除上方條件，或返回分類選擇。</p>}
    <p className="results-footnote">筆數為尚未去重的名錄紀錄；內容依既有資料整理，未確認公司與產品的最新狀況。</p>
  </section>;
}
