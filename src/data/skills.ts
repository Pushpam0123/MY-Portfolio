export interface SkillGroup {
  id: string;
  title: string;
  /** Marquee scroll direction — adjacent rails run opposite each other. */
  direction: 'left' | 'right';
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'ai',
    title: 'AI & Automation',
    direction: 'left',
    items: [
      'Machine Learning',
      'Deep Learning',
      'NLP',
      'LLMs',
      'Generative AI',
      'Workflow Automation',
      'Model Prototyping',
      'Benchmarking',
    ],
  },
  {
    id: 'languages',
    title: 'Languages & Frameworks',
    direction: 'right',
    items: ['Python', 'Java', 'JavaScript', 'React.js', 'Express.js', 'Node.js', 'SQL'],
  },
  {
    id: 'data',
    title: 'Data & Libraries',
    direction: 'left',
    items: ['Pandas', 'NumPy', 'scikit-learn', 'NLTK', 'Tableau', 'Jupyter Notebook'],
  },
  {
    id: 'tools',
    title: 'Tools & Platforms',
    direction: 'right',
    items: [
      'Git',
      'GitHub',
      'MongoDB',
      'PostgreSQL',
      'REST API',
      'AWS',
      'GCP',
      'Agile',
    ],
  },
];

export interface Service {
  id: string;
  index: string;
  title: string;
  description: string;
  bullets: string[];
}

/** The three "What I Do" cards, each paired with one avatar expression. */
export const services: Service[] = [
  {
    id: 'ai-ml',
    index: '01',
    title: 'AI & ML Engineering',
    description:
      'End-to-end machine learning work — from framing the problem and prototyping models to shipping evaluated, production-grade pipelines.',
    bullets: ['NLP & LLM pipelines', 'Model prototyping', 'Benchmarking & evaluation'],
  },
  {
    id: 'automation',
    index: '02',
    title: 'Workflow Automation',
    description:
      'AI-native internal tooling that removes the manual steps between an idea and a result, so research and delivery cycles get measurably shorter.',
    bullets: ['Internal AI tooling', 'Process automation', 'Operational efficiency'],
  },
  {
    id: 'fullstack',
    index: '03',
    title: 'Full-Stack Delivery',
    description:
      'Scalable backend services and the interfaces on top of them — REST APIs, real-time sync, authentication, and the maintenance that keeps them stable.',
    bullets: ['REST & WebSocket APIs', 'React interfaces', 'Production support'],
  },
];
