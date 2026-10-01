export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  logo?: string;
  url?: string;
}

export const certifications: Certification[] = [
  {
    id: 'oci-ds',
    title: 'Certified Data Science Professional',
    issuer: 'Oracle Cloud Infrastructure',
    year: '2025',
    logo: 'oracle',
  },
  {
    id: 'oci-genai',
    title: 'Generative AI Professional',
    issuer: 'Oracle Cloud Infrastructure',
    year: '2025',
    logo: 'oracle',
  },
  {
    id: 'aws-saa',
    title: 'Certified Solutions Architect (Associate)',
    issuer: 'Amazon Web Services',
    logo: 'aws',
  },
  {
    id: 'anthropic-ai-fluency',
    title: 'AI Fluency: Framework & Foundations',
    issuer: 'Anthropic',
    year: '2026',
    logo: 'anthropic',
    url: 'https://verify.skilljar.com/c/3gxnuti7etbh',
  },
];

export const simulations: Certification[] = [
  {
    id: 'jpm',
    title: 'Investment Banking',
    issuer: 'J.P. Morgan',
    logo: 'jpmorgan',
  },
  {
    id: 'deloitte',
    title: 'Data Analytics',
    issuer: 'Deloitte',
    logo: 'deloitte',
  },
];

export interface Achievement {
  id: string;
  title: string;
  detail: string;
  /** Part of the title to render with a glow. */
  highlight?: string;
}

export const achievements: Achievement[] = [
  {
    id: 'open-source',
    title: '250+ open-source contributions this year',
    detail: 'Sustained public work across personal and community repositories.',
  },
  {
    id: 'vtapp-2024',
    title: 'Winner, VTAPP 2024 Fest',
    detail: '1st place in the Inter-College Debate and 3rd in the NULL Coding Hackathon.',
  },
  {
    id: 'paradox',
    title: 'Finalist, IIT Madras Paradox',
    highlight: 'IIT Madras',
    detail: 'Reached the finals of Logic Loom, a national logical reasoning competition.',
  },
  {
    id: 'vtapp-2025',
    title: 'Student Coordinator, VTAPP 2025',
    detail: 'Managed logistics for a technical fest with over 1,000 participants.',
  },
];
