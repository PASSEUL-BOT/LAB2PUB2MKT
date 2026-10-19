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
  { number: "01", name: null },
  { number: "02", name: null },
  { number: "03", name: null },
  { number: "04", name: null },
  { number: "05", name: null },
  { number: "06", name: null },
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
