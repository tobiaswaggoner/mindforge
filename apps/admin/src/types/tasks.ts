export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export type TaskType =
  | "generate_clusters"
  | "generate_variants"
  | "regenerate_answers";

export interface GenerationTask {
  id: string;
  taskType: TaskType;
  status: TaskStatus;
  payload: {
    subjectId?: string;
    clusterId?: string;
    variantId?: string;
    count?: number;
    variantsPerCluster?: number;
    answersPerVariant?: number;
  };
  userContext: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  delayedUntil: string | null;
  progressCurrent: number;
  progressTotal: number;
  progressMessage: string | null;
  errorMessage: string | null;
  retryCount: number;
  maxRetries: number;
  acceptedAt: string | null;
  revertedAt: string | null;
}

export interface TaskContentLog {
  id: string;
  taskId: string;
  entityType: "cluster" | "variant" | "answer";
  entityId: string;
  action: "created" | "updated" | "deleted";
  previousData: string | null;
  createdAt: string;
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  generate_clusters: "Fragen generieren",
  generate_variants: "Varianten erstellen",
  regenerate_answers: "Antworten neu generieren",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Wartend",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  failed: "Fehlgeschlagen",
  cancelled: "Abgebrochen",
};
