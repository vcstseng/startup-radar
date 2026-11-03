import { useEffect, useMemo, useState } from 'react';
import { AXES, type Selection } from './types.js';
import { loadPortal, loadResults, type PortalData, type ResultsData } from './lib/catalog.js';
import { categoryCounts, emptySelection, matchingIds, toggleSelection } from './lib/filter.js';
import { paginate, routeQuery } from './lib/route.js';
import { useExploreRoute, useRestorePosition } from './lib/useExploreRoute.js';
import { CategoryColumn } from './components/CategoryColumn.js';
import { SelectionSummary, LABELS } from './components/SelectionSummary.js';
import { ResultsList } from './components/ResultsList.js';

const QUESTIONS = { industry_customer: '服務誰？', problem_workflow: '解決什麼工作？', solution: '採用什麼做法？' };
export default function App() {
  const [data, setData] = useState<PortalData>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [results, setResults] = useState<ResultsData>();
  const [resultsError, setResultsError] = useState('');
  const [resultsAttempt, setResultsAttempt] = useState(0);
  const nav = useExploreRoute(data?.taxonomy);
  const { route, axis, initialized } = nav;
  const isResults = route.view === 'results';
  const routeKey = routeQuery(route);

  useEffect(() => {
    const controller = new AbortController(); setError('');
    loadPortal(controller.signal).then(setData).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '載入失敗');
    });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => {
    if (!data || !isResults || results) return;
    const controller = new AbortController(); setResultsError('');
    loadResults(data, controller.signal).then(setResults).catch(reason => {
      if (!controller.signal.aborted) setResultsError(reason instanceof Error ? reason.message : '載入失敗');
    });
    return () => controller.abort();
  }, [data, isResults, results, resultsAttempt]);
  const matches = useMemo(() => data ? matchingIds(route.selected, data.facets, data.allIds) : new Set<string>(), [data, route.selected]);
  const counts = useMemo(() => data ? categoryCounts(route.selected, data.facets, data.allIds) : undefined, [data, route.selected]);
  const filtered = useMemo(() => results?.records.filter(record => matches.has(record.id)) ?? [], [results, matches]);
  const page = paginate(filtered, route.page);
  useEffect(() => {
    if (isResults && results && page.page !== route.page) nav.replacePage(page.page);
  }, [isResults, results, page.page, route.page]);
  useRestorePosition(!!data && initialized && (!isResults || !!results || !!resultsError), routeKey, nav.pending, nav.titleFocus);
  useEffect(() => {
    document.title = `${isResults ? '探索結果' : '分類入口'} — Startup Radar`;
  }, [isResults]);
  function update(selected: Selection) {
    nav.navigate({ ...route, selected, page: 1 }, isResults ? 0 : window.scrollY);
  }
  return <div className="app-shell">
    <a className="skip-link" href={isResults ? '#results-content' : '#portal'}>跳到{isResults ? '探索結果' : '分類入口'}</a>
    <header className="masthead">
      <a href={import.meta.env.BASE_URL} className="wordmark" onClick={event => { event.preventDefault(); isResults ? nav.returnToPortal() : window.scrollTo(0, 0); }}>Startup Radar<span className="brand-dot" /></a>
      <span className="masthead-note">探索 AI 新創的不同做法</span>
    </header>
    <main>
      <nav className="journey" aria-label="探索進度">
        {isResults ? <button onClick={nav.returnToPortal}>← 返回分類選擇</button> : <span aria-current="step">01 分類入口</span>}
        <span aria-hidden="true">／</span><span aria-current={isResults ? 'step' : undefined}>02 探索結果</span>
      </nav>
      <section className={`intro${isResults ? ' results-intro' : ''}`} aria-labelledby="page-title">
        <h1 id="page-title" tabIndex={-1}>{isResults ? '看看有哪些做法。' : 'AI 新創正在解決哪些問題？'}</h1>
        <p className="intro-text">{isResults ? '依你選擇的分類，閱讀相關新創的產品與解法。' : `這裡整理了 ${data?.summary.record_count.toLocaleString() ?? '4,085'} 筆 AI 相關新創紀錄。選擇你關心的客群、工作或解法，探索相關公司的做法。`}</p>
        {!isResults && <p className="intro-example">例如，想看醫療領域的語音應用，可以選「醫療、照護與獸醫」＋「語音、對話與通訊」。</p>}
      </section>
      {error ? <section className="load-state" role="alert"><h2>暫時無法載入</h2><p>{error}</p><button onClick={() => setAttempt(x => x + 1)}>重新載入</button></section>
        : !data || !counts || !initialized ? <p className="load-state" role="status">正在載入分類資料…</p>
        : <>
          <SelectionSummary selected={route.selected} taxonomy={data.taxonomy} count={matches.size} results={isResults} canUndo={nav.canUndo} routeKey={routeKey}
            onRemove={(a, id) => update(toggleSelection(route.selected, a, id))} onClear={() => update(emptySelection())} onUndo={nav.undo}
            onNext={() => isResults ? nav.returnToPortal() : nav.navigate({ ...route, view: 'results', page: 1 })} />
          {isResults ? <div id="results-content">
            {resultsError ? <section className="load-state" role="alert"><h2>暫時無法載入結果</h2><p>{resultsError}</p><button onClick={() => setResultsAttempt(x => x + 1)}>重新載入結果</button></section>
              : !results ? <p className="load-state" role="status">正在載入符合的紀錄…</p>
              : <>
                {results.supplementWarning && <p className="supplement-warning" role="status">補充介紹暫時無法載入，以下仍顯示原有資料。<button className="text-button" onClick={() => { setResults(undefined); setResultsAttempt(x => x + 1); }}>重試</button></p>}
                <ResultsList records={filtered} supplements={results.supplements} selected={route.selected} taxonomy={data.taxonomy} page={page.page} onPage={next => nav.navigate({ ...route, page: next })} />
              </>}
          </div> : <>
            <p className="dataset-note portal-note">{AXES.map(a => `${data.taxonomy.dimensions[a].categories.filter(c => !c.id.startsWith('__')).length} 個${LABELS[a]}`).join('、')}。<span>只顯示可加入的分類；已選條件可隨時取消。</span></p>
            <nav className="mobile-tabs" aria-label="選擇分類維度">{AXES.map(a => <button key={a} aria-pressed={axis === a} onClick={() => nav.setAxis(a)}>{LABELS[a]}{route.selected[a].length > 0 && <span>{route.selected[a].length}</span>}</button>)}</nav>
            <div id="portal" className="portal-grid">{AXES.map((a, i) => <CategoryColumn key={a} axis={a} number={`0${i + 1}`} question={QUESTIONS[a]} label={LABELS[a]}
              categories={data.taxonomy.dimensions[a].categories} selected={route.selected[a]} counts={counts[a]} active={axis === a}
              onToggle={(a, id) => update(toggleSelection(route.selected, a, id))} />)}</div>
          </>}
        </>}
    </main>
    <footer><p>分類可重疊，筆數為尚未去重的名錄紀錄。</p><p>Startup Radar <span>／</span> Explore, connect, discover.</p></footer>
  </div>;
}
