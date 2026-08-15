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
      'RAG Systems',
      'Workflow Automation',
      'Model Prototyping',
      'Benchmarking',
    ],
  },
  {
    id: 'languages',
    title: 'Languages & Frameworks',
    direction: 'right',
    items: [
      'Python',
      'Java',
      'JavaScript',
      'TypeScript',
      'Kotlin',
      'React.js',
      'Express.js',
      'Node.js',
      'FastAPI',
      'SQL',
    ],
  },
  {
    id: 'data',
    title: 'Data & Libraries',
    direction: 'left',
    items: [
      'Pandas',
      'NumPy',
      'scikit-learn',
      'NLTK',
      'ONNX Runtime',
      'Tableau',
      'Jupyter Notebook',
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Platforms',
    direction: 'right',
    items: [
      'Git',
      'GitHub',
      'Docker',
      'MongoDB',
      'PostgreSQL',
      'SQLite',
      'REST API',
      'Socket.IO',
      'AWS',
      'GCP',
      'Agile',
    ],
  },
];

/**
 * The physics spheres in the Tech Stack section.
 *
 * Every entry is a technology Pushpam demonstrably uses: either it appears on
 * the résumé, or it is the stack of one of the four public repositories linked
 * from the Work section (Kotlin and ONNX from ScamShield, FastAPI and Docker
 * from Sahayak, Claude from both RAG projects, TypeScript and Socket.IO from
 * TaskFlow AI). A repository anyone can open is stronger evidence than a CV
 * line, but the bar is the same either way — **nothing goes on a ball that is
 * not backed by one of those two sources.** The point of the section is to be
 * scannable and true, not to pad the list.
 *
 * `icon` is a simple-icons slug. Two entries have no icon: Amazon Web Services
 * and Tableau were removed from simple-icons over trademark policy, so they
 * render as wordmarks via `label` instead.
 */
export interface TechBall {
  /** Stable id — also the generated texture filename. */
  id: string;
  name: string;
  /** simple-icons slug, when one exists. */
  icon?: string;
  /** Wordmark text used when there is no icon. */
  label?: string;
  /** Override the brand colour (hex without '#'). */
  hex?: string;
  /** Relative sphere size; a little variety reads better than a uniform grid. */
  scale: number;
}

export const techBalls: TechBall[] = [
  { id: 'python', name: 'Python', icon: 'python', scale: 1.15 },
  { id: 'javascript', name: 'JavaScript', icon: 'javascript', scale: 1.1 },
  { id: 'java', name: 'Java', icon: 'openjdk', hex: 'E76F00', scale: 1 },
  { id: 'react', name: 'React.js', icon: 'react', scale: 1.15 },
  { id: 'node', name: 'Node.js', icon: 'nodedotjs', scale: 1.05 },
  { id: 'express', name: 'Express.js', icon: 'express', hex: '444444', scale: 0.9 },
  { id: 'mongodb', name: 'MongoDB', icon: 'mongodb', scale: 1.05 },
  { id: 'postgresql', name: 'PostgreSQL', icon: 'postgresql', scale: 1 },
  { id: 'pandas', name: 'Pandas', icon: 'pandas', scale: 0.95 },
  { id: 'numpy', name: 'NumPy', icon: 'numpy', scale: 0.95 },
  { id: 'scikitlearn', name: 'scikit-learn', icon: 'scikitlearn', scale: 1.05 },
  { id: 'jupyter', name: 'Jupyter Notebook', icon: 'jupyter', scale: 0.9 },
  { id: 'git', name: 'Git', icon: 'git', scale: 0.85 },
  { id: 'github', name: 'GitHub', icon: 'github', hex: '181717', scale: 0.9 },
  { id: 'aws', name: 'AWS', label: 'aws', hex: 'FF9900', scale: 1.1 },
  { id: 'gcp', name: 'Google Cloud', icon: 'googlecloud', scale: 1 },
  { id: 'tableau', name: 'Tableau', label: 'Tableau', hex: 'E97627', scale: 0.95 },
  // Evidenced by the four linked repositories rather than the résumé.
  { id: 'typescript', name: 'TypeScript', icon: 'typescript', scale: 1.1 },
  { id: 'fastapi', name: 'FastAPI', icon: 'fastapi', scale: 1.05 },
  { id: 'docker', name: 'Docker', icon: 'docker', scale: 1.05 },
  { id: 'kotlin', name: 'Kotlin', icon: 'kotlin', scale: 1 },
  { id: 'claude', name: 'Claude', icon: 'claude', scale: 1.05 },
  { id: 'socketio', name: 'Socket.IO', icon: 'socketdotio', scale: 0.9 },
  { id: 'onnx', name: 'ONNX Runtime', icon: 'onnx', scale: 0.9 },
  { id: 'sqlite', name: 'SQLite', icon: 'sqlite', scale: 0.9 },
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
