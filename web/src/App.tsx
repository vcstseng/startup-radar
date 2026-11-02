import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AXES, type Axis, type Selection } from './types.js';
import { loadPortal, type PortalData } from './lib/catalog.js';
import { categoryCounts, emptySelection, matchingIds, parseSelection, selectionQuery, toggleSelection } from './lib/filter.js';
import { CategoryColumn } from './components/CategoryColumn.js';

const QUESTIONS: Record<Axis, string> = { industry_customer: '服務誰？', problem_workflow: '解決什麼工作？', solution: '採用什麼做法？' };
const LABELS: Record<Axis, string> = { industry_customer: '產業／客群', problem_workflow: '問題／工作', solution: '解法' };
type Entry = { radar?: boolean; canUndo?: boolean; scroll?: number; axis?: Axis };

export default function App() {
  const [data, setData] = useState<PortalData>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<Selection>(emptySelection);
  const [mobileAxis, setMobileAxis] = useState<Axis>('industry_customer');
  const [canUndo, setCanUndo] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [manualLink, setManualLink] = useState('');
  const pendingScroll = useRef<number | null>(null);

  useEffect(() => {
    const controller = new AbortController(); setError('');
    loadPortal(controller.signal).then(value => {
      setData(value);
      const initial = parseSelection(window.location.search, value.taxonomy);
      setSelected(initial);
      const entry: Entry = window.history.state ?? {};
      setMobileAxis(entry.axis ?? AXES.find(axis => initial[axis].length > 0) ?? 'industry_customer');
      setCanUndo(!!entry.radar && !!entry.canUndo);
      window.history.replaceState({ ...entry, radar: true }, '', window.location.href);
      pendingScroll.current = entry.scroll ?? 0;
    }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '載入失敗'); });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    if (!data) return;
    const oldRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const onScroll = () => {
      if (pendingScroll.current !== null) return;
      window.history.replaceState({ ...window.history.state, scroll: window.scrollY }, '', window.location.href);
    };
    const onPop = () => {
      const entry: Entry = window.history.state ?? {};
      pendingScroll.current = entry.scroll ?? 0;
      setSelected(parseSelection(window.location.search, data.taxonomy));
      setMobileAxis(entry.axis ?? 'industry_customer'); setCanUndo(!!entry.radar && !!entry.canUndo);
      setCopyMessage(''); setManualLink('');
    };
    window.addEventListener('popstate', onPop); window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('popstate', onPop); window.removeEventListener('scroll', onScroll); window.history.scrollRestoration = oldRestoration; };
  }, [data]);
  useLayoutEffect(() => {
    if (!data || pendingScroll.current === null) return;
    const y = pendingScroll.current;
    const frame = window.requestAnimationFrame(() => { window.scrollTo(0, y); pendingScroll.current = null; });
    return () => window.cancelAnimationFrame(frame);
  }, [data, selected]);
  useEffect(() => {
    if (!copyMessage) return;
    const timer = window.setTimeout(() => setCopyMessage(''), 2500);
    return () => window.clearTimeout(timer);
  }, [copyMessage]);

  const matches = useMemo(() => data ? matchingIds(selected, data.facets, data.allIds) : new Set<string>(), [data, selected]);
  const counts = useMemo(() => data ? categoryCounts(selected, data.facets, data.allIds) : undefined, [data, selected]);
  const chips = AXES.flatMap(axis => selected[axis].map(id => ({ axis, id,
    label: data?.taxonomy.dimensions[axis].categories.find(c => c.id === id)?.label_zh ?? id })));
  function saveEntry() {
    window.history.replaceState({ ...window.history.state, radar: true, scroll: window.scrollY, axis: mobileAxis }, '', window.location.href);
  }
  function update(next: Selection) {
    const search = selectionQuery(next);
    const url = window.location.pathname + (search ? `?${search}` : '');
    if (url === window.location.pathname + window.location.search) return;
    saveEntry();
    window.history.pushState({ radar: true, canUndo: true, scroll: window.scrollY, axis: mobileAxis }, '', url);
    setSelected(next); setCanUndo(true); setCopyMessage(''); setManualLink('');
  }
  function setAxis(axis: Axis) {
    setMobileAxis(axis);
    window.history.replaceState({ ...window.history.state, axis }, '', window.location.href);
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.href); setCopyMessage('連結已複製'); }
    catch { setManualLink(window.location.href); }
  }
  return <div className="app-shell">
    <a className="skip-link" href="#portal">跳到分類入口</a>
    <header className="masthead">
      <a href={import.meta.env.BASE_URL} className="wordmark" onClick={e => { e.preventDefault(); window.scrollTo(0, 0); }}>Startup Radar<span className="brand-dot" /></a>
      <span className="masthead-note">探索 AI 新創的不同做法</span>
    </header>
    <main>
      <nav className="journey" aria-label="探索進度"><span aria-current="step">01 分類入口</span><span aria-hidden="true">／</span><span>02 探索結果</span></nav>
      <section className="intro" aria-labelledby="page-title">
        <h1 id="page-title">AI 新創正在解決哪些問題？</h1>
        <p className="intro-text">這裡整理了 {data?.summary.record_count.toLocaleString() ?? '4,085'} 筆 AI 相關新創紀錄。選擇你關心的客群、工作或解法，探索相關公司的做法。</p>
        <p className="intro-example">例如，想看醫療領域的語音應用，可以選「醫療、照護與獸醫」＋「語音、對話與通訊」。</p>
      </section>
      {error ? <section className="load-state" role="alert"><h2>暫時無法載入</h2><p>{error}</p><button onClick={() => setAttempt(x => x + 1)}>重新載入</button></section>
      : !data || !counts ? <p className="load-state" role="status">正在載入分類資料…</p>
      : <>
        <section className="selection-panel" aria-label="目前選擇">
          <div className="selection-topline">
            <p className="match-count" role="status" aria-live="polite" aria-atomic="true"><span>{chips.length ? '同時符合目前條件：' : '全部紀錄：'}</span><strong>{matches.size.toLocaleString()}</strong> 筆</p>
            <div className="next-step"><button className="primary-button" disabled aria-describedby="results-status">查看結果 →</button><span id="results-status">結果頁尚未開放</span></div>
          </div>
          <p className="selection-label">目前選擇</p>
          {chips.length > 0 ? <div className="selected-chips">{chips.map(chip =>
            <button className="selected-chip" key={`${chip.axis}-${chip.id}`} aria-label={`移除${LABELS[chip.axis]}：${chip.label}`} onClick={() => update(toggleSelection(selected, chip.axis, chip.id))}>
              <span>{LABELS[chip.axis]}</span>{chip.label}<span aria-hidden="true">×</span>
            </button>)}</div> : <p className="selection-hint">尚未選擇，從下面任一欄開始。</p>}
          <div className="selection-bottom">
            <p className="selection-hint">每欄可以多選，符合其中一項即可；不同欄的條件則必須同時符合。不必選滿三欄。</p>
            <div className="selection-actions">
              <button className="text-button" disabled={!canUndo} onClick={() => { saveEntry(); window.history.back(); }}>← 撤回上次選擇</button>
              <button className="text-button" disabled={chips.length === 0} onClick={() => update(emptySelection())}>清除條件</button>
              <button className="text-button" onClick={copyLink}>{copyMessage || '複製連結'}</button>
            </div>
          </div>
          {matches.size === 0 && <p className="no-matches">目前組合沒有符合的紀錄。移除一個條件，或在同欄加入其他分類。</p>}
          {manualLink && <label className="manual-link">請手動複製此連結<input readOnly value={manualLink} onFocus={e => e.target.select()} /></label>}
        </section>
        <p className="dataset-note portal-note">{AXES.map(axis => `${data.taxonomy.dimensions[axis].categories.filter(c => !c.id.startsWith('__')).length} 個${LABELS[axis]}`).join('、')}。<span>只顯示可加入的分類；已選條件可隨時取消。</span></p>
        <nav className="mobile-tabs" aria-label="選擇分類維度">{AXES.map(axis =>
          <button key={axis} aria-pressed={mobileAxis === axis} onClick={() => setAxis(axis)}>{LABELS[axis]}{selected[axis].length > 0 && <span>{selected[axis].length}</span>}</button>)}</nav>
        <div id="portal" className="portal-grid">{AXES.map((axis, i) => <CategoryColumn key={axis} axis={axis} number={`0${i + 1}`} question={QUESTIONS[axis]} label={LABELS[axis]}
          categories={data.taxonomy.dimensions[axis].categories} selected={selected[axis]} counts={counts[axis]} active={mobileAxis === axis}
          onToggle={(a, id) => update(toggleSelection(selected, a, id))} />)}</div>
      </>}
    </main>
    <footer><p>分類可重疊，筆數為尚未去重的名錄紀錄。</p><p>Startup Radar <span>／</span> Explore, connect, discover.</p></footer>
  </div>;
}
