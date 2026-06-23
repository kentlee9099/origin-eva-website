import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft } from 'lucide-react';

export default function FacilityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useLanguage();
  const config = useConfig();
  const facilitiesConfig = config.facilities;
  const navigationConfig = config.navigation;

  const facility = useMemo(() => facilitiesConfig.items.find((item) => item.slug === slug) ?? null, [slug]);

  if (!facility) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace", padding: '40px' }}>
        <p>{t('detail_not_found')}</p>
        <Link to="/" style={{ color: 'var(--blue-light)', textDecoration: 'underline' }}>{t('detail_return')}</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', color: 'var(--text-primary)', fontFamily: "'IBM Plex Mono', monospace", display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderBottom: '1px solid var(--border-color)' }}>
        <span style={{ fontSize: '18px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff' }}>
          {navigationConfig.brandName}
        </span>
        <Link to="/#facilities" style={{
          fontSize: '12px', fontWeight: 400, textTransform: 'uppercase',
          color: 'var(--blue-light)', textDecoration: 'none', borderBottom: '1px solid var(--blue-primary)',
          paddingBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'gap 0.2s',
        }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.gap = '10px'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.gap = '6px'; }}>
          <ArrowLeft size={12} />
          {t('detail_back')}
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'row' }}>
        <div style={{ flex: 1, padding: '60px 48px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '11px', color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 16px 0' }}>
            {facility.code}
          </p>
          <h1 style={{ fontSize: '28px', fontWeight: 400, lineHeight: '34px', textTransform: 'uppercase', margin: '0 0 40px 0', color: '#fff' }}>
            {t(`svc_${facility.slug}_name` as keyof typeof t)}
          </h1>
          <div style={{ maxWidth: '520px' }}>
            {facility.article.paragraphs.map((paragraph, index) => (
              <p key={`${facility.slug}-${index}`} style={{ fontSize: '13px', fontWeight: 400, lineHeight: '22px', margin: '0 0 20px 0', color: 'var(--text-secondary)' }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', background: 'var(--bg-base)' }}>
          {facility.image ? (
            <img src={facility.image} alt={facility.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(70%) contrast(1.1)', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
              No Image
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="flex-direction: row"] { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
