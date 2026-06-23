import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { type FacilityItem } from '../config';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

function AnalogClock({ utcOffset = 0 }: { utcOffset?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 48;
    canvas.width = size * 2;
    canvas.height = size * 2;

    const draw = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const localTime = new Date(utc + utcOffset * 3600000);

      ctx.clearRect(0, 0, size * 2, size * 2);
      ctx.save();
      ctx.translate(size, size);
      ctx.scale(2, 2);

      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = 'var(--blue-primary)';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
        ctx.lineTo(Math.cos(angle) * 21, Math.sin(angle) * 21);
        ctx.strokeStyle = 'var(--blue-muted)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      const hr = localTime.getHours() % 12;
      const hrAngle = ((hr + localTime.getMinutes() / 60) * Math.PI) / 6 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(hrAngle) * 11, Math.sin(hrAngle) * 11);
      ctx.strokeStyle = 'var(--text-primary)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const minAngle = ((localTime.getMinutes() + localTime.getSeconds() / 60) * Math.PI) / 30 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(minAngle) * 15, Math.sin(minAngle) * 15);
      ctx.strokeStyle = 'var(--text-secondary)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const secAngle = (localTime.getSeconds() * Math.PI) / 30 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(secAngle) * 17, Math.sin(secAngle) * 17);
      ctx.strokeStyle = 'var(--blue-primary)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [utcOffset]);

  return <canvas ref={canvasRef} style={{ width: '48px', height: '48px', marginBottom: '16px' }} />;
}

function FacilityColumn({ facility, isLast }: { facility: FacilityItem; isLast: boolean }) {
  const [imgHover, setImgHover] = useState(false);
  const { t } = useLanguage();

  return (
    <div style={{ borderRight: isLast ? 'none' : '1px solid var(--border-color)', padding: '40px 24px', display: 'flex', flexDirection: 'column', minHeight: '100%', background: 'transparent' }}>
      <Link to={`/facility/${facility.slug}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
        <h2 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '18px', fontWeight: 400, lineHeight: '24px', textTransform: 'uppercase', margin: '0 0 4px 0', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
          {t(`svc_${facility.slug}_name` as keyof typeof t)}
        </h2>
      </Link>

      <div style={{ marginTop: '20px' }}><AnalogClock utcOffset={facility.utcOffset} /></div>

      {facility.address && (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', lineHeight: '20px', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 12px 0' }}>
          {facility.address}
        </p>
      )}

      {facility.status && (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', lineHeight: '20px', color: 'var(--text-secondary)', margin: '0 0 12px 0', fontStyle: 'italic' }}>
          {facility.status}
        </p>
      )}

      {/* Service features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '3px', height: '3px', background: 'var(--blue-primary)', borderRadius: '50%', display: 'inline-block' }} />
            {t(`svc_${facility.slug}_f${i}` as keyof typeof t)}
          </div>
        ))}
      </div>

      {facility.ctaText && (
        <a href={facility.ctaHref || '#'} style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', fontWeight: 400, textTransform: 'uppercase',
          color: 'var(--blue-light)', textDecoration: 'none', borderBottom: '1px solid var(--blue-primary)',
          paddingBottom: '2px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '32px', transition: 'gap 0.2s',
        }} onClick={(e) => { if (!facility.ctaHref || facility.ctaHref === '#') e.preventDefault(); }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.gap = '10px'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.gap = '6px'; }}>
          {t(`svc_${facility.slug}_detail` as keyof typeof t)}
          <ArrowRight size={12} />
        </a>
      )}

      {facility.image && (
        <div style={{ marginTop: 'auto', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <img src={facility.image} alt={facility.name} onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)}
            style={{ width: '100%', aspectRatio: '3 / 4', objectFit: 'cover', display: 'block', opacity: imgHover ? 0.8 : 1, transition: 'opacity 0.2s', filter: 'grayscale(70%) contrast(1.1)' }} />
        </div>
      )}
    </div>
  );
}

export default function Facilities() {
  const config = useConfig();
  const facilitiesConfig = config.facilities;
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const facilities = facilitiesConfig.items;
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;
    const cols = gridRef.current.children;
    const ctx = gsap.context(() => {
      gsap.fromTo(Array.from(cols), { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', toggleActions: 'play none none reverse' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!facilitiesConfig.sectionLabel && facilities.length === 0) return null;

  return (
    <section ref={sectionRef} id="facilities" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)' }}>
      <div style={{ padding: '40px 40px 20px' }}>
        <p style={{ fontSize: '11px', color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 12px 0' }}>{t('services_subtitle')}</p>
        <h3 style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '28px', fontWeight: 400, lineHeight: '32px', color: 'var(--text-primary)', margin: 0 }}>
          {t('section_services')}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '12px', maxWidth: '600px' }}>{t('services_desc')}</p>
      </div>

      <div ref={gridRef} className="facilities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border-color)' }}>
        {facilities.map((facility, index) => (
          <FacilityColumn key={facility.slug} facility={facility} isLast={index === facilities.length - 1} />
        ))}
      </div>
    </section>
  );
}
