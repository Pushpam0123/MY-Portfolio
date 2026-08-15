export interface Certification {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  /**
   * Filename (without extension) in `src/assets/source/logos/`.
   *
   * The issuer marks are Pushpam's own SVG files rather than an icon package:
   * Oracle, AWS and J.P. Morgan have all been dropped from simple-icons over
   * trademark policy, so there is no accurate path to pull for any of them.
   * Omitting this field is safe — the card falls back to the issuer's name.
   */
  logo?: string;
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
    title: 'Certified Solutions Architect — Associate',
    issuer: 'Amazon Web Services',
    logo: 'aws',
  },
  {
    id: 'jpm',
    title: 'Investment Banking Job Simulation',
    issuer: 'J.P. Morgan',
    logo: 'jpmorgan',
  },
  {
    id: 'deloitte',
    title: 'Data Analytics Job Simulation',
    issuer: 'Deloitte',
    logo: 'deloitte',
  },
];

export interface Achievement {
  id: string;
  title: string;
  detail: string;
}

export const achievements: Achievement[] = [
  {
    id: 'open-source',
    title: '250+ open-source contributions this year',
    detail: 'Sustained public work across personal and community repositories.',
  },
  {
    id: 'basketball',
    title: 'Captain, University Basketball Team',
    detail: 'Led the team to multiple event wins through strategy and teamwork.',
  },
  {
    id: 'vtapp-2024',
    title: 'Winner, VTAPP 2024 Fest',
    detail: '1st place in the Inter-College Debate and 3rd in the NULL Coding Hackathon.',
  },
  {
    id: 'paradox',
    title: 'Finalist, IIT Madras Paradox',
    detail: 'Reached the finals of Logic Loom, a national logical reasoning competition.',
  },
  {
    id: 'vtapp-2025',
    title: 'Student Coordinator, VTAPP 2025',
    detail: 'Managed logistics for a technical fest with over 1,000 participants.',
  },
];
