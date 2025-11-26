export interface ActiveTask {
  id: string;
  title: string;
  subject: string;
  progress: number;
  progressMessage: string;
  startedAt: string;
}

export interface RecentChange {
  id: string;
  action: "created" | "updated" | "deleted" | "completed";
  entityType: "cluster" | "variant" | "answer" | "task";
  description: string;
  timestamp: string;
}

export interface QuickStats {
  subjects: number;
  clusters: number;
  variants: number;
  answers: number;
}

export const mockActiveTasks: ActiveTask[] = [
  {
    id: "task-001",
    title: "Fragen generieren",
    subject: "Mathematik 9 - Algebra",
    progress: 67,
    progressMessage: "Generiere Cluster 7 von 10...",
    startedAt: "2024-11-26T14:28:00Z",
  },
  {
    id: "task-002",
    title: "Varianten erstellen",
    subject: "Deutsch 9 - Grammatik",
    progress: 23,
    progressMessage: "Erstelle Varianten für Cluster 2...",
    startedAt: "2024-11-26T14:32:00Z",
  },
];

export const mockRecentChanges: RecentChange[] = [
  {
    id: "change-001",
    action: "created",
    entityType: "variant",
    description: "45 Varianten erstellt für Quadratische Gleichungen",
    timestamp: "2024-11-26T14:32:00Z",
  },
  {
    id: "change-002",
    action: "completed",
    entityType: "task",
    description: "Task abgeschlossen: Lineare Gleichungen",
    timestamp: "2024-11-26T14:28:00Z",
  },
  {
    id: "change-003",
    action: "updated",
    entityType: "cluster",
    description: "Cluster bearbeitet: Bruchrechnung Basics",
    timestamp: "2024-11-26T14:15:00Z",
  },
  {
    id: "change-004",
    action: "created",
    entityType: "answer",
    description: "120 Antworten generiert für Algebra-Cluster",
    timestamp: "2024-11-26T13:45:00Z",
  },
  {
    id: "change-005",
    action: "deleted",
    entityType: "variant",
    description: "3 duplizierte Varianten entfernt",
    timestamp: "2024-11-26T13:30:00Z",
  },
];

export const mockQuickStats: QuickStats = {
  subjects: 12,
  clusters: 847,
  variants: 3248,
  answers: 12992,
};
