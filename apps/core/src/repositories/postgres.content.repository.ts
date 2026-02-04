import type postgres from "postgres";
import { generateUuid, now } from "@mindforge/shared-utils";
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
import type { ContentRepository } from "./content.repository.js";
import type {
  SubjectRow,
  QuestionClusterRow,
  QuestionVariantRow,
  AnswerRow,
} from "../db/database.js";

// Row to entity converters
function rowToSubject(row: SubjectRow): Subject {
  return {
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function rowToCluster(row: QuestionClusterRow): QuestionCluster {
  return {
    id: row.id,
    subjectId: row.subject_id,
    topic: row.topic,
    canonicalTemplate: row.canonical_template,
    difficultyBaseline: row.difficulty_baseline,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function rowToVariant(row: QuestionVariantRow): QuestionVariant {
  return {
    id: row.id,
    clusterId: row.cluster_id,
    questionText: row.question_text,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function rowToAnswer(row: AnswerRow): Answer {
  return {
    id: row.id,
    variantId: row.variant_id,
    answerText: row.answer_text,
    isCorrect: row.is_correct,
    distractorType: row.distractor_type,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export class PostgresContentRepository implements ContentRepository {
  constructor(private sql: postgres.Sql) {}

  // =========================================================================
  // Subjects
  // =========================================================================

  async getAllSubjects(): Promise<Subject[]> {
    const rows = await this.sql<SubjectRow[]>`SELECT * FROM subjects ORDER BY name`;
    return rows.map(rowToSubject);
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const rows = await this.sql<SubjectRow[]>`SELECT * FROM subjects WHERE id = ${id}`;
    const row = rows[0];
    return row ? rowToSubject(row) : null;
  }

  async getSubjectByKey(key: string): Promise<Subject | null> {
    const rows = await this.sql<SubjectRow[]>`SELECT * FROM subjects WHERE key = ${key}`;
    const row = rows[0];
    return row ? rowToSubject(row) : null;
  }

  async createSubject(data: CreateSubject): Promise<Subject> {
    const id = generateUuid();
    const timestamp = now();
    await this.sql`
      INSERT INTO subjects (id, key, name, description, created_at, updated_at)
      VALUES (${id}, ${data.key}, ${data.name}, ${data.description ?? null}, ${timestamp}, ${timestamp})
    `;
    const subject = await this.getSubjectById(id);
    if (!subject) throw new Error("Failed to create subject");
    return subject;
  }

  async updateSubject(id: string, data: UpdateSubject): Promise<Subject | null> {
    const existing = await this.getSubjectById(id);
    if (!existing) return null;

    await this.sql`
      UPDATE subjects SET
        key = COALESCE(${data.key ?? null}, key),
        name = COALESCE(${data.name ?? null}, name),
        description = COALESCE(${data.description ?? null}, description),
        updated_at = ${now()}
      WHERE id = ${id}
    `;
    return this.getSubjectById(id);
  }

  async deleteSubject(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM subjects WHERE id = ${id}`;
    return result.count > 0;
  }

  // =========================================================================
  // Clusters
  // =========================================================================

  async getClustersBySubject(subjectId: string): Promise<QuestionCluster[]> {
    const rows = await this.sql<QuestionClusterRow[]>`
      SELECT * FROM question_clusters WHERE subject_id = ${subjectId} ORDER BY topic
    `;
    return rows.map(rowToCluster);
  }

  async getClusterById(id: string): Promise<QuestionCluster | null> {
    const rows = await this.sql<QuestionClusterRow[]>`SELECT * FROM question_clusters WHERE id = ${id}`;
    const row = rows[0];
    return row ? rowToCluster(row) : null;
  }

  async createCluster(data: CreateQuestionCluster): Promise<QuestionCluster> {
    const id = generateUuid();
    const timestamp = now();
    await this.sql`
      INSERT INTO question_clusters (id, subject_id, topic, canonical_template, difficulty_baseline, created_at, updated_at)
      VALUES (${id}, ${data.subjectId}, ${data.topic}, ${data.canonicalTemplate ?? null}, ${data.difficultyBaseline ?? 5}, ${timestamp}, ${timestamp})
    `;
    const cluster = await this.getClusterById(id);
    if (!cluster) throw new Error("Failed to create cluster");
    return cluster;
  }

  async updateCluster(id: string, data: UpdateQuestionCluster): Promise<QuestionCluster | null> {
    const existing = await this.getClusterById(id);
    if (!existing) return null;

    await this.sql`
      UPDATE question_clusters SET
        topic = COALESCE(${data.topic ?? null}, topic),
        canonical_template = COALESCE(${data.canonicalTemplate ?? null}, canonical_template),
        difficulty_baseline = COALESCE(${data.difficultyBaseline ?? null}, difficulty_baseline),
        updated_at = ${now()}
      WHERE id = ${id}
    `;
    return this.getClusterById(id);
  }

  async deleteCluster(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM question_clusters WHERE id = ${id}`;
    return result.count > 0;
  }

  // =========================================================================
  // Variants
  // =========================================================================

  async getVariantsByCluster(clusterId: string): Promise<QuestionVariant[]> {
    const rows = await this.sql<QuestionVariantRow[]>`
      SELECT * FROM question_variants WHERE cluster_id = ${clusterId}
    `;
    return rows.map(rowToVariant);
  }

  async getVariantById(id: string): Promise<QuestionVariant | null> {
    const rows = await this.sql<QuestionVariantRow[]>`SELECT * FROM question_variants WHERE id = ${id}`;
    const row = rows[0];
    return row ? rowToVariant(row) : null;
  }

  async getRandomVariantForCluster(clusterId: string): Promise<QuestionVariant | null> {
    const rows = await this.sql<QuestionVariantRow[]>`
      SELECT * FROM question_variants WHERE cluster_id = ${clusterId} ORDER BY RANDOM() LIMIT 1
    `;
    const row = rows[0];
    return row ? rowToVariant(row) : null;
  }

  async createVariant(data: CreateQuestionVariant): Promise<QuestionVariant> {
    const id = generateUuid();
    const timestamp = now();
    await this.sql`
      INSERT INTO question_variants (id, cluster_id, question_text, created_at, updated_at)
      VALUES (${id}, ${data.clusterId}, ${data.questionText}, ${timestamp}, ${timestamp})
    `;
    const variant = await this.getVariantById(id);
    if (!variant) throw new Error("Failed to create variant");
    return variant;
  }

  async updateVariant(id: string, data: UpdateQuestionVariant): Promise<QuestionVariant | null> {
    const existing = await this.getVariantById(id);
    if (!existing) return null;

    if (data.questionText === undefined) return existing;

    await this.sql`
      UPDATE question_variants SET question_text = ${data.questionText}, updated_at = ${now()} WHERE id = ${id}
    `;
    return this.getVariantById(id);
  }

  async deleteVariant(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM question_variants WHERE id = ${id}`;
    return result.count > 0;
  }

  // =========================================================================
  // Answers
  // =========================================================================

  async getAnswersByVariant(variantId: string): Promise<Answer[]> {
    const rows = await this.sql<AnswerRow[]>`SELECT * FROM answers WHERE variant_id = ${variantId}`;
    return rows.map(rowToAnswer);
  }

  async getAnswerById(id: string): Promise<Answer | null> {
    const rows = await this.sql<AnswerRow[]>`SELECT * FROM answers WHERE id = ${id}`;
    const row = rows[0];
    return row ? rowToAnswer(row) : null;
  }

  async createAnswer(data: CreateAnswer): Promise<Answer> {
    const id = generateUuid();
    const timestamp = now();
    await this.sql`
      INSERT INTO answers (id, variant_id, answer_text, is_correct, distractor_type, created_at, updated_at)
      VALUES (${id}, ${data.variantId}, ${data.answerText}, ${data.isCorrect}, ${data.distractorType ?? null}, ${timestamp}, ${timestamp})
    `;
    const answer = await this.getAnswerById(id);
    if (!answer) throw new Error("Failed to create answer");
    return answer;
  }

  async createAnswersBulk(answers: CreateAnswer[]): Promise<Answer[]> {
    const timestamp = now();
    const created: Answer[] = [];

    for (const data of answers) {
      const id = generateUuid();
      await this.sql`
        INSERT INTO answers (id, variant_id, answer_text, is_correct, distractor_type, created_at, updated_at)
        VALUES (${id}, ${data.variantId}, ${data.answerText}, ${data.isCorrect}, ${data.distractorType ?? null}, ${timestamp}, ${timestamp})
      `;
      const answer = await this.getAnswerById(id);
      if (answer) created.push(answer);
    }

    return created;
  }

  async updateAnswer(id: string, data: UpdateAnswer): Promise<Answer | null> {
    const existing = await this.getAnswerById(id);
    if (!existing) return null;

    await this.sql`
      UPDATE answers SET
        answer_text = COALESCE(${data.answerText ?? null}, answer_text),
        is_correct = COALESCE(${data.isCorrect ?? null}, is_correct),
        distractor_type = COALESCE(${data.distractorType ?? null}, distractor_type),
        updated_at = ${now()}
      WHERE id = ${id}
    `;
    return this.getAnswerById(id);
  }

  async deleteAnswer(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM answers WHERE id = ${id}`;
    return result.count > 0;
  }

  // =========================================================================
  // Convenience methods
  // =========================================================================

  async getFullQuestion(variantId: string): Promise<FullQuestion | null> {
    const variant = await this.getVariantById(variantId);
    if (!variant) return null;

    const cluster = await this.getClusterById(variant.clusterId);
    if (!cluster) return null;

    const answers = await this.getAnswersByVariant(variantId);

    return {
      ...variant,
      cluster,
      answers,
    };
  }

  async getRandomQuestionForSubject(subjectKey: string): Promise<FullQuestion | null> {
    const subject = await this.getSubjectByKey(subjectKey);
    if (!subject) return null;

    // Get random cluster for subject
    const clusterRows = await this.sql<QuestionClusterRow[]>`
      SELECT * FROM question_clusters WHERE subject_id = ${subject.id} ORDER BY RANDOM() LIMIT 1
    `;
    const clusterRow = clusterRows[0];
    if (!clusterRow) return null;

    // Get random variant for cluster
    const variant = await this.getRandomVariantForCluster(clusterRow.id);
    if (!variant) return null;

    return this.getFullQuestion(variant.id);
  }
}
