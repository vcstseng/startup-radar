import { useState } from 'react';
import type { CatalogRecord, CompanyDetail, ManualSummary, Selection, Taxonomy } from '../types.js';
import { safeWebsite } from '../lib/company.js';
import { RecordMatches, RecordFacts, SOURCES } from './RecordContext.js';

interface Props {
  record: CatalogRecord; detail?: CompanyDetail; error?: string; manual?: ManualSummary;
  selected: Selection; taxonomy: Taxonomy; onRetry: () => void; onReturn: () => void;
}
export function CompanyPage({ record, detail, error, manual, selected, taxonomy, onRetry, onReturn }: Props) {
  const [copied, setCopied] = useState(false);
  const [manualLink, setManualLink] = useState('');
  const website = safeWebsite(record.website);
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); }
    catch { setManualLink(window.location.href); }
  }
  return <article className="company-page" aria-label={`${record.name} 公司資料`}>
    <div className="company-topline"><p className="record-source">名錄來源：{SOURCES[record.source] ?? record.source}</p><button className="outline-button" onClick={copyLink}>{copied ? '連結已複製' : '複製公司連結'}</button></div>
    {manualLink && <label className="manual-link">請手動複製此連結<input readOnly value={manualLink} onFocus={event => event.target.select()} /></label>}
    <p className="company-summary">{record.summary_zh ?? '現有資料未提供足夠介紹。'}</p>
    <RecordMatches record={record} selected={selected} taxonomy={taxonomy} />
    <section className="company-section"><h2>客群、工作與解法</h2><RecordFacts record={record} /></section>
    {error ? <section className="company-section" role="alert"><h2>來源原文暫時無法載入</h2><p>{error}</p><button className="outline-button" onClick={onRetry}>重新載入原文</button></section>
      : !detail ? <p className="company-section" role="status">正在載入來源原文…</p> : <>
        <section className="company-section"><h2>來源原文</h2><p className="source-caption">以下為 {SOURCES[detail.source] ?? detail.source} 名錄提供的介紹。</p><blockquote className="company-evidence">{detail.evidence.text || '原始資料未提供介紹。'}</blockquote></section>
        {detail.notes.length > 0 && <section className="company-section"><h2>資料註記</h2><ul className="company-notes">{detail.notes.map((note, index) => <li key={index}>{note}</li>)}</ul></section>}
      </>}
    {website && <section className="company-section"><h2>外部網站</h2><a className="outline-button website-link" href={website} target="_blank" rel="noopener noreferrer">前往原資料所列網站 ↗</a><p className="source-caption">網址來自原始名錄，尚未查證目前狀況。</p></section>}
    {manual && <section className="company-section manual-section"><h2>人工補充</h2><p>{manual.summary_zh}</p><p className="source-caption"><a href={manual.source_url} target="_blank" rel="noopener noreferrer">補充來源 ↗</a> · 補充日期：{manual.updated_at}</p></section>}
    <p className="results-footnote">內容依既有名錄整理，產品宣稱與最新狀況尚未查證。分類與原文保留來源限制，不代表已驗證成效或市場需求。</p>
    <button className="outline-button company-return" onClick={onReturn}>← 返回探索結果</button>
  </article>;
}
