import { type CatalogRecord, type Selection, type Supplements, type Taxonomy } from '../types.js';
import { paginate } from '../lib/route.js';
import { RecordMatches, RecordFacts, SOURCES } from './RecordContext.js';
import type { MouseEvent } from 'react';

interface Props { records: CatalogRecord[]; supplements: Supplements | null; selected: Selection; taxonomy: Taxonomy; page: number; onPage: (page: number) => void; companyHref: (id: string) => string; onCompany: (id: string) => void; memberCount: (id: string) => number }
export function ResultsList({ records, supplements, selected, taxonomy, page, onPage, companyHref, onCompany, memberCount }: Props) {
  const window = paginate(records, page);
  function openCompany(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault(); onCompany(id);
  }
  return <section className="results" aria-label="探索結果列表">
    <div className="results-heading"><h2>符合的紀錄</h2><p>依資料原有順序，非排名</p></div>
    {records.length > 0 ? <>
      <p className="result-range" role="status">顯示第 {window.first}–{window.last} 筆，共 {records.length.toLocaleString()} 筆</p>
      <div className="record-list">{window.records.map(record => {
        const manual = supplements?.records_by_id[record.id];
        return <article className="record-row" key={record.id}>
          <div className="record-title-row"><h3><a href={companyHref(record.id)} onClick={event => openCompany(event, record.id)}>{record.name}</a></h3>
            <a className="detail-link" href={companyHref(record.id)} aria-label={`查看 ${record.name} 詳情`} onClick={event => openCompany(event, record.id)}>查看詳情 →</a></div>
          <p className="record-summary">{manual?.summary_zh ?? record.summary_zh ?? '現有資料未提供足夠介紹。'}</p>
          {manual && <p className="manual-source">人工補充介紹 · <a href={manual.source_url} target="_blank" rel="noopener noreferrer">來源 ↗</a> · {manual.updated_at}</p>}
          <RecordMatches record={record} selected={selected} taxonomy={taxonomy} />
          <RecordFacts record={record} />
          <p className="record-source">名錄來源：{SOURCES[record.source] ?? record.source}{memberCount(record.id) > 1 && <span className="duplicate-badge">已合併 {memberCount(record.id)} 筆相同名錄</span>}</p>
        </article>;
      })}</div>
      {window.pages > 1 && <nav className="pagination" aria-label="結果分頁">
        <button className="outline-button" disabled={window.page === 1} onClick={() => onPage(window.page - 1)}>← 上一頁</button>
        <span>第 {window.page} / {window.pages} 頁</span>
        <button className="outline-button" disabled={window.page === window.pages} onClick={() => onPage(window.page + 1)}>下一頁 →</button>
      </nav>}
    </> : <p className="empty-results">沒有符合的紀錄。可以移除上方條件，或返回分類選擇。</p>}
    <p className="results-footnote">名稱、網址與原文完全相同的紀錄已合併展示，其他可能重複的紀錄仍保留。內容依既有資料整理，未確認公司與產品的最新狀況。</p>
  </section>;
}
