import deskFallback from '@/assets/generated/avatar-desk-1024.webp';

export interface ProjectMetric {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
}

export interface Project {
  id: string;
  index: string;
  title: string;
  year: string;
  summary: string;
  points: string[];
  stack: string[];
  metrics: ProjectMetric[];
  /** TODO(links): replace with the real repo / live URLs once available. */
  repo?: string;
  demo?: string;
  /** Accent used for the panel bloom, so each project reads distinctly. */
  accent: string;
}

/**
 * TODO(links): these point at the profile root as a placeholder. Swap in the
 * actual repository and demo URLs — nothing else needs to change.
 */
const PROFILE_REPOS = 'https://github.com/Pushpam0123';

export const projects: Project[] = [
  {
    id: 'sentiment',
    index: '01',
    title: 'LLM-Powered Sentiment Analysis System',
    year: '2024',
    summary:
      'An AI-powered sentiment analysis system for real-time processing of social media, customer reviews, and market data using large language models and machine learning.',
    points: [
      'Engineered end-to-end NLP pipelines with text preprocessing, tokenization, vectorization, and supervised classifiers.',
      'Reached 94% classification accuracy on the production evaluation set.',
      'Boosted customer satisfaction by 25% through faster, more accurate signal on inbound feedback.',
    ],
    stack: ['Python', 'NLTK', 'scikit-learn', 'LLMs'],
    metrics: [
      { value: 94, suffix: '%', label: 'Accuracy' },
      { value: 25, suffix: '%', prefix: '+', label: 'Customer satisfaction' },
    ],
    repo: PROFILE_REPOS,
    accent: '#7c4dff',
  },
  {
    id: 'automation',
    index: '02',
    title: 'AI-Powered Task Automation System',
    year: '2025',
    summary:
      'A full-stack automation platform with JWT authentication and WebSocket-based real-time updates, streamlining workflows and improving team productivity.',
    points: [
      'Designed RESTful APIs backing a real-time collaborative task surface.',
      'Integrated a machine learning model for automated task prioritization.',
      'Improved productivity tracking and process efficiency by 40%.',
    ],
    stack: ['Python', 'React', 'Node.js', 'Express', 'MongoDB'],
    metrics: [
      { value: 40, suffix: '%', prefix: '+', label: 'Process efficiency' },
      { value: 100, suffix: '%', label: 'Real-time sync coverage' },
    ],
    repo: PROFILE_REPOS,
    accent: '#a855f7',
  },
];

export const projectFallbackImage = deskFallback;
