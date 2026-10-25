// Featured cases ("精選案例") — category list and case cards.

export interface CaseCategory {
  number: string; // "01" … "07"
  name: string | null;
  summary?: string;
}

export interface CaseCard {
  categoryNumber: string;
  title: string;
  subtitle?: string;
  description: string;
  tags: string[];
  /** Static page served from /public. Next.js does not auto-serve index.html
   *  for a folder URL, so link to index.html explicitly. */
  link: string;
}

export const caseCategories: CaseCategory[] = [
  {
    number: "01",
    name: "Research Translation & Commercialization",
    summary: "學術成果轉化、研究成果商業化、產學合作",
  },
  {
    number: "02",
    name: "Research Design & Development",
    summary: "研究問題釐清、研究設計、研究計畫落實",
  },
  {
    number: "03",
    name: "Intellectual Property & Technology Transfer",
    summary: "智慧財產權、技術移轉、技術授權",
  },
  {
    number: "04",
    name: "Product Innovation & Development",
    summary: "產品創新、產品開發、概念驗證",
  },
  {
    number: "05",
    name: "Market Discovery & Opportunity Validation",
    summary: "市場探索、需求驗證、競品分析、商業機會評估",
  },
  {
    number: "06",
    name: "Business Model & Go-to-Market",
    summary: "商業模式設計、商業策略、市場進入與推廣",
  },
  {
    number: "07",
    name: "Interdisciplinary Collaboration & Innovation Solutions",
    summary: "跨領域整合、專業協作、跨界創新與整合式解決方案",
  },
];

export const caseCards: CaseCard[] = [
  {
    categoryNumber: "07",
    title: "EARLY EDUCATION THEORY SOLUTION",
    subtitle: "Logic Blueprint Challenge",
    description:
      "A browser game that teaches children aged about 7 how logic works: if/else, TRUE/FALSE, nested if and AND. Detective clues, step-by-step logic trace and spoken explanations. No AI, no login, no data collected.",
    tags: ["Early education", "Logic", "Game-based learning", "No-backend"],
    link: "/cases/early-education-theory-solution/index.html",
  },
  {
    categoryNumber: "07",
    title: "OCEAN AI EXPLORER",
    subtitle: "Teach Bubbles how AI learns",
    description:
      "An offline browser game for children aged 8–10. Kids teach a robot named Bubbles to sort ocean animals and trash from pictures, train it, test it on new pictures, find its mistakes and fix them. Real in-browser neural network, read-aloud voice, no account, no data collected.",
    tags: ["AI literacy", "Machine learning", "Game-based learning", "No-backend"],
    link: "/cases/ocean-ai-explorer/index.html",
  },
  {
    categoryNumber: "07",
    title: "THE ART OF LISTENING",
    subtitle: "Music Lab (prototype)",
    description:
      "An offline music laboratory in the browser. Change the volume and tempo curves, edit a four-line score and compare three versions of Für Elise (synthesized) or your own recordings. Every change rewrites the notes or timing, then plays them. Voice guide in English and Chinese, WAV download, no account, no upload.",
    tags: ["Music", "Listening", "Interactive lab", "No-backend"],
    link: "/cases/art-of-listening-lab/index.html",
  },
  {
    categoryNumber: "07",
    title: "THE ART OF PERFUMERY",
    subtitle: "L'art de la parfumerie · 調香藝術",
    description:
      "An interactive introduction to perfumery: scent vocabulary, olfactive families, accords, a pairing laboratory and real perfumes. English with French terms and Chinese helper text, voice and pronunciation settings, real ingredient photos with credits. Runs in the browser, no account.",
    tags: ["Perfumery", "Interdisciplinary", "Language learning", "No-backend"],
    link: "/cases/perfumery/index.html",
  },
];
