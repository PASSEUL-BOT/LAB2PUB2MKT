// Featured cases ("精選案例") — category list and case cards.
// Only category 07 has a name so far; 01–06 are intentionally left blank
// (name: null) until their names are provided.

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
   { number: "01", name: "Research Translation & Commercialization", summary: "學術成果轉化、研究成果商業化、產學合作" },
  { number: "02", name: "Research Design & Development", summary: "研究問題釐清、研究設計、研究計畫落實" },
  { number: "03", name: "Intellectual Property & Technology Transfer", summary: "智慧財產權、技術移轉、技術授權" },
  { number: "04", name: "Product Innovation & Development", summary: "產品創新、產品開發、概念驗證" },
  { number: "05", name: "Market Discovery & Opportunity Validation", summary: "市場探索、需求驗證、競品分析、商業機會評估" },
  { number: "06", name: "Business Model & Go-to-Market", summary: "商業模式設計、商業策略、市場進入與推廣" },
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
];
