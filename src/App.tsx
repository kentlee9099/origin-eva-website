import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { siteConfig } from './config';
import { LanguageProvider } from './context/LanguageContext';
import { ConfigProvider } from './context/ConfigContext';
import Hero from './sections/Hero';
import Manifesto from './sections/Manifesto';
import Facilities from './sections/Facilities';
import Observation from './sections/Observation';
import Archives from './sections/Archives';
import Footer from './sections/Footer';
import FacilityDetail from './pages/FacilityDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function Home() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }, [hash]);

  return (
    <>
      <main>
        <Hero />
        <Manifesto />
        <Facilities />
        <Observation />
        <Archives />
      </main>
      <Footer />
    </>
  );
}

function App() {
  useEffect(() => {
    document.title = siteConfig.siteTitle || 'ORIGIN EVA - 大宗贸易服务';
    document.documentElement.lang = siteConfig.language || 'zh-CN';

    let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = siteConfig.siteDescription || '';
  }, []);

  return (
    <LanguageProvider>
      <ConfigProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/facility/:slug" element={<FacilityDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </ConfigProvider>
    </LanguageProvider>
  );
}

export default App;
