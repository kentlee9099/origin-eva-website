export interface SiteConfig {
  language: string
  siteTitle: string
  siteDescription: string
}

export interface NavigationLink {
  label: string
  href: string
}

export interface NavigationConfig {
  brandName: string
  links: NavigationLink[]
}

export interface HeroConfig {
  eyebrow: string
  titleLines: string[]
  leadText: string
  supportingNotes: string[]
}

export interface ManifestoConfig {
  videoPath: string
  text: string
}

export interface FacilityArticle {
  title: string
  paragraphs: string[]
}

export interface FacilityItem {
  slug: string
  name: string
  code: string
  address: string
  status: string
  email: string
  phone: string
  ctaText: string
  ctaHref: string
  image: string
  utcOffset: number
  article: FacilityArticle
}

export interface FacilitiesConfig {
  sectionLabel: string
  detailBackText: string
  detailNotFoundText: string
  detailReturnText: string
  items: FacilityItem[]
}

export interface ObservationConfig {
  sectionLabel: string
  videoPath: string
  statusText: string
  latLabel: string
  lonLabel: string
  initialLat: number
  initialLon: number
}

export interface ArchiveItem {
  src: string
  label: string
}

export interface ArchivesConfig {
  sectionLabel: string
  vaultTitle: string
  closeText: string
  items: ArchiveItem[]
}

export interface FooterConfig {
  copyrightText: string
  statusText: string
}

export const siteConfig: SiteConfig = {
  language: "zh-CN",
  siteTitle: "起源 - ORIGIN EVA | 大宗贸易服务",
  siteDescription: "起源（Origin EVA）是一家专注于国际贸易的服务公司，致力于为中国与中亚及俄罗斯地区的企业搭建高效、可靠的贸易桥梁。",
}

export const navigationConfig: NavigationConfig = {
  brandName: "ORIGIN",
  links: [
    { label: "服务", href: "#facilities" },
    { label: "案例", href: "#observation" },
    { label: "洞察", href: "#archives" },
    { label: "联系", href: "#footer" },
  ],
}

export const heroConfig: HeroConfig = {
  eyebrow: "ORIGIN EVA — 大宗贸易服务平台",
  titleLines: ["连接市场", "创造未来"],
  leadText: "您在中亚及俄罗斯地区值得信赖的贸易伙伴，专注大宗商品采购与中国产品出口服务。",
  supportingNotes: [
    "10+ 年国际贸易经验",
    "500+ 全球合作伙伴",
    "50+ 覆盖服务国家",
  ],
}

export const manifestoConfig: ManifestoConfig = {
  videoPath: "/videos/manifesto.mp4",
  text: "起源（Origin EVA）是一家专注于国际贸易的服务公司，致力于为中国与中亚及俄罗斯地区的企业搭建高效、可靠的贸易桥梁。我们拥有丰富的行业经验和广泛的商业网络，为客户提供专业的大宗商品采购服务以及中国各类产品的出口销售服务。我们的团队由资深贸易专家组成，深入了解中亚及俄罗斯市场的特点与需求，能够为客户提供量身定制的贸易解决方案，帮助客户在复杂的国际贸易环境中把握机遇、实现增长。",
}

export const facilitiesConfig: FacilitiesConfig = {
  sectionLabel: "我们的服务",
  detailBackText: "返回服务列表",
  detailNotFoundText: "服务不存在",
  detailReturnText: "返回首页",
  items: [
    {
      slug: "procurement",
      name: "大宗商品采购",
      code: "PROCUREMENT",
      address: "原材料 · 能源 · 农产品",
      status: "为客户提供优质的大宗商品采购渠道与供应链解决方案",
      email: "procurement@origineva.com",
      phone: "+86 10 xxxx xxxx",
      ctaText: "了解详情",
      ctaHref: "#procurement",
      image: "/images/facility-procurement.jpg",
      utcOffset: 8,
      article: {
        title: "大宗商品采购服务",
        paragraphs: [
          "我们为客户提供优质的大宗商品采购服务，包括原材料、能源、农产品等各类商品。凭借多年积累的行业资源和供应链管理经验，我们能够帮助客户以最优的价格采购到最优质的产品。",
          "我们的采购服务涵盖原材料采购、能源产品采购、农产品采购以及供应链优化等全方位解决方案。无论是钢铁、有色金属、化工原料，还是石油、天然气、煤炭等能源产品，我们都能为客户提供专业的采购支持。",
          "我们与中亚及俄罗斯地区的众多优质供应商建立了长期稳定的合作关系，能够确保产品质量和供应稳定性。同时，我们的专业团队会全程跟进采购流程，从供应商筛选、价格谈判到物流运输、质量检验，为客户提供一站式服务。",
        ],
      },
    },
    {
      slug: "sales",
      name: "产品销售服务",
      code: "SALES",
      address: "市场开拓 · 渠道建设",
      status: "帮助中国企业将优质产品销往中亚及俄罗斯市场",
      email: "sales@origineva.com",
      phone: "+86 10 xxxx xxxx",
      ctaText: "了解详情",
      ctaHref: "#sales",
      image: "/images/facility-sales.jpg",
      utcOffset: 3,
      article: {
        title: "产品销售服务",
        paragraphs: [
          "我们帮助中国企业将优质产品销往中亚及俄罗斯市场，提供全方位的销售支持服务。凭借对当地市场的深入了解和丰富的商业资源，我们能够帮助企业快速开拓海外市场。",
          "我们的销售服务包括市场开拓、渠道建设、品牌推广和售后服务等。我们会根据客户的产品特点和目标市场，制定个性化的销售策略，帮助企业在竞争激烈的市场中脱颖而出。",
          "我们拥有广泛的经销商网络和终端客户资源，能够帮助企业快速建立销售渠道。同时，我们的本地化团队会提供市场推广和品牌建设支持，提升产品在目标市场的知名度和美誉度。",
        ],
      },
    },
    {
      slug: "consulting",
      name: "贸易咨询",
      code: "CONSULTING",
      address: "市场调研 · 政策解读",
      status: "提供专业的国际贸易咨询服务",
      email: "consulting@origineva.com",
      phone: "+86 10 xxxx xxxx",
      ctaText: "了解详情",
      ctaHref: "#consulting",
      image: "/images/facility-consulting.jpg",
      utcOffset: 6,
      article: {
        title: "贸易咨询服务",
        paragraphs: [
          "我们提供专业的国际贸易咨询服务，帮助客户了解市场动态与政策法规。我们的咨询团队由资深行业专家组成，能够为客户提供深入的市场分析和战略建议。",
          "我们的咨询服务涵盖市场调研、政策解读、风险评估和战略规划等领域。无论是进入新市场的可行性研究，还是现有业务的优化升级，我们都能为客户提供有价值的洞察和建议。",
          "我们定期发布市场研究报告和行业分析，帮助客户及时掌握市场动态和趋势。同时，我们还会针对客户的具体需求，提供定制化的咨询解决方案，助力客户做出明智的商业决策。",
        ],
      },
    },
    {
      slug: "partnership",
      name: "战略合作",
      code: "PARTNERSHIP",
      address: "商务对接 · 资源共享",
      status: "与优质企业建立长期战略合作关系",
      email: "partnership@origineva.com",
      phone: "+86 10 xxxx xxxx",
      ctaText: "了解详情",
      ctaHref: "#partnership",
      image: "/images/facility-partnership.jpg",
      utcOffset: 5,
      article: {
        title: "战略合作服务",
        paragraphs: [
          "我们与优质企业建立长期战略合作关系，共同开拓国际市场。通过资源共享和优势互补，我们能够为合作伙伴创造更大的商业价值。",
          "我们的战略合作服务包括商务对接、合作协议、资源共享和长期支持等。我们会根据合作伙伴的需求和目标，制定个性化的合作方案，确保双方利益最大化。",
          "我们欢迎有志于拓展中亚及俄罗斯市场的企业与我们建立战略合作关系。无论是产品供应、渠道共享还是联合开发，我们都愿意与合作伙伴携手共进，共创美好未来。",
        ],
      },
    },
  ],
}

export const observationConfig: ObservationConfig = {
  sectionLabel: "成功案例",
  videoPath: "/videos/observation.mp4",
  statusText: "实时监控",
  latLabel: "LAT",
  lonLabel: "LON",
  initialLat: 39.9042,
  initialLon: 116.4074,
}

export const archivesConfig: ArchivesConfig = {
  sectionLabel: "贸易洞察",
  vaultTitle: "查看全部洞察",
  closeText: "关闭",
  items: [
    {
      src: "/images/archive-railway.jpg",
      label: "中亚铁路物流通道",
    },
    {
      src: "/images/archive-energy.jpg",
      label: "能源贸易基础设施",
    },
    {
      src: "/images/archive-agriculture.jpg",
      label: "农产品贸易市场",
    },
    {
      src: "/images/archive-industry.jpg",
      label: "工业原材料采购",
    },
  ],
}

export const footerConfig: FooterConfig = {
  copyrightText: "© 2026 Origin EVA. All rights reserved.",
  statusText: "大宗贸易服务 · 中亚及俄罗斯市场专家",
}
