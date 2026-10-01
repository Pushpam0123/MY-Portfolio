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
  detail?: string;
  /** Placing shown as a medal, e.g. '1st'. */
  place?: string;
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
    id: 'null-hackathon',
    title: 'Winner, NULL Hackathon 2025',
    place: '1st',
  },
  {
    id: 'paradox',
    title: 'Finalist, IIT Madras Paradox',
    highlight: 'IIT Madras',
    detail: 'Reached the finals of Logic Loom, a national logical reasoning competition.',
  },
];
