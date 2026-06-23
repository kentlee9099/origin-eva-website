import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const footerServices = [
    t('svc_procurement_name'),
    t('svc_sales_name'),
    t('svc_consulting_name'),
    t('svc_partnership_name'),
  ];

  const footerCompany = [
    { label: t('footer_about_us'), href: '#' },
    { label: t('footer_success_cases'), href: '#' },
    { label: t('footer_trade_insights'), href: '#' },
    { label: t('footer_contact_us'), href: '#' },
  ];

  const footerResources = [
    t('footer_market_reports'),
    'Policy Analysis',
    'Industry News',
    'Cooperation Guide',
  ];

  return (
    <footer ref={sectionRef} id="footer" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)', fontFamily: "'IBM Plex Mono', monospace" }}>
      {/* Main Footer Content */}
      <div style={{ padding: '80px 40px 60px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', maxWidth: '1400px' }}>
        {/* Brand Column */}
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 20px 0', color: '#fff' }}>
            ORIGIN EVA
          </h3>
          <p style={{ fontSize: '12px', lineHeight: 1.8, color: 'var(--text-tertiary)', maxWidth: '320px', margin: '0 0 24px 0' }}>
            {t('about_text').slice(0, 120)}...
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <Mail size={14} style={{ color: 'var(--blue-primary)' }} />
              contact@origineva.com
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <Phone size={14} style={{ color: 'var(--blue-primary)' }} />
              +86 10 xxxx xxxx
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <MapPin size={14} style={{ color: 'var(--blue-primary)' }} />
              China · Beijing
            </div>
          </div>
        </div>

        {/* Services Column */}
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 20px 0', color: 'var(--blue-light)' }}>
            {t('footer_services')}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {footerServices.map((item) => (
              <li key={item}>
                <a href="#facilities" style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--blue-light)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 20px 0', color: 'var(--blue-light)' }}>
            {t('footer_company')}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {footerCompany.map((item) => (
              <li key={item.label}>
                <a href={item.href} style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--blue-light)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources Column */}
        <div>
          <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 20px 0', color: 'var(--blue-light)' }}>
            {t('footer_resources')}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {footerResources.map((item) => (
              <li key={item}>
                <a href="#" style={{ fontSize: '12px', color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--blue-light)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'; }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid var(--border-color)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-tertiary)', flexWrap: 'wrap', gap: '12px' }}>
        <span>&copy; 2026 Origin EVA. All rights reserved.</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--blue-light)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}>
            {t('footer_policy')}
          </a>
          <a href="#" style={{ color: 'var(--text-tertiary)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--blue-light)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}>
            {t('footer_terms')}
          </a>
        </div>
      </div>
    </footer>
  );
}
