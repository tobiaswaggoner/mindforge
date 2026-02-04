import type {
  Subject,
  QuestionCluster,
  QuestionVariant,
  Answer,
  CreateSubject,
  UpdateSubject,
  CreateQuestionCluster,
  UpdateQuestionCluster,
  CreateQuestionVariant,
  UpdateQuestionVariant,
  CreateAnswer,
  UpdateAnswer,
  FullQuestion,
} from "@mindforge/shared-types";

/**
 * Content Repository Interface
 *
 * Abstract interface for content data access (subjects, clusters, variants, answers).
 */
export interface ContentRepository {
  // Subjects
  getAllSubjects(): Promise<Subject[]>;
  getSubjectById(id: string): Promise<Subject | null>;
  getSubjectByKey(key: string): Promise<Subject | null>;
  createSubject(data: CreateSubject): Promise<Subject>;
  updateSubject(id: string, data: UpdateSubject): Promise<Subject | null>;
  deleteSubject(id: string): Promise<boolean>;

  // Clusters
  getClustersBySubject(subjectId: string): Promise<QuestionCluster[]>;
  getClusterById(id: string): Promise<QuestionCluster | null>;
  createCluster(data: CreateQuestionCluster): Promise<QuestionCluster>;
  updateCluster(id: string, data: UpdateQuestionCluster): Promise<QuestionCluster | null>;
  deleteCluster(id: string): Promise<boolean>;

  // Variants
  getVariantsByCluster(clusterId: string): Promise<QuestionVariant[]>;
  getVariantById(id: string): Promise<QuestionVariant | null>;
  getRandomVariantForCluster(clusterId: string): Promise<QuestionVariant | null>;
  createVariant(data: CreateQuestionVariant): Promise<QuestionVariant>;
  updateVariant(id: string, data: UpdateQuestionVariant): Promise<QuestionVariant | null>;
  deleteVariant(id: string): Promise<boolean>;

  // Answers
  getAnswersByVariant(variantId: string): Promise<Answer[]>;
  getAnswerById(id: string): Promise<Answer | null>;
  createAnswer(data: CreateAnswer): Promise<Answer>;
  createAnswersBulk(answers: CreateAnswer[]): Promise<Answer[]>;
  updateAnswer(id: string, data: UpdateAnswer): Promise<Answer | null>;
  deleteAnswer(id: string): Promise<boolean>;

  // Convenience methods
  getFullQuestion(variantId: string): Promise<FullQuestion | null>;
  getRandomQuestionForSubject(subjectKey: string): Promise<FullQuestion | null>;
}
