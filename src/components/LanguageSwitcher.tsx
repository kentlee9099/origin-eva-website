import { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage, type LangCode } from '../context/LanguageContext';

interface LanguageSwitcherProps {
  isDark?: boolean;
}

const languages: { code: LangCode; label: string; short: string }[] = [
  { code: 'cn', label: '中文', short: 'CN' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ru', label: 'Русский', short: 'RU' },
];

export default function LanguageSwitcher({ isDark = true }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  const textColor = isDark ? '#fff' : '#0a0e1a';
  const borderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(10,14,26,0.3)';
  const borderHover = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(10,14,26,0.6)';
  const bgDropdown = '#0f1525';
  const borderDropdown = 'rgba(74,127,181,0.2)';

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: `1px solid ${borderColor}`,
          padding: '6px 14px',
          color: textColor,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = borderHover;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = borderColor;
        }}
      >
        <Globe size={13} />
        {currentLang.short}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: bgDropdown,
            border: `1px solid ${borderDropdown}`,
            zIndex: 50,
            minWidth: '140px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 16px',
                background: lang === l.code ? 'rgba(74,127,181,0.15)' : 'transparent',
                border: 'none',
                color: lang === l.code ? '#6b9cc9' : 'rgba(232,236,242,0.6)',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left' as const,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(74,127,181,0.1)';
                (e.currentTarget as HTMLElement).style.color = '#6b9cc9';
              }}
              onMouseLeave={(e) => {
                if (lang !== l.code) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'rgba(232,236,242,0.6)';
                }
              }}
            >
              <span
                style={{
                  width: '20px',
                  height: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(74,127,181,0.3)',
                  fontSize: '8px',
                }}
              >
                {l.short}
              </span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
