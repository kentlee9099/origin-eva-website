import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { translations, type LangCode, type Translations } from '../i18n/translations';

// ─── Types ──────────────────────────────────────────
interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: keyof Translations) => string;
}

// ─── Constants ──────────────────────────────────────
const LANG_KEY = 'origin_language';
const CONTENT_KEY = 'origin_admin_content';

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

/** Read admin content overrides from localStorage and map to translation keys */
function readOverrides(): Partial<Record<keyof Translations, string>> {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return {};
    const fields = JSON.parse(raw) as Array<{ id: string; value: string }>;
    const map: Record<string, keyof Translations> = {
      siteTitle:        'hero_eyebrow',
      siteDescription:  'about_text',
      heroEyebrow:      'hero_eyebrow',
      heroTitle:        'hero_title_line1',
      heroLead:         'hero_lead',
      heroNotes:        'hero_stat1',
      manifestoText:    'about_text',
      facilitiesLabel:  'section_services',
      observationLabel: 'section_cases',
      observationStatus:'section_cases',
      archivesLabel:    'section_insights',
      archivesVault:    'section_insights',
      footerCopyright:  'footer_company',
      footerStatus:     'footer_resources',
    };
    const out: Partial<Record<keyof Translations, string>> = {};
    for (const f of fields) {
      const k = map[f.id];
      if (k) out[k] = f.value;
    }
    return out;
  } catch {
    return {};
  }
}

// ─── Context ────────────────────────────────────────
const LanguageContext = createContext<LanguageContextValue>({
  lang: 'cn',
  setLang: () => {},
  t: (key) => String(key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getStoredLang);
  const [tick, setTick] = useState(0); // bump this to re-read overrides

  // Poll localStorage for content overrides every 1 s
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Listen for cross-tab storage changes
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONTENT_KEY || e.key === LANG_KEY) {
        setTick((n) => n + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Sync lang from localStorage when tick changes (another tab may have changed it)
  useEffect(() => {
    const stored = getStoredLang();
    if (stored !== lang) setLangState(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    saveLang(newLang);
  }, []);

  const t = useCallback(
    (key: keyof Translations): string => {
      const overrides = readOverrides();
      if (overrides[key] !== undefined) return overrides[key]!;
      const tr = translations[lang] || translations.cn;
      return tr[key] || translations.cn[key] || String(key);
    },
    // tick ensures we re-read overrides periodically
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lang, tick]
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
