import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionRef.current || !textRef.current || !videoRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(videoRef.current, { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
      });
      gsap.fromTo(textRef.current, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
      });
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.children, { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="manifesto" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', padding: '140px 40px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ width: '100%', maxWidth: '1360px', display: 'grid', gridTemplateColumns: 'minmax(300px, 46%) minmax(300px, 1fr)', gap: '64px', alignItems: 'center' }}>
        <div ref={videoRef} style={{ opacity: 0 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <video autoPlay muted loop playsInline preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}>
              <source src="/videos/manifesto.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Stats below video */}
          <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', marginTop: '1px', background: 'var(--border-color)' }}>
            <div style={{ background: 'var(--bg-card)', padding: '24px 20px' }}>
              <div style={{ fontSize: '32px', fontWeight: 400, color: 'var(--blue-light)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{t('about_stat2_value')}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('about_stat2_label')}</div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '24px 20px' }}>
              <div style={{ fontSize: '32px', fontWeight: 400, color: 'var(--blue-light)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{t('about_stat1_value')}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('about_stat1_label')}</div>
            </div>
          </div>
        </div>

        <div>
          <p ref={textRef} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '14px', fontWeight: 400, lineHeight: '26px', maxWidth: '680px', textAlign: 'left', margin: 0, opacity: 0, color: 'var(--text-secondary)' }}>
            {t('about_text')}
          </p>
          {/* Feature list */}
          <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--blue-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--blue-light)' }}>{i}</span>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '2px', fontWeight: 400 }}>{t(`about_feature${i}` as keyof typeof t)}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{t(`about_feature${i}_desc` as keyof typeof t)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #manifesto { padding: 80px 20px !important; }
          #manifesto > div { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
