import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';
import AsciiCanvas from '../components/AsciiCanvas';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { useConfig } from '../context/ConfigContext';

export default function Hero() {
  const { navigation: navigationConfig } = useConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navDark, setNavDark] = useState(false);
  const { t } = useLanguage();

  // Track scroll to change nav color on white sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      setNavDark(scrollY > vh * 0.85);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.set([eyebrowRef.current, titleRef.current, leadRef.current], { opacity: 0, y: 30 });
      if (notesRef.current) gsap.set(notesRef.current.children, { opacity: 0, y: 20 });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.5')
        .to(leadRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5');
      if (notesRef.current) {
        tl.to(notesRef.current.children, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }, '-=0.3');
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const navTextColor = navDark ? 'var(--bg-base)' : '#fff';
  const navDotColor = navDark ? 'rgba(10,14,26,0.3)' : 'rgba(255,255,255,0.3)';

  const navLinks = navigationConfig.links.length > 0
    ? navigationConfig.links
    : [
        { label: t('nav_services'), href: '#facilities' },
        { label: t('nav_cases'), href: '#observation' },
        { label: t('nav_insights'), href: '#archives' },
        { label: t('nav_contact'), href: '#footer' },
      ];

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', display: 'flex' }}
    >
      {/* Left Panel */}
      <div style={{ position: 'relative', width: '40%', minWidth: '280px', background: 'var(--bg-deep)', overflow: 'hidden' }}>
        {/* Navigation */}
        <nav
          ref={navRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '40%',
            minWidth: '280px',
            zIndex: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            background: 'transparent',
            fontFamily: "'IBM Plex Mono', monospace",
            boxSizing: 'border-box',
            transition: 'color 0.4s ease',
          }}
        >
          <span style={{ fontSize: '18px', fontWeight: 400, color: navTextColor, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.4s ease', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {navigationConfig.brandName || 'ORIGIN'}
          </span>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="desktop-nav">
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {navLinks.map((item, index) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <a
                    href={item.href}
                    style={{
                      fontSize: '12px', fontWeight: 400, color: navTextColor, textTransform: 'uppercase',
                      textDecoration: 'none', letterSpacing: '0.08em',
                      borderBottom: '1px solid transparent', transition: 'border-color 0.2s, color 0.4s ease',
                      paddingBottom: '2px', whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.borderBottomColor = navTextColor; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.borderBottomColor = 'transparent'; }}
                  >
                    {item.label}
                  </a>
                  {index < navLinks.length - 1 && (
                    <span style={{ color: navDotColor, fontSize: '12px', transition: 'color 0.4s ease' }}>·</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ flexShrink: 0 }}>
              <LanguageSwitcher isDark={!navDark} />
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="mobile-nav-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none', background: 'none', border: 'none',
              color: navTextColor, cursor: 'pointer', padding: '4px',
            }}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            position: 'fixed', top: '64px', left: 0, width: '100%', minWidth: '280px',
            zIndex: 49, background: 'rgba(6,8,15,0.97)', padding: '20px 32px',
            borderBottom: '1px solid var(--border-color)',
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '12px 0', color: '#fff', fontSize: '13px', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid var(--border-color)' }}
              >
                {item.label}
              </a>
            ))}
            <div style={{ marginTop: '12px' }}>
              <LanguageSwitcher isDark={true} />
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div style={{ position: 'absolute', left: '40px', right: '24px', top: '22vh', zIndex: 10, width: 'calc(100% - 64px)' }}>
          <p ref={eyebrowRef} style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 400,
            lineHeight: 1.6, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--blue-light)', margin: '0 0 22px 0',
          }}>
            {t('hero_eyebrow')}
          </p>

          <h1 ref={titleRef} style={{
            fontFamily: "'Geist Pixel', monospace",
            fontSize: 'clamp(40px, 5.2vw, 72px)', fontWeight: 400,
            lineHeight: 1.0, color: '#fff', textTransform: 'uppercase',
            margin: 0, textWrap: 'balance', letterSpacing: '0.015em',
          }}>
            {t('hero_title_line1')}<br />{t('hero_title_line2')}
          </h1>

          <p ref={leadRef} style={{
            fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px',
            fontWeight: 400, lineHeight: 1.8, color: 'var(--text-secondary)',
            margin: '28px 0 0 0', maxWidth: '42ch',
          }}>
            {t('hero_lead')}
          </p>

          <div ref={notesRef} style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[t('hero_stat1'), t('hero_stat2'), t('hero_stat3')].map((note, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ width: '24px', height: '1px', background: 'var(--blue-primary)', display: 'inline-block' }} />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>{note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - ASCII Logo */}
      <div style={{ position: 'relative', width: '60%', background: 'var(--bg-deep)', overflow: 'hidden' }}>
        <AsciiCanvas />
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          #hero { flex-direction: column !important; height: auto !important; min-height: 100vh; }
          #hero > div:first-child { width: 100% !important; min-width: auto !important; height: auto; min-height: 60vh; padding-bottom: 40px; }
          #hero > div:last-child { width: 100% !important; height: 40vh; min-height: 300px; }
          .desktop-nav { display: none !important; }
          .mobile-nav-btn { display: block !important; }
          nav { width: 100% !important; min-width: auto !important; }
        }
        @media (max-width: 480px) {
          #hero > div:first-child { padding: 0 20px 30px; }
          #hero > div:first-child > div:last-child { left: 20px; right: 20px; width: calc(100% - 40px); top: 18vh; }
          nav { padding: 16px 20px !important; }
        }
        @media (min-width: 769px) {
          .mobile-nav-btn { display: none !important; }
        }
      `}</style>
    </section>
  );
}
