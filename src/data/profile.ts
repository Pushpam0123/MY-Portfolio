/**
 * Identity and contact details. Everything here comes from the resume PDF in
 * src/assets/source — treat that as the source of truth when updating.
 */

export interface SocialLink {
  label: string;
  short: string;
  href: string;
}

export const profile = {
  name: 'Pushpam Raj',
  firstName: 'Pushpam',
  lastName: 'Raj',
  role: 'AI / ML Engineer',
  /** Cycled one at a time under the hero headline. */
  roles: [
    'AI / ML Engineer',
    'Automation Systems',
    'LLM Tooling',
    'Full-Stack Delivery',
  ],
  tagline: 'I build AI-native tooling and automation systems that make teams measurably faster.',
  location: 'New Delhi, India',
  timezone: 'Asia/Kolkata',
  email: 'pushpamraj0123@gmail.com',
  phone: '+91 6205877234',
  phoneHref: 'tel:+916205877234',
  resumePath: '/resume/Pushpam-Raj-Resume.pdf',
  available: true,
  availabilityLabel: 'Open to opportunities',

  summary:
    'Computer Science graduate specializing in Artificial Intelligence, Machine Learning, and workflow automation, with hands-on experience building AI-native tooling and automation systems that improve operational efficiency and productivity. Skilled at rapidly onboarding to existing AI and automation projects and delivering data-driven solutions from prototype to production, with a focus on process improvement and continuous enhancement.',

  /** Short paragraphs for the About section — the summary above, broken for pacing. */
  about: [
    'I am a Computer Science graduate specializing in Artificial Intelligence, Machine Learning, and workflow automation.',
    'My work is building AI-native tooling and automation systems that improve operational efficiency and productivity — the internal tools, benchmarking harnesses, and pipelines that let a team move faster than it otherwise could.',
    'I onboard quickly onto existing AI and automation projects and take data-driven solutions from prototype to production, with a bias toward process improvement and continuous enhancement.',
  ],
} as const;

export const socials: SocialLink[] = [
  { label: 'GitHub', short: 'GH', href: 'https://github.com/Pushpam0123' },
  {
    label: 'LinkedIn',
    short: 'IN',
    href: 'https://www.linkedin.com/in/pushpam-raj-9b568a267',
  },
  { label: 'Email', short: 'EM', href: `mailto:${profile.email}` },
];

/** Headline figures for the About section counters. */
export const stats = [
  { value: 8.22, suffix: '', label: 'CGPA at VIT', decimals: 2 },
  { value: 4, suffix: '', label: 'Certifications', decimals: 0 },
  { value: 2, suffix: '', label: 'Engineering roles', decimals: 0 },
  { value: 94, suffix: '%', label: 'Best model accuracy', decimals: 0 },
];
