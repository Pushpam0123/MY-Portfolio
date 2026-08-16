export interface SkillGroup {
  id: string;
  title: string;

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

export interface TechBall {
  id: string;
  name: string;

  icon?: string;

  label?: string;

  hex?: string;

  group: SkillGroup['id'];

  scale: number;
}

export const techBalls: TechBall[] = [
  { id: 'python', name: 'Python', icon: 'python', group: 'languages', scale: 1.15 },
  { id: 'javascript', name: 'JavaScript', icon: 'javascript', group: 'languages', scale: 1.1 },
  { id: 'java', name: 'Java', icon: 'openjdk', hex: 'E76F00', group: 'languages', scale: 1 },
  { id: 'react', name: 'React.js', icon: 'react', group: 'languages', scale: 1.15 },
  { id: 'node', name: 'Node.js', icon: 'nodedotjs', group: 'languages', scale: 1.05 },
  {
    id: 'express',
    name: 'Express.js',
    icon: 'express',
    hex: '444444',
    group: 'languages',
    scale: 0.9,
  },
  { id: 'mongodb', name: 'MongoDB', icon: 'mongodb', group: 'tools', scale: 1.05 },
  { id: 'postgresql', name: 'PostgreSQL', icon: 'postgresql', group: 'tools', scale: 1 },
  { id: 'pandas', name: 'Pandas', icon: 'pandas', group: 'data', scale: 0.95 },
  { id: 'numpy', name: 'NumPy', icon: 'numpy', group: 'data', scale: 0.95 },
  { id: 'scikitlearn', name: 'scikit-learn', icon: 'scikitlearn', group: 'data', scale: 1.05 },
  { id: 'jupyter', name: 'Jupyter Notebook', icon: 'jupyter', group: 'data', scale: 0.9 },
  { id: 'git', name: 'Git', icon: 'git', group: 'tools', scale: 0.85 },
  { id: 'github', name: 'GitHub', icon: 'github', hex: '181717', group: 'tools', scale: 0.9 },
  { id: 'aws', name: 'AWS', label: 'aws', hex: 'FF9900', group: 'tools', scale: 1.1 },
  { id: 'gcp', name: 'Google Cloud', icon: 'googlecloud', group: 'tools', scale: 1 },
  { id: 'tableau', name: 'Tableau', label: 'Tableau', hex: 'E97627', group: 'data', scale: 0.95 },

  { id: 'typescript', name: 'TypeScript', icon: 'typescript', group: 'languages', scale: 1.1 },
  { id: 'fastapi', name: 'FastAPI', icon: 'fastapi', group: 'languages', scale: 1.05 },
  { id: 'docker', name: 'Docker', icon: 'docker', group: 'tools', scale: 1.05 },
  { id: 'kotlin', name: 'Kotlin', icon: 'kotlin', group: 'languages', scale: 1 },
  { id: 'claude', name: 'Claude', icon: 'claude', group: 'tools', scale: 1.05 },
  { id: 'socketio', name: 'Socket.IO', icon: 'socketdotio', group: 'tools', scale: 0.9 },
  { id: 'onnx', name: 'ONNX Runtime', icon: 'onnx', group: 'data', scale: 0.9 },
  { id: 'sqlite', name: 'SQLite', icon: 'sqlite', group: 'tools', scale: 0.9 },
];

export interface Service {
  id: string;
  index: string;
  title: string;
  description: string;
  bullets: string[];
}

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
