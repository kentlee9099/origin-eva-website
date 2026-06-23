import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { translations, type LangCode, type Translations } from '../i18n/translations';
// @ts-ignore — Vite allows JSON import at build time
import overrideData from '../i18n/data.json';

// ─── Types ──────────────────────────────────────────
interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

// ─── Constants ──────────────────────────────────────
const LANG_KEY = 'origin_language';

// ─── Helpers ────────────────────────────────────────
function getStoredLang(): LangCode {
  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === 'en' || s === 'ru' || s === 'cn') return s;
  } catch { /* ignore */ }
  return 'cn';
}

function saveLang(lang: LangCode) {
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
}

/** Merge default translations with override data from data.json */
function buildTranslations(): Record<LangCode, Translations> {
  const result: Record<LangCode, Translations> = {
    cn: { ...translations.cn },
    en: { ...translations.en },
    ru: { ...translations.ru },
  };

  // Apply overrides from data.json at BUILD TIME
  // This file is modified by AdminDashboard via GitHub API
  // Vercel rebuilds after push, so new data is baked into the bundle
  if (overrideData) {
    for (const lang of ['cn', 'en', 'ru'] as LangCode[]) {
      const overrides = (overrideData as Record<string, Record<string, string>>)[lang];
      if (overrides) {
        for (const [key, val] of Object.entries(overrides)) {
          if (val && val.trim().length > 0) {
            (result[lang] as Record<string, string>)[key] = val;
          }
        }
      }
    }
  }

  return result;
}

// Build merged translations ONCE at module initialization
// This runs at BUILD TIME on Vercel (when npm run build executes)
const mergedTranslations = buildTranslations();

// ─── Context ────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue>({
  lang: 'cn',
  setLang: () => {},
  t: (key) => String(key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getStoredLang);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    saveLang(newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      // Use build-time merged translations (includes data.json overrides)
      const tr = mergedTranslations[lang] || mergedTranslations.cn;
      return (tr as Record<string, string>)[key] || (mergedTranslations.cn as Record<string, string>)[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export { translations, type LangCode, type Translations };
