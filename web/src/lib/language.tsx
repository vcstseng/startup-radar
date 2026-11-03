import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translate, type Language } from './translations.js';
const Context = createContext({ lang: 'zh' as Language, setLanguage: (_: Language) => {} });
export function LanguageProvider({children}: {children: ReactNode}) {
  const fromUrl = (): Language => new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'zh';
  const [lang, setLang] = useState<Language>(fromUrl);
  useEffect(() => {
    const apply = () => setLang(fromUrl());
    window.addEventListener('popstate', apply);
    return () => window.removeEventListener('popstate', apply);
  }, []);
  useEffect(() => { document.documentElement.lang = lang === 'en' ? 'en' : 'zh-Hant'; }, [lang]);
  function setLanguage(next: Language) {
    if (next === lang) return;
    const url = new URL(window.location.href);
    next === 'en' ? url.searchParams.set('lang', 'en') : url.searchParams.delete('lang');
    window.history.replaceState({...window.history.state, scroll: window.scrollY}, '', url.pathname + url.search + url.hash);
    setLang(next);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  return <Context.Provider value={{lang, setLanguage}}>{children}</Context.Provider>;
}
export function useLanguage() {
  const context = useContext(Context);
  return {...context, t: (key: string, ...values: unknown[]) => translate(context.lang, key, ...values)};
}
