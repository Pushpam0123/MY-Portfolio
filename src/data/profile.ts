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

  roles: ['AI / ML Engineer', 'Software Engineer', 'Data Engineer', 'Forward Deployed Engineer'],
  tagline: 'I build AI systems and the software around them, and I like working close to the people who use them.',
  location: 'New Delhi, India',
  timezone: 'Asia/Kolkata',
  email: 'pushpamraj0123@gmail.com',
  phone: '+91 6205877234',
  phoneHref: 'tel:+916205877234',
  resumePath: '/resume/Pushpam-Raj-Resume.pdf',
  available: true,
  availabilityLabel: 'Open to opportunities',

  summary:
    'Computer Science graduate focused on AI, machine learning and software engineering. I have built internal AI tooling and backend services, and I like taking data-driven work from prototype to production. I am looking at AI / ML, data, cloud, forward deployed and software engineering roles.',

  about: [
    'I am a Computer Science graduate. My focus is AI and machine learning, and I write a lot of ordinary software around it: APIs, data pipelines and React interfaces.',
    'At Silicofeller Quantum I build internal AI tooling, benchmarking systems and workflow automation. Before that I wrote backend services and APIs at Advitia Labs and helped maintain live systems.',
    'I onboard fast onto existing projects and enjoy working directly with the people who use what I build. That is why I am interested in AI / ML, data, cloud, forward deployed and software engineering roles.',
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

export const stats = [
  { value: 8.22, suffix: '', label: 'CGPA at VIT', decimals: 2 },
  { value: 10, suffix: '+', label: 'Projects shipped', decimals: 0 },
  { value: 6, suffix: '', label: 'Certifications', decimals: 0 },
  { value: 2, suffix: '', label: 'Engineering roles', decimals: 0 },
  { value: 94, suffix: '%', label: 'Best model accuracy', decimals: 0 },
];
