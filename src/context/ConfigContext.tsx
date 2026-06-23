import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  siteConfig as defaultSiteConfig,
  heroConfig as defaultHeroConfig,
  manifestoConfig as defaultManifestoConfig,
  facilitiesConfig as defaultFacilitiesConfig,
  observationConfig as defaultObservationConfig,
  archivesConfig as defaultArchivesConfig,
  footerConfig as defaultFooterConfig,
  navigationConfig as defaultNavConfig,
} from '../config';
import type {
  SiteConfig,
  HeroConfig,
  ManifestoConfig,
  FacilitiesConfig,
  ObservationConfig,
  ArchivesConfig,
  FooterConfig,
  NavigationConfig,
} from '../config';

interface FullConfig {
  site: SiteConfig;
  hero: HeroConfig;
  manifesto: ManifestoConfig;
  facilities: FacilitiesConfig;
  observation: ObservationConfig;
  archives: ArchivesConfig;
  footer: FooterConfig;
  navigation: NavigationConfig;
}

interface ConfigContextValue {
  config: FullConfig;
  refresh: () => void;
}

const STORAGE_KEYS = [
  'origin_admin_content',
  'origin_languages',
  'origin_language',
  'origin_admin_images',
];

const ConfigContext = createContext<ConfigContextValue | null>(null);

function loadStoredConfig(): Partial<Record<string, string>> {
  const stored: Partial<Record<string, string>> = {};
  for (const key of STORAGE_KEYS) {
    const val = localStorage.getItem(key);
    if (val) stored[key] = val;
  }
  return stored;
}

function applyContentOverrides(config: FullConfig, stored: Record<string, string>): FullConfig {
  const content = stored['origin_admin_content'];
  if (!content) return config;

  try {
    const fields = JSON.parse(content) as Array<{ id: string; value: string }>;
    const getVal = (id: string): string | undefined =>
      fields.find((f) => f.id === id)?.value;

    const newConfig = { ...config };

    const siteTitle = getVal('siteTitle');
    const siteDesc = getVal('siteDescription');
    if (siteTitle || siteDesc) {
      newConfig.site = {
        ...config.site,
        ...(siteTitle && { siteTitle }),
        ...(siteDesc && { siteDescription: siteDesc }),
      };
    }

    const eyebrow = getVal('heroEyebrow');
    const title = getVal('heroTitle');
    const lead = getVal('heroLead');
    const notes = getVal('heroNotes');
    if (eyebrow || title || lead || notes) {
      newConfig.hero = {
        ...config.hero,
        ...(eyebrow && { eyebrow }),
        ...(title && { titleLines: title.split(',').map((s) => s.trim()) }),
        ...(lead && { leadText: lead }),
        ...(notes && { supportingNotes: notes.split(',').map((s) => s.trim()) }),
      };
    }

    const manifestoText = getVal('manifestoText');
    if (manifestoText) {
      newConfig.manifesto = { ...config.manifesto, text: manifestoText };
    }

    const facLabel = getVal('facilitiesLabel');
    if (facLabel) {
      newConfig.facilities = { ...config.facilities, sectionLabel: facLabel };
    }

    const obsLabel = getVal('observationLabel');
    const obsStatus = getVal('observationStatus');
    if (obsLabel || obsStatus) {
      newConfig.observation = {
        ...config.observation,
        ...(obsLabel && { sectionLabel: obsLabel }),
        ...(obsStatus && { statusText: obsStatus }),
      };
    }

    const archLabel = getVal('archivesLabel');
    const archVault = getVal('archivesVault');
    if (archLabel || archVault) {
      newConfig.archives = {
        ...config.archives,
        ...(archLabel && { sectionLabel: archLabel }),
        ...(archVault && { vaultTitle: archVault }),
      };
    }

    const footerCopy = getVal('footerCopyright');
    const footerStat = getVal('footerStatus');
    if (footerCopy || footerStat) {
      newConfig.footer = {
        ...config.footer,
        ...(footerCopy && { copyrightText: footerCopy }),
        ...(footerStat && { statusText: footerStat }),
      };
    }

    return newConfig;
  } catch {
    return config;
  }
}

function buildDefaultConfig(): FullConfig {
  return {
    site: { ...defaultSiteConfig },
    hero: { ...defaultHeroConfig, supportingNotes: [...defaultHeroConfig.supportingNotes] },
    manifesto: { ...defaultManifestoConfig },
    facilities: {
      ...defaultFacilitiesConfig,
      items: defaultFacilitiesConfig.items.map((item) => ({ ...item, article: { ...item.article, paragraphs: [...item.article.paragraphs] } })),
    },
    observation: { ...defaultObservationConfig },
    archives: { ...defaultArchivesConfig, items: defaultArchivesConfig.items.map((item) => ({ ...item })) },
    footer: { ...defaultFooterConfig },
    navigation: { ...defaultNavConfig, links: defaultNavConfig.links.map((l) => ({ ...l })) },
  };
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<FullConfig>(buildDefaultConfig);

  const refresh = useCallback(() => {
    const stored = loadStoredConfig();
    setConfig(applyContentOverrides(buildDefaultConfig(), stored as Record<string, string>));
  }, []);

  useEffect(() => {
    refresh();

    // Listen for storage changes from other tabs
    const handler = (e: StorageEvent) => {
      if (STORAGE_KEYS.includes(e.key || '')) {
        refresh();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [refresh]);

  return (
    <ConfigContext.Provider value={{ config, refresh }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig(): FullConfig {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx.config;
}

export function useConfigRefresh(): () => void {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfigRefresh must be used within ConfigProvider');
  return ctx.refresh;
}
