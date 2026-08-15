/**
 * Career timeline. Work history first, then education — rendered as one
 * continuous pinned rail in the Career section.
 */

export type TimelineKind = 'work' | 'education';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  org: string;
  title: string;
  location: string;
  period: string;
  /** Drives the "current role" pulse indicator. */
  current?: boolean;
  points: string[];
  meta?: string;
}

export const timeline: TimelineEntry[] = [
  {
    id: 'silicofeller',
    kind: 'work',
    org: 'Silicofeller Quantum',
    title: 'AI Lead Engineer Intern',
    location: 'New Delhi, India',
    period: 'Jun 2026 — Present',
    current: true,
    points: [
      'Identified, proposed, and implemented AI-native research workflows and automation opportunities to improve operational efficiency, productivity, and R&D process effectiveness, reporting directly to the Founder & CEO.',
      'Architected internal AI tooling, benchmarking systems, and workflow automation that accelerated execution and continuous improvement across the Quantum Core platform.',
      'Drove model prototyping and cross-functional technical deliverables, analyzing emerging AI technologies to enhance process effectiveness in a fast-paced startup environment.',
    ],
  },
  {
    id: 'advitia',
    kind: 'work',
    org: 'Advitia Labs',
    title: 'Software Development Engineer',
    location: 'Guntur, India',
    period: 'Dec 2025 — May 2026',
    points: [
      'Developed and maintained scalable backend services and APIs, optimizing system workflows to improve operational efficiency and product stability.',
      'Investigated production issues and collaborated with cross-functional teams on ongoing maintenance, enhancement, and continuous improvement of live systems, documentation, and UI/UX.',
    ],
  },
  {
    id: 'vit',
    kind: 'education',
    org: 'Vellore Institute of Technology',
    title: 'B.Tech, Computer Science and Engineering',
    location: 'Amaravati, India',
    period: '2022 — 2026',
    meta: 'CGPA 8.22',
    points: [
      'Specialized coursework across artificial intelligence, machine learning, and data engineering.',
    ],
  },
];
