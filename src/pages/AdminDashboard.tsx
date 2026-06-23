import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Image, LogOut,
  Save, CheckCircle, ExternalLink, Github,
  Settings, ChevronDown, ChevronUp, Search, RefreshCw,
  AlertCircle, Loader2, Eye, EyeOff
} from 'lucide-react';
import {
  type GitHubConfig,
  loadConfig,
  saveConfig,
  fetchTranslationsJson,
  pushTranslationsJson,
  isDeployed,
} from '../lib/github';
import type { LangCode } from '../i18n/translations';

// ─── Types ────────────────────────────────────────
type TabType = 'dashboard' | 'content' | 'images' | 'settings';

interface GitState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  commitSha: string | null;
  deployed: boolean;
}

// ─── Helpers ──────────────────────────────────────
const SECTIONS: { id: string; label: string; keys: string[] }[] = [
  { id: 'nav', label: '导航栏', keys: ['nav_services', 'nav_cases', 'nav_insights', 'nav_contact', 'nav_start'] },
  { id: 'hero', label: '首屏 Hero', keys: ['hero_eyebrow', 'hero_title_line1', 'hero_title_line2', 'hero_lead', 'hero_stat1', 'hero_stat2', 'hero_stat3', 'hero_cta_explore', 'hero_cta_learn'] },
  { id: 'about', label: '关于起源', keys: ['section_about', 'about_title_highlight', 'about_title', 'about_text', 'about_stat1_label', 'about_stat1_value', 'about_stat2_label', 'about_stat2_value', 'about_feature1', 'about_feature1_desc', 'about_feature2', 'about_feature2_desc', 'about_feature3', 'about_feature3_desc', 'about_feature4', 'about_feature4_desc'] },
  { id: 'services', label: '服务', keys: ['section_services', 'services_subtitle', 'services_desc', 'svc_procurement_name', 'svc_procurement_desc', 'svc_procurement_f1', 'svc_procurement_f2', 'svc_procurement_f3', 'svc_procurement_f4', 'svc_procurement_detail', 'svc_sales_name', 'svc_sales_desc', 'svc_sales_f1', 'svc_sales_f2', 'svc_sales_f3', 'svc_sales_f4', 'svc_sales_detail', 'svc_consulting_name', 'svc_consulting_desc', 'svc_consulting_f1', 'svc_consulting_f2', 'svc_consulting_f3', 'svc_consulting_f4', 'svc_consulting_detail', 'svc_partnership_name', 'svc_partnership_desc', 'svc_partnership_f1', 'svc_partnership_f2', 'svc_partnership_f3', 'svc_partnership_f4', 'svc_partnership_detail'] },
  { id: 'cases', label: '案例', keys: ['section_cases', 'cases_subtitle', 'cases_desc', 'case_energy_title', 'case_energy_desc', 'case_energy_type', 'case_agri_title', 'case_agri_desc', 'case_agri_type', 'case_infra_title', 'case_infra_desc', 'case_infra_type', 'case_industry_title', 'case_industry_desc', 'case_industry_type', 'case_logistics_title', 'case_logistics_desc', 'case_logistics_type', 'case_brand_title', 'case_brand_desc', 'case_brand_type'] },
  { id: 'insights', label: '洞察', keys: ['section_insights', 'insights_subtitle', 'insights_desc', 'insights_all', 'insights_analysis', 'insights_industry', 'insights_guide', 'insights_video', 'insight_1_title', 'insight_1_desc', 'insight_1_author', 'insight_1_date', 'insight_2_title', 'insight_2_desc', 'insight_2_author', 'insight_2_date', 'insight_3_title', 'insight_3_desc', 'insight_3_author', 'insight_3_date'] },
  { id: 'testimonials', label: '客户评价', keys: ['section_testimonials', 'testimonials_subtitle', 'testimonials_desc', 'testimonial_1_text', 'testimonial_1_name', 'testimonial_1_role', 'testimonial_1_company', 'testimonial_2_text', 'testimonial_2_name', 'testimonial_2_role', 'testimonial_2_company', 'testimonial_3_text', 'testimonial_3_name', 'testimonial_3_role', 'testimonial_3_company'] },
  { id: 'cta', label: '行动号召', keys: ['section_cta_title', 'section_cta_subtitle', 'section_cta_desc', 'cta_contact', 'cta_learn', 'cta_badge1', 'cta_badge2', 'cta_badge3'] },
  { id: 'footer', label: '页脚', keys: ['footer_services', 'footer_company', 'footer_resources', 'footer_about_us', 'footer_success_cases', 'footer_trade_insights', 'footer_contact_us', 'footer_market_reports', 'footer_policy', 'footer_terms'] },
  { id: 'admin', label: '管理后台', keys: ['admin_login', 'admin_username', 'admin_password', 'admin_login_btn', 'admin_dashboard', 'admin_content', 'admin_images', 'admin_language', 'admin_save', 'admin_saved'] },
];

// ─── Components ───────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [data, setData] = useState<Record<LangCode, Record<string, string>> | null>(null);
  const [dataSha, setDataSha] = useState<string>('');
  const [config, setConfig] = useState<GitHubConfig | null>(loadConfig);
  const [gitState, setGitState] = useState<GitState>({ connected: false, loading: false, error: null, commitSha: null, deployed: false });
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['nav', 'hero']));
  const [langFilter, setLangFilter] = useState<'all' | LangCode>('all');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Auth check
  useEffect(() => {
    if (!localStorage.getItem('origin_admin_auth')) navigate('/admin/login');
  }, [navigate]);

  // Load data from GitHub
  const loadData = async () => {
    if (!config) return;
    setGitState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data: jsonData, sha } = await fetchTranslationsJson(config);
      setData(jsonData as Record<LangCode, Record<string, string>>);
      setDataSha(sha);
      setGitState({ connected: true, loading: false, error: null, commitSha: sha, deployed: true });
    } catch (e: any) {
      setGitState({ connected: false, loading: false, error: e.message || '连接失败', commitSha: null, deployed: false });
    }
  };

  // Initial load
  useEffect(() => {
    if (config) loadData();
  }, [config]);

  // Poll deployment status
  useEffect(() => {
    if (!config || !gitState.commitSha) return;
    intervalRef.current = setInterval(async () => {
      const deployed = await isDeployed(config, gitState.commitSha!);
      setGitState((s) => ({ ...s, deployed }));
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [config, gitState.commitSha]);

  const handleConnect = async (c: GitHubConfig) => {
    saveConfig(c);
    setConfig(c);
    await loadData();
  };

  const handleSaveKey = async (key: string) => {
    if (!data || !config) return;
    const newData = { ...data };
    const langs: LangCode[] = ['cn', 'en', 'ru'];
    for (const lang of langs) {
      const val = editValues[`${lang}:${key}`];
      if (val !== undefined) {
        newData[lang] = { ...newData[lang], [key]: val };
      }
    }
    setData(newData);
    setEditingKey(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePushAll = async () => {
    if (!data || !config || !dataSha) return;
    setGitState((s) => ({ ...s, loading: true, error: null }));
    try {
      const sha = await pushTranslationsJson(config, data, dataSha, 'Update translations via admin');
      setGitState({ connected: true, loading: false, error: null, commitSha: sha, deployed: false });
      setDataSha(sha);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setGitState((s) => ({ ...s, loading: false, error: e.message }));
    }
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startEditing = (key: string) => {
    if (!data) return;
    const vals: Record<string, string> = {};
    for (const lang of ['cn', 'en', 'ru'] as LangCode[]) {
      vals[`${lang}:${key}`] = data[lang]?.[key] || '';
    }
    setEditValues(vals);
    setEditingKey(key);
  };

  // Filtered sections based on search
  const filteredSections = useMemo(() => {
    if (!data) return [];
    if (!search) return SECTIONS;
    const q = search.toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      keys: s.keys.filter((k) => {
        const hasMatch = s.keys.some((sk) => sk.toLowerCase().includes(q));
        const valMatch = ['cn', 'en', 'ru'].some((lang) => (data[lang as LangCode]?.[k] || '').toLowerCase().includes(q));
        return hasMatch || valMatch || k.toLowerCase().includes(q);
      }),
    })).filter((s) => s.keys.length > 0);
  }, [data, search]);

  // Translation completion stats
  const stats = useMemo(() => {
    if (!data) return { total: 0, cn: 0, en: 0, ru: 0 };
    const keys = Object.keys(data.cn || {});
    const total = keys.length;
    const count = (lang: LangCode) => keys.filter((k) => (data[lang]?.[k] || '').trim().length > 0).length;
    return { total, cn: count('cn'), en: count('en'), ru: count('ru') };
  }, [data]);

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: '仪表板', icon: LayoutDashboard },
    { id: 'content', label: '内容管理', icon: FileText },
    { id: 'images', label: '图片管理', icon: Image },
    { id: 'settings', label: 'Git设置', icon: Settings },
  ];

  // ─── Git Connect Form ───────────────────────────
  if (!config) {
    return <GitConnectForm onConnect={handleConnect} />;
  }

  // ─── Loading ────────────────────────────────────
  if (!data) {
    return (
      <div className="admin-loading" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#0a0e1a', color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace" }}>
        <Loader2 size={32} className="spin" />
        <p style={{ fontSize: '13px' }}>正在连接 GitHub 仓库...</p>
        {gitState.error && (
          <div style={{ maxWidth: '400px', textAlign: 'center', color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>
            <AlertCircle size={16} style={{ marginBottom: '8px' }} />
            <p>{gitState.error}</p>
            <button onClick={() => setConfig(null)} style={{ marginTop: '16px', padding: '8px 16px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              重新配置
            </button>
          </div>
        )}
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Main Dashboard ─────────────────────────────
  return (
    <div className="admin-dashboard" style={{ minHeight: '100vh', display: 'flex', background: '#0a0e1a', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', minHeight: '100vh', background: '#06080f', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', margin: 0 }}>ORIGIN EVA</h2>
          <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0 0' }}>管理后台</p>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px',
                  background: isActive ? 'rgba(74,127,181,0.12)' : 'transparent', border: 'none',
                  color: isActive ? '#6b9cc9' : '#64748b', fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer',
                  transition: 'all 0.2s', marginBottom: '2px', borderRadius: '4px', textAlign: 'left' as const,
                }}
                onMouseEnter={(e) => { if (!isActive) { const t = e.currentTarget as HTMLElement; t.style.color = '#94a3b8'; t.style.background = 'rgba(255,255,255,0.03)'; } }}
                onMouseLeave={(e) => { if (!isActive) { const t = e.currentTarget as HTMLElement; t.style.color = '#64748b'; t.style.background = 'transparent'; } }}>
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid #1e293b' }}>
          <button onClick={() => { localStorage.removeItem('origin_admin_auth'); navigate('/admin/login'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: '#64748b', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', textAlign: 'left' as const }}>
            <LogOut size={15} />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '220px', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '14px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, color: '#fff' }}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            {/* Deployment status */}
            {gitState.commitSha && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px',
                color: gitState.deployed ? '#22c55e' : '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: gitState.deployed ? '#22c55e' : '#f59e0b', display: 'inline-block', animation: gitState.deployed ? 'none' : 'pulse 1.5s infinite' }} />
                {gitState.deployed ? '已部署' : '构建中...'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {saved && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#22c55e' }}>
                <CheckCircle size={14} /> 已保存
              </span>
            )}
            {activeTab === 'content' && (
              <button onClick={handlePushAll} disabled={gitState.loading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 18px', background: '#4a7fb5', color: '#fff', border: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: '4px', opacity: gitState.loading ? 0.6 : 1 }}>
                {gitState.loading ? <Loader2 size={14} className="spin" /> : <Github size={14} />}
                提交到GitHub
              </button>
            )}
          </div>
        </header>

        {/* Tab Content */}
        <div style={{ padding: '24px 32px' }}>
          {/* ─── Dashboard Tab ────────────────────── */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                  { label: '总翻译条目', value: stats.total, color: '#4a7fb5' },
                  { label: '中文完成', value: `${stats.cn}/${stats.total}`, color: '#22c55e' },
                  { label: '英文完成', value: `${stats.en}/${stats.total}`, color: '#3b82f6' },
                  { label: '俄文完成', value: `${stats.ru}/${stats.total}`, color: '#a855f7' },
                ].map((s) => (
                  <div key={s.label} style={{ padding: '20px', background: '#0f1525', border: '1px solid #1e293b', borderRadius: '8px', borderLeft: `3px solid ${s.color}` }}>
                    <div style={{ fontSize: '24px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions + Preview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 8px 0' }}>快捷操作</h3>
                  {[
                    { label: '编辑翻译内容', tab: 'content' as TabType, icon: FileText },
                    { label: '管理图片资源', tab: 'images' as TabType, icon: Image },
                    { label: 'GitHub配置', tab: 'settings' as TabType, icon: Settings },
                  ].map((item) => (
                    <button key={item.tab} onClick={() => setActiveTab(item.tab)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#0f1525', border: '1px solid #1e293b', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', cursor: 'pointer', borderRadius: '6px', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#334155'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1e293b'; }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><item.icon size={16} /> {item.label}</span>
                      <ExternalLink size={14} color="#64748b" />
                    </button>
                  ))}
                </div>
                <div style={{ background: '#0f1525', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>网站预览</span>
                    <button onClick={() => window.open('/', '_blank')} style={{ background: 'none', border: 'none', color: '#4a7fb5', cursor: 'pointer', fontSize: '11px' }}>在新窗口打开</button>
                  </div>
                  <iframe src="/" style={{ width: '100%', height: '400px', border: 'none', display: 'block', background: '#06080f' }} />
                </div>
              </div>
            </div>
          )}

          {/* ─── Content Tab ──────────────────────── */}
          {activeTab === 'content' && (
            <div>
              {/* Controls */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input type="text" placeholder="搜索翻译键或内容..." value={search} onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px 10px 32px', background: '#0f1525', border: '1px solid #1e293b', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', borderRadius: '6px', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {([['all', '全部'], ['cn', '中文'], ['en', '英文'], ['ru', '俄文']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setLangFilter(val as typeof langFilter)}
                      style={{ padding: '8px 14px', background: langFilter === val ? '#4a7fb5' : '#0f1525', color: langFilter === val ? '#fff' : '#94a3b8', border: `1px solid ${langFilter === val ? '#4a7fb5' : '#1e293b'}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', cursor: 'pointer', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sections */}
              {filteredSections.map((section) => (
                <div key={section.id} style={{ marginBottom: '8px', background: '#0f1525', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                  <button onClick={() => toggleSection(section.id)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'transparent', border: 'none', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span>{section.label} <span style={{ color: '#64748b', fontSize: '11px' }}>({section.keys.length})</span></span>
                    {expandedSections.has(section.id) ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </button>
                  {expandedSections.has(section.id) && (
                    <div style={{ borderTop: '1px solid #1e293b' }}>
                      {section.keys.map((key) => (
                        <div key={key} style={{ display: 'grid', gridTemplateColumns: langFilter === 'all' ? '180px 1fr 1fr 1fr 80px' : '180px 1fr 80px', padding: '10px 16px', borderBottom: '1px solid #1e293b', alignItems: 'center', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{key}</div>
                          </div>
                          {(['cn', 'en', 'ru'] as LangCode[]).filter((l) => langFilter === 'all' || langFilter === l).map((lang) => (
                            <div key={lang}>
                              {editingKey === key ? (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <textarea value={editValues[`${lang}:${key}`] || ''}
                                    onChange={(e) => setEditValues((v) => ({ ...v, [`${lang}:${key}`]: e.target.value }))}
                                    style={{ flex: 1, padding: '6px 8px', background: '#0a0e1a', border: '1px solid #4a7fb5', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', minHeight: '32px', resize: 'vertical', borderRadius: '4px' }} />
                                </div>
                              ) : (
                                <div onClick={() => startEditing(key)}
                                  style={{ fontSize: '11px', color: (data[lang]?.[key] || '').trim() ? '#e2e8f0' : '#64748b', cursor: 'pointer', padding: '6px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', minHeight: '20px', lineHeight: 1.5 }}>
                                  {(data[lang]?.[key] || '').slice(0, 60) || <span style={{ color: '#475569' }}>-</span>}
                                </div>
                              )}
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            {editingKey === key ? (
                              <>
                                <button onClick={() => handleSaveKey(key)} style={{ padding: '4px 8px', background: '#4a7fb5', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', borderRadius: '3px' }}>
                                  <Save size={12} />
                                </button>
                                <button onClick={() => setEditingKey(null)} style={{ padding: '4px 8px', background: '#1e293b', border: 'none', color: '#94a3b8', fontSize: '10px', cursor: 'pointer', borderRadius: '3px' }}>
                                  取消
                                </button>
                              </>
                            ) : (
                              <button onClick={() => startEditing(key)} style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#64748b', fontSize: '10px', cursor: 'pointer' }}>
                                编辑
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─── Images Tab ───────────────────────── */}
          {activeTab === 'images' && <ImagesTab />}

          {/* ─── Settings Tab ─────────────────────── */}
          {activeTab === 'settings' && (
            <div style={{ maxWidth: '600px' }}>
              <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', margin: '0 0 20px 0' }}>GitHub配置</h3>
              <GitConnectForm onConnect={handleConnect} existingConfig={config} />
              <div style={{ marginTop: '24px', padding: '16px', background: '#0f1525', border: '1px solid #1e293b', borderRadius: '6px' }}>
                <h4 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', margin: '0 0 12px 0' }}>当前连接</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>仓库</span>
                    <span style={{ color: '#e2e8f0' }}>{config.owner}/{config.repo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>分支</span>
                    <span style={{ color: '#e2e8f0' }}>{config.branch}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>状态</span>
                    <span style={{ color: gitState.connected ? '#22c55e' : '#ef4444' }}>{gitState.connected ? '已连接' : '未连接'}</span>
                  </div>
                  {gitState.commitSha && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>最新提交</span>
                      <span style={{ color: '#e2e8f0', fontSize: '10px' }}>{gitState.commitSha.slice(0, 7)}</span>
                    </div>
                  )}
                </div>
                <button onClick={loadData} disabled={gitState.loading}
                  style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0f1525', border: '1px solid #334155', color: '#94a3b8', fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <RefreshCw size={14} /> 重新加载数据
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .admin-dashboard input:focus, .admin-dashboard textarea:focus { border-color: #4a7fb5 !important; }
        .admin-dashboard ::-webkit-scrollbar { width: 6px; }
        .admin-dashboard ::-webkit-scrollbar-track { background: #0a0e1a; }
        .admin-dashboard ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

// ─── Git Connect Form ─────────────────────────────
function GitConnectForm({ onConnect, existingConfig }: { onConnect: (c: GitHubConfig) => void; existingConfig?: GitHubConfig | null }) {
  const [token, setToken] = useState(existingConfig?.token || '');
  const [owner, setOwner] = useState(existingConfig?.owner || '');
  const [repo, setRepo] = useState(existingConfig?.repo || '');
  const [branch, setBranch] = useState(existingConfig?.branch || 'main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const config: GitHubConfig = { token, owner, repo, branch };
      // Test connection by fetching (and auto-creating if missing) data.json
      const { fetchTranslationsJson } = await import('../lib/github');
      await fetchTranslationsJson(config);
      onConnect(config);
    } catch (e: any) {
      setError(e.message || '连接失败，请检查配置');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '480px', padding: '32px', background: '#0f1525', border: '1px solid #1e293b', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff', margin: '0 0 4px 0' }}>连接 GitHub 仓库</h3>
      <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.6 }}>修改内容后将自动提交到 GitHub，Vercel 会自动构建部署。</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>GitHub Token</label>
          <div style={{ position: 'relative' }}>
            <input type={showToken ? 'text' : 'password'} value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" required
              style={{ width: '100%', padding: '10px 40px 10px 12px', background: '#0a0e1a', border: '1px solid #334155', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
            <button type="button" onClick={() => setShowToken(!showToken)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p style={{ fontSize: '10px', color: '#64748b', margin: '4px 0 0 0' }}>在 GitHub Settings → Developer settings → Personal access tokens 中生成，权限勾选 repo</p>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>仓库所有者 (Owner)</label>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="your-username" required
            style={{ width: '100%', padding: '10px 12px', background: '#0a0e1a', border: '1px solid #334155', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>仓库名称 (Repo)</label>
          <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="origin-eva" required
            style={{ width: '100%', padding: '10px 12px', background: '#0a0e1a', border: '1px solid #334155', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>分支 (Branch)</label>
          <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="main" required
            style={{ width: '100%', padding: '10px 12px', background: '#0a0e1a', border: '1px solid #334155', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', fontSize: '11px', color: '#ef4444' }}>
          <AlertCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />{error}
        </div>
      )}

      <button type="submit" disabled={loading}
        style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#4a7fb5', color: '#fff', border: 'none', fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', borderRadius: '4px', opacity: loading ? 0.6 : 1 }}>
        {loading ? '连接中...' : '连接仓库'}
      </button>
    </form>
  );
}

// ─── Images Tab ───────────────────────────────────
function ImagesTab() {
  const images = [
    { id: 'manifesto', label: '主视频封面', src: '/videos/manifesto.mp4', type: 'video' },
    { id: 'observation', label: '案例视频封面', src: '/videos/observation.mp4', type: 'video' },
    { id: 'procurement', label: '服务: 大宗商品采购', src: '/images/facility-procurement.jpg', type: 'image' },
    { id: 'sales', label: '服务: 产品销售服务', src: '/images/facility-sales.jpg', type: 'image' },
    { id: 'consulting', label: '服务: 贸易咨询', src: '/images/facility-consulting.jpg', type: 'image' },
    { id: 'partnership', label: '服务: 战略合作', src: '/images/facility-partnership.jpg', type: 'image' },
    { id: 'archive1', label: '洞察: 中亚铁路物流', src: '/images/archive-railway.jpg', type: 'image' },
    { id: 'archive2', label: '洞察: 能源贸易设施', src: '/images/archive-energy.jpg', type: 'image' },
    { id: 'archive3', label: '洞察: 农产品贸易', src: '/images/archive-agriculture.jpg', type: 'image' },
    { id: 'archive4', label: '洞察: 工业原材料', src: '/images/archive-industry.jpg', type: 'image' },
  ];

  return (
    <div>
      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px' }}>输入新图片URL替换当前资源。修改后需要提交到 GitHub 才能生效。</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {images.map((img) => (
          <div key={img.id} style={{ background: '#0f1525', border: '1px solid #1e293b', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: img.type === 'video' ? '16/9' : '3/4', background: '#06080f', overflow: 'hidden' }}>
              {img.type === 'video' ? (
                <video src={img.src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted loop />
              ) : (
                <img src={img.src} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>{img.label}</div>
              <input type="text" placeholder="输入新URL..."
                style={{ width: '100%', padding: '6px 8px', background: '#0a0e1a', border: '1px solid #334155', color: '#e2e8f0', fontFamily: "'IBM Plex Mono', monospace", fontSize: '10px', borderRadius: '3px', outline: 'none' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}