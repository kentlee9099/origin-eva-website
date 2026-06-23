import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, TrendingUp, Package, Users } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Observation() {
  const config = useConfig();
  const observationConfig = config.observation;
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ lat: observationConfig.initialLat, lon: observationConfig.initialLon });
  const { t } = useLanguage();

  useEffect(() => {
    setCoords({ lat: observationConfig.initialLat, lon: observationConfig.initialLon });
  }, [observationConfig.initialLat, observationConfig.initialLon]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords((prev) => ({
        lat: parseFloat((prev.lat + (Math.random() - 0.5) * 0.02).toFixed(2)),
        lon: parseFloat((prev.lon + (Math.random() - 0.5) * 0.03).toFixed(2)),
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(videoRef.current, { opacity: 0, scale: 0.95 }, {
        opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none reverse' },
      });
      if (statsRef.current) {
        gsap.fromTo(Array.from(statsRef.current.children), { opacity: 0, y: 30 }, {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: statsRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const stats = [
    { icon: Package, label: t('stats_partners'), value: '500+' },
    { icon: TrendingUp, label: t('stats_years'), value: '10+' },
    { icon: Users, label: t('stats_countries'), value: '50+' },
  ];

  return (
    <section ref={sectionRef} id="observation" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', padding: '120px 40px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px 0' }}>{t('cases_subtitle')}</p>
            <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 400, color: 'var(--text-primary)', margin: 0 }}>
              {t('section_cases')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '500px' }}>{t('cases_desc')}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Eye size={14} />
            {t('case_energy_type')}
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <video ref={videoRef} autoPlay muted loop playsInline style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '16/9', objectFit: 'cover', opacity: 0, border: '1px solid var(--border-color)' }}>
            <source src={observationConfig.videoPath} type="video/mp4" />
          </video>

          <div style={{ position: 'absolute', bottom: '16px', right: '16px', fontSize: '11px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(6,8,15,0.7)', padding: '8px 12px', border: '1px solid var(--border-color)' }}>
            {observationConfig.latLabel} {coords.lat.toFixed(2)}, {observationConfig.lonLabel} {coords.lon.toFixed(2)}
          </div>

          <div style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '11px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(6,8,15,0.7)', padding: '8px 12px', border: '1px solid var(--border-color)' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--blue-primary)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            {observationConfig.statusText}
          </div>
        </div>

        {/* Stats row */}
        <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', marginTop: '1px', background: 'var(--border-color)' }}>
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Icon size={20} style={{ color: 'var(--blue-primary)', marginBottom: '12px' }} />
                <div style={{ fontSize: '28px', fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
