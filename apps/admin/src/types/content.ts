export interface Subject {
  id: string;
  key: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionCluster {
  id: string;
  subjectId: string;
  topic: string;
  canonicalTemplate: string | null;
  difficultyBaseline: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionVariant {
  id: string;
  clusterId: string;
  questionText: string;
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  id: string;
  variantId: string;
  answerText: string;
  isCorrect: boolean;
  distractorType?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContentType = "subject" | "cluster" | "variant" | "answer";

export interface ContentSelection {
  type: ContentType;
  subjectId?: string;
  clusterId?: string;
  variantId?: string;
}
