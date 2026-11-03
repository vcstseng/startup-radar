import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AXES, type Axis, type Taxonomy } from '../types.js';
import { emptySelection } from './filter.js';
import { parseRoute, routeQuery, type ExploreRoute } from './route.js';

interface Position { scroll: number; axis: Axis }
interface Entry extends Position {
  radar: boolean; previous?: string; previousView?: ExploreRoute['view']; portal?: Position; results?: Position;
}
const urlNow = () => window.location.pathname + window.location.search;
const emptyRoute = (): ExploreRoute => ({ view: 'portal', selected: emptySelection(), page: 1 });

export function useExploreRoute(taxonomy?: Taxonomy) {
  const [route, setRoute] = useState<ExploreRoute>(emptyRoute);
  const [axis, setAxisState] = useState<Axis>('industry_customer');
  const [canUndo, setCanUndo] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const pending = useRef<number | null>(null);
  const titleFocus = useRef(false);

  useEffect(() => {
    if (!taxonomy) return;
    const apply = () => {
      const next = parseRoute(window.location.search, taxonomy);
      const entry = window.history.state as Partial<Entry> | null;
      setRoute(next); setAxisState(entry?.axis ?? AXES.find(axis => next.selected[axis].length > 0) ?? 'industry_customer');
      setCanUndo(!!entry?.radar && entry.previousView === 'portal' && next.view === 'portal');
      pending.current = entry?.scroll ?? 0;
      setInitialized(true);
    };
    const old = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    apply();
    const scroll = () => {
      if (pending.current !== null) return;
      window.history.replaceState({ ...window.history.state, scroll: window.scrollY }, '', window.location.href);
    };
    window.addEventListener('popstate', apply); window.addEventListener('scroll', scroll, { passive: true });
    return () => { window.removeEventListener('popstate', apply); window.removeEventListener('scroll', scroll); window.history.scrollRestoration = old; };
  }, [taxonomy]);

  function save() {
    const entry = { ...window.history.state, radar: true, scroll: window.scrollY, axis } as Entry;
    window.history.replaceState(entry, '', window.location.href);
    return entry;
  }
  function navigate(next: ExploreRoute, scroll = 0) {
    const query = routeQuery(next);
    const url = window.location.pathname + (query ? `?${query}` : '');
    if (url === urlNow()) return;
    const entry = save();
    const portal = route.view === 'portal' ? { scroll: entry.scroll, axis } : entry.portal;
    const results = route.view === 'results' ? { scroll: entry.scroll, axis } : entry.results;
    window.history.pushState({ radar: true, scroll, axis, portal, results, previous: urlNow(), previousView: route.view } satisfies Entry, '', url);
    pending.current = scroll; titleFocus.current = next.view !== route.view || next.page !== route.page || next.id !== route.id;
    setRoute(next); setCanUndo(next.view === 'portal' && route.view === 'portal');
  }
  function returnToPortal() {
    const next: ExploreRoute = { ...route, view: 'portal', id: undefined };
    const query = routeQuery(next);
    const url = window.location.pathname + (query ? `?${query}` : '');
    const entry = save();
    if (entry.previous === url) window.history.back();
    else {
      navigate(next, entry.portal?.scroll ?? 0);
      if (entry.portal) {
        setAxisState(entry.portal.axis);
        window.history.replaceState({ ...window.history.state, axis: entry.portal.axis }, '', window.location.href);
      }
    }
  }
  function returnToResults() {
    const next: ExploreRoute = { ...route, view: 'results', id: undefined };
    const query = routeQuery(next);
    const url = window.location.pathname + (query ? `?${query}` : '');
    const entry = save();
    if (entry.previous === url) window.history.back();
    else navigate(next, entry.results?.scroll ?? 0);
  }
  function undo() { save(); window.history.back(); }
  function setAxis(next: Axis) {
    setAxisState(next);
    window.history.replaceState({ ...window.history.state, axis: next }, '', window.location.href);
  }
  function replacePage(page: number) {
    const next = { ...route, page };
    const query = routeQuery(next);
    window.history.replaceState(window.history.state, '', window.location.pathname + (query ? `?${query}` : ''));
    setRoute(next);
  }
  return { route, axis, canUndo, initialized, navigate, returnToPortal, returnToResults, undo, setAxis, replacePage, pending, titleFocus };
}

export function useRestorePosition(ready: boolean, routeKey: string, pending: { current: number | null }, titleFocus: { current: boolean }) {
  useLayoutEffect(() => {
    if (!ready || pending.current === null) return;
    const y = pending.current;
    const frame = window.requestAnimationFrame(() => {
      if (titleFocus.current) document.getElementById('page-title')?.focus({ preventScroll: true });
      titleFocus.current = false; window.scrollTo(0, y); pending.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [ready, routeKey, pending, titleFocus]);
}
