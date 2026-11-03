import { useEffect, useMemo, useState } from 'react';
import { AXES, type CompanyDetail, type Selection } from './types.js';
import { loadCompanyDetail, loadPortal, loadResults, type PortalData, type ResultsData } from './lib/catalog.js';
import { categoryCounts, distributionCounts, emptySelection, matchingIds, toggleSelection } from './lib/filter.js';
import { paginate, routeQuery } from './lib/route.js';
import { useExploreRoute, useRestorePosition } from './lib/useExploreRoute.js';
import { CategoryColumn } from './components/CategoryColumn.js';
import { SelectionSummary, LABELS } from './components/SelectionSummary.js';
import { ResultsList } from './components/ResultsList.js';
import { CompanyPage } from './components/CompanyPage.js';
import { collapseRecords, duplicateIds, uniqueDisplayCount } from './lib/duplicates.js';

const QUESTIONS = { industry_customer: '服務誰？', problem_workflow: '解決什麼工作？', solution: '採用什麼做法？' };
export default function App() {
  const [data, setData] = useState<PortalData>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [results, setResults] = useState<ResultsData>();
  const [resultsError, setResultsError] = useState('');
  const [resultsAttempt, setResultsAttempt] = useState(0);
  const [companyLoad, setCompanyLoad] = useState<{ id: string; value?: CompanyDetail; error?: string }>();
  const [companyAttempt, setCompanyAttempt] = useState(0);
  const nav = useExploreRoute(data?.taxonomy);
  const { route, axis, initialized } = nav;
  const isResults = route.view === 'results';
  const isCompany = route.view === 'company';
  const needsRecords = route.view !== 'portal';
  const routeKey = routeQuery(route);

  useEffect(() => {
    const controller = new AbortController(); setError('');
    loadPortal(controller.signal).then(setData).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '載入失敗');
    });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    if (!data || !needsRecords || results) return;
    const controller = new AbortController(); setResultsError('');
    loadResults(data, controller.signal).then(setResults).catch(reason => {
      if (!controller.signal.aborted) setResultsError(reason instanceof Error ? reason.message : '載入失敗');
    });
    return () => controller.abort();
  }, [data, needsRecords, results, resultsAttempt]);
  const companyRecord = isCompany ? results?.records.find(record => record.id === route.id) : undefined;
  const companyVariants = useMemo(() => {
    if (!companyRecord || !data || !results) return [];
    const memberIds = new Set(duplicateIds(companyRecord.id, data.duplicates));
    return results.records.filter(record => memberIds.has(record.id));
  }, [companyRecord, data, results]);
  const companyState = companyLoad?.id === companyRecord?.id ? companyLoad : undefined;
  useEffect(() => {
    if (!data || !companyRecord) return;
    const controller = new AbortController();
    setCompanyLoad({ id: companyRecord.id });
    loadCompanyDetail(data, companyRecord, controller.signal).then(value => setCompanyLoad({ id: companyRecord.id, value })).catch(reason => {
      if (!controller.signal.aborted) setCompanyLoad({ id: companyRecord.id, error: reason instanceof Error ? reason.message : '載入失敗' });
    });
    return () => controller.abort();
  }, [data, companyRecord, companyAttempt]);
  const matches = useMemo(() => data ? matchingIds(route.selected, data.facets, data.allIds) : new Set<string>(), [data, route.selected]);
  const matchCount = useMemo(() => uniqueDisplayCount(matches, data?.duplicates), [matches, data]);
  const counts = useMemo(() => data ? categoryCounts(route.selected, data.facets, data.allIds, data.duplicates) : undefined, [data, route.selected]);
  const distribution = useMemo(() => data ? distributionCounts(matches, data.facets, data.duplicates) : undefined, [data, matches]);
  const baseline = useMemo(() => data ? distributionCounts(data.allIds, data.facets, data.duplicates) : undefined, [data]);
  const hasSelection = AXES.some(a => route.selected[a].length > 0);
  const filtered = useMemo(() => results && data ? collapseRecords(results.records.filter(record => matches.has(record.id)), data.duplicates) : [], [results, matches, data]);
  const page = paginate(filtered, route.page);
  useEffect(() => {
    if (isResults && results && page.page !== route.page) nav.replacePage(page.page);
  }, [isResults, results, page.page, route.page]);
  const companyReady = !isCompany || (!!results && (!companyRecord || !!companyState?.value || !!companyState?.error));
  useRestorePosition(!!data && initialized && (!needsRecords || !!resultsError || (!!results && companyReady)), routeKey, nav.pending, nav.titleFocus);
  useEffect(() => {
    document.title = `${isCompany ? companyRecord?.name ?? '公司資料' : isResults ? '探索結果' : '分類入口'} — Startup Radar`;
  }, [isResults, isCompany, companyRecord?.name]);
  function update(selected: Selection) {
    nav.navigate({ ...route, selected, page: 1, id: undefined }, isResults ? 0 : window.scrollY);
  }
  return <div className={`app-shell${!needsRecords ? ' portal-view' : ''}`}>
    <a className="skip-link" href={isCompany ? '#company-content' : isResults ? '#results-content' : '#portal'}>跳到{isCompany ? '公司資料' : isResults ? '探索結果' : '分類入口'}</a>
    <header className="masthead">
      <a href={import.meta.env.BASE_URL} className="wordmark" onClick={event => { event.preventDefault(); needsRecords ? nav.returnToPortal() : window.scrollTo(0, 0); }}>Startup Radar<span className="brand-dot" /></a>
      <span className="masthead-note">探索 AI 新創的不同做法</span>
    </header>
    <main>
      <nav className="journey" aria-label="探索進度">
        {needsRecords ? <button onClick={nav.returnToPortal}>{isCompany ? '分類入口' : '← 返回分類選擇'}</button> : <span aria-current="step">01 分類入口</span>}
        <span aria-hidden="true">／</span>{isCompany ? <button onClick={nav.returnToResults}>← 返回探索結果</button> : <span aria-current={isResults ? 'step' : undefined}>02 探索結果</span>}
        {isCompany && <><span aria-hidden="true">／</span><span aria-current="step">03 公司資料</span></>}
      </nav>
      <section className={`intro${isResults ? ' results-intro' : ''}${isCompany ? ' company-intro' : ''}`} aria-labelledby="page-title">
        <h1 id="page-title" tabIndex={-1}>{isCompany ? companyRecord?.name ?? '公司資料' : isResults ? '看看有哪些做法。' : 'AI 新創正在解決哪些問題？'}</h1>
        {!isCompany && <p className="intro-text">{isResults ? '依你選擇的分類，閱讀相關新創的產品與解法。' : '先看客群、工作與解法的分布，再勾選分類探索相關新創。'}</p>}
      </section>
      {error ? <section className="load-state" role="alert"><h2>暫時無法載入</h2><p>{error}</p><button onClick={() => setAttempt(x => x + 1)}>重新載入</button></section>
        : !data || !counts || !distribution || !baseline || !initialized ? <p className="load-state" role="status">正在載入分類資料…</p>
        : isCompany ? <div id="company-content">
          {resultsError ? <section className="load-state" role="alert"><h2>暫時無法載入公司資料</h2><p>{resultsError}</p><button onClick={() => setResultsAttempt(x => x + 1)}>重新載入</button></section>
            : !results ? <p className="load-state" role="status">正在載入公司資料…</p>
            : !companyRecord ? <section className="load-state" role="alert"><h2>找不到這筆公司紀錄</h2><p>連結可能不完整，或紀錄不在目前資料集中。</p><button onClick={nav.returnToResults}>← 返回探索結果</button></section>
            : <>
              {results.supplementWarning && <p className="supplement-warning" role="status">補充介紹暫時無法載入，以下仍顯示原有資料。<button className="text-button" onClick={() => { setResults(undefined); setResultsAttempt(x => x + 1); }}>重試</button></p>}
              <CompanyPage key={companyRecord.id} record={companyRecord} detail={companyState?.value} error={companyState?.error}
                manual={results.supplements?.records_by_id[companyRecord.id]} selected={route.selected} taxonomy={data.taxonomy}
                variants={companyVariants} manualSummaries={results.supplements?.records_by_id}
                variantHref={id => `?${routeQuery({ ...route, view: 'company', id })}`}
                onVariant={id => nav.navigate({ ...route, view: 'company', id })}
                onRetry={() => setCompanyAttempt(x => x + 1)} onReturn={nav.returnToResults} />
            </>}
        </div> : <>
          <SelectionSummary selected={route.selected} taxonomy={data.taxonomy} count={matchCount} results={isResults} canUndo={nav.canUndo} routeKey={routeKey}
            onRemove={(a, id) => update(toggleSelection(route.selected, a, id))} onClear={() => update(emptySelection())} onUndo={nav.undo}
            onNext={() => isResults ? nav.returnToPortal() : nav.navigate({ ...route, view: 'results', page: 1 })} />
          {isResults ? <div id="results-content">
            {resultsError ? <section className="load-state" role="alert"><h2>暫時無法載入結果</h2><p>{resultsError}</p><button onClick={() => setResultsAttempt(x => x + 1)}>重新載入結果</button></section>
              : !results ? <p className="load-state" role="status">正在載入符合的紀錄…</p>
              : <>
                {results.supplementWarning && <p className="supplement-warning" role="status">補充介紹暫時無法載入，以下仍顯示原有資料。<button className="text-button" onClick={() => { setResults(undefined); setResultsAttempt(x => x + 1); }}>重試</button></p>}
                <ResultsList records={filtered} supplements={results.supplements} selected={route.selected} taxonomy={data.taxonomy} page={page.page} onPage={next => nav.navigate({ ...route, page: next })}
                  memberCount={id => duplicateIds(id, data.duplicates).length}
                  companyHref={id => `?${routeQuery({ ...route, view: 'company', page: page.page, id })}`}
                  onCompany={id => nav.navigate({ ...route, view: 'company', page: page.page, id })} />
              </>}
          </div> : <>
            <section className="distribution-context" aria-label="分布範圍">
              <div><h2>{hasSelection ? '目前範圍的分布' : '整體分布'}</h2><p>筆數與比例條顯示目前紀錄的分布，不是勾選後的預估結果。</p></div>
              {hasSelection && <button className="text-button" onClick={() => update(emptySelection())}>回到全部</button>}
              <details className="distribution-help"><summary>資料與計數說明</summary><p>從 {data.summary.record_count.toLocaleString()} 筆來源紀錄合併明確重複後，展示 {data.duplicates.displayRecordCount.toLocaleString()} 筆。比例以目前範圍的 {matchCount.toLocaleString()} 筆為分母；分類可重疊，不相加為 100%。依全體筆數排序，選取時保持順序。名錄分布不代表市場規模或成長。</p></details>
            </section>
            <nav className="mobile-tabs" aria-label="選擇分類維度">{AXES.map(a => <button key={a} aria-pressed={axis === a} onClick={() => nav.setAxis(a)}>{LABELS[a]}{route.selected[a].length > 0 && <span>{route.selected[a].length}</span>}</button>)}</nav>
            <div id="portal" className="portal-grid">{AXES.map((a, i) => <CategoryColumn key={a} axis={a} number={`0${i + 1}`} question={QUESTIONS[a]} label={LABELS[a]}
              categories={data.taxonomy.dimensions[a].categories} selected={route.selected[a]} counts={counts[a]} distribution={distribution[a]} baseline={baseline[a]} total={matchCount} active={axis === a}
              onToggle={(a, id) => update(toggleSelection(route.selected, a, id))} />)}</div>
          </>}
        </>}
    </main>
    {!needsRecords && data && initialized && !error && <nav className="mobile-result-bar" aria-label="查看探索結果">
      <p>{hasSelection ? '符合條件' : '全部紀錄'}<strong>{matchCount.toLocaleString()} <span>筆</span></strong></p>
      <button className="primary-button" disabled={matchCount === 0} onClick={() => nav.navigate({ ...route, view: 'results', page: 1 })}>查看結果 →</button>
    </nav>}
    <footer><p>分類可重疊；展示已合併明確重複，其他相似紀錄仍保留。</p><p>Startup Radar <span>／</span> Explore, connect, discover.</p></footer>
  </div>;
}
