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
  /**
   * The system's stages, in order, for the schematic on the panel plate.
   *
   * Decorative and marked aria-hidden — every claim it makes is already stated
   * in `points` as real text. It exists because the plate was otherwise an empty
   * rectangle taking up half the section, and a diagram of what the thing
   * actually does beats a placeholder. Each stage must be traceable to the
   * project's own README; this is not the place to invent architecture.
   */
  pipeline: string[];
  /**
   * Omitted where the project has no outcome numbers worth standing behind.
   * Inventing a metric to fill the slot is worse than leaving it empty.
   */
  metrics?: ProjectMetric[];
  /** Shown as a badge. Use only where the repository says so itself. */
  status?: string;
  repo?: string;
  demo?: string;
  /** Accent used for the panel bloom, so each project reads distinctly. */
  accent: string;
}

const GH = 'https://github.com/Pushpam0123';

/**
 * The four projects, newest first.
 *
 * Copy is written against each repository's own README rather than invented,
 * and every card links to the real repository. Metrics are the one place the
 * two sources can disagree: where the résumé states an outcome, the résumé's
 * number is used (Pushpam's call); where it says nothing, the README's measured
 * figures are used, because they are the only ones anybody can verify.
 */
export const projects: Project[] = [
  {
    id: 'scamshield',
    index: '01',
    title: 'ScamShield',
    year: '2026',
    summary:
      'An Android app that tells you whether a suspicious SMS is a scam — on-device, offline, and in plain language you could read aloud to a parent.',
    points: [
      'Runs entirely on the phone: no READ_SMS permission, no accounts, and no network calls, because the messages people most want checked are the ones carrying their OTPs and account numbers.',
      'Hybrid detection — deterministic rule checks for domain age, typosquats, homographs and sender IDs run alongside an on-device ONNX classifier, and a fusion layer combines them into one verdict with its evidence.',
      'An instrumented parity test confirms the on-device output matches the Python reference exactly, so the tokenizer and runtime agree across platforms.',
    ],
    stack: ['Kotlin', 'Android', 'ONNX Runtime', 'Python'],
    pipeline: [
      'Suspicious SMS pasted in',
      'Rule checks: domain, typosquat, sender ID',
      'On-device classifier',
      'Fusion layer',
      'Verdict with reasons',
    ],
    // No metrics on purpose. The README is explicit that the bundled model is a
    // stand-in and its accuracy numbers do not mean anything yet — quoting them
    // would be the one dishonest thing on this page.
    status: 'Work in progress',
    repo: `${GH}/ScamShield`,
    accent: '#22d3ee',
  },
  {
    id: 'sahayak',
    index: '02',
    title: 'Sahayak — Government Scheme RAG',
    year: '2026',
    summary:
      'A cited retrieval-augmented assistant and eligibility engine for Indian government schemes, answering in Hindi or English with every claim traced back to the official document it came from.',
    points: [
      'Hybrid retrieval pairs dense vector search (pgvector HNSW) with Postgres full-text search, combined through Reciprocal Rank Fusion.',
      'A second-pass evaluator audits the generated answer against its sources and flags any sentence the context does not support, rather than trusting the model.',
      'Structured eligibility matching against age, state, gender, caste, income and landholding rules, plus per-request cost accounting and a sliding-window rate limiter.',
    ],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Claude'],
    pipeline: [
      'Hindi or English query',
      'Hybrid retrieval: vector + full-text',
      'Reciprocal rank fusion',
      'Grounded answer with citations',
      'Groundedness audit',
    ],
    // From the repository's own EVALS benchmark table.
    metrics: [
      { value: 94, suffix: '%', label: 'Hybrid Recall@5' },
      { value: 89, suffix: 'ms', label: 'Avg query latency' },
    ],
    repo: `${GH}/Sahayak-Govt-Scheme`,
    accent: '#a855f7',
  },
  {
    id: 'sentiment',
    index: '03',
    title: 'LLM-Powered Sentiment Analysis System',
    year: '2026',
    summary:
      'Sentiment analysis that does not send every text to an LLM. A cheap classifier handles the easy majority and only the genuinely hard cases — sarcasm, mixed feeling, non-English — are escalated.',
    points: [
      'Two-tier cascade: a calibrated TF-IDF and linear SVM classifier answers first, and its confidence decides what gets escalated to the LLM.',
      'The LLM never returns freeform text — tool use is forced against a JSON schema, and an aspect quote is dropped unless it appears verbatim in the input.',
      'If the provider is down or rate-limited, escalated requests fall back to the classifier rather than erroring, and those degraded answers are deliberately never cached.',
    ],
    stack: ['Python', 'FastAPI', 'scikit-learn', 'NLTK', 'Claude'],
    pipeline: [
      'Text in',
      'Preprocess & cache check',
      'Tier A: calibrated SVM',
      'Router: escalate if unsure',
      'Tier B: LLM, forced JSON',
    ],
    metrics: [
      { value: 94, suffix: '%', label: 'Accuracy' },
      { value: 25, suffix: '%', prefix: '+', label: 'Customer satisfaction' },
    ],
    repo: `${GH}/Sentiment-Scope`,
    accent: '#7c4dff',
  },
  {
    id: 'taskflow',
    index: '04',
    title: 'AI-Powered Task Automation System',
    year: '2026',
    summary:
      'TaskFlow AI — a real-time task platform with role-based access and an automated priority engine that explains every score it produces.',
    points: [
      'A deterministic priority engine scores tasks 0–100 from overdue days, effort points, how many others a task is blocking, and stagnation — no LLM in the loop, so scoring is instant and auditable.',
      'Every score opens into a breakdown table showing exactly how it was computed.',
      'Real-time state sync across sessions over Socket.IO, with refresh-token rotation and reuse detection behind HTTP-only cookies.',
    ],
    stack: ['TypeScript', 'React', 'Node.js', 'Express', 'Socket.IO'],
    pipeline: [
      'React client',
      'JWT auth + token rotation',
      'REST API',
      'Priority engine',
      'Socket.IO real-time sync',
    ],
    metrics: [
      { value: 40, suffix: '%', prefix: '+', label: 'Process efficiency' },
      { value: 100, suffix: '%', label: 'Real-time sync coverage' },
    ],
    repo: `${GH}/TaskFlow-AI`,
    accent: '#f59e0b',
  },
];

export const projectFallbackImage = deskFallback;
