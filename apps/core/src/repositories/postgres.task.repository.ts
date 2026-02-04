import type postgres from "postgres";
import { generateUuid, now } from "@mindforge/shared-utils";
import type {
  GenerationTask,
  TaskContentLog,
  TaskStatus,
  TaskType,
  TaskPayload,
  CreateTaskRequest,
} from "@mindforge/shared-types";
import type { TaskRepository } from "./task.repository.js";
import type { GenerationTaskRow, TaskContentLogRow } from "../db/database.js";

function rowToTask(row: GenerationTaskRow): GenerationTask {
  return {
    id: row.id,
    taskType: row.task_type as TaskType,
    status: row.status as TaskStatus,
    payload: row.payload as TaskPayload,
    userContext: row.user_context as string | null,
    createdAt: row.created_at.toISOString(),
    startedAt: row.started_at?.toISOString() ?? null,
    completedAt: row.completed_at?.toISOString() ?? null,
    delayedUntil: row.delayed_until?.toISOString() ?? null,
    progressCurrent: row.progress_current,
    progressTotal: row.progress_total,
    progressMessage: row.progress_message,
    errorMessage: row.error_message,
    retryCount: row.retry_count,
    maxRetries: row.max_retries,
    acceptedAt: row.accepted_at?.toISOString() ?? null,
    revertedAt: row.reverted_at?.toISOString() ?? null,
  };
}

function rowToLog(row: TaskContentLogRow): TaskContentLog {
  return {
    id: row.id,
    taskId: row.task_id,
    entityType: row.entity_type as "cluster" | "variant" | "answer",
    entityId: row.entity_id,
    action: row.action as "created" | "updated" | "deleted",
    previousData: row.previous_data as string | null,
    createdAt: row.created_at.toISOString(),
  };
}

export class PostgresTaskRepository implements TaskRepository {
  constructor(private sql: postgres.Sql) {}

  // =========================================================================
  // Task CRUD
  // =========================================================================

  async getAllTasks(): Promise<GenerationTask[]> {
    const rows = await this.sql<GenerationTaskRow[]>`
      SELECT * FROM generation_tasks ORDER BY created_at DESC
    `;
    return rows.map(rowToTask);
  }

  async getTasksByStatus(status: TaskStatus): Promise<GenerationTask[]> {
    const rows = await this.sql<GenerationTaskRow[]>`
      SELECT * FROM generation_tasks WHERE status = ${status} ORDER BY created_at DESC
    `;
    return rows.map(rowToTask);
  }

  async getTaskById(id: string): Promise<GenerationTask | null> {
    const rows = await this.sql<GenerationTaskRow[]>`
      SELECT * FROM generation_tasks WHERE id = ${id}
    `;
    const row = rows[0];
    return row ? rowToTask(row) : null;
  }

  async createTask(data: CreateTaskRequest): Promise<GenerationTask> {
    const id = generateUuid();
    const timestamp = now();
    await this.sql`
      INSERT INTO generation_tasks (id, task_type, status, payload, user_context, created_at)
      VALUES (${id}, ${data.taskType}, 'pending', ${JSON.stringify(data.payload)}, ${data.userContext ?? null}, ${timestamp})
    `;
    const task = await this.getTaskById(id);
    if (!task) throw new Error("Failed to create task");
    return task;
  }

  async updateTaskStatus(id: string, status: TaskStatus): Promise<GenerationTask | null> {
    const result = await this.sql`
      UPDATE generation_tasks SET status = ${status} WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async updateTaskProgress(
    id: string,
    current: number,
    total: number,
    message?: string
  ): Promise<GenerationTask | null> {
    const result = await this.sql`
      UPDATE generation_tasks
      SET progress_current = ${current}, progress_total = ${total}, progress_message = ${message ?? null}
      WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async updateTaskError(id: string, errorMessage: string): Promise<GenerationTask | null> {
    const result = await this.sql`
      UPDATE generation_tasks SET error_message = ${errorMessage} WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async markTaskStarted(id: string): Promise<GenerationTask | null> {
    const timestamp = now();
    const result = await this.sql`
      UPDATE generation_tasks SET status = 'in_progress', started_at = ${timestamp} WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async markTaskCompleted(id: string): Promise<GenerationTask | null> {
    const timestamp = now();
    const result = await this.sql`
      UPDATE generation_tasks SET status = 'completed', completed_at = ${timestamp} WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async markTaskFailed(id: string, errorMessage: string): Promise<GenerationTask | null> {
    const timestamp = now();
    const result = await this.sql`
      UPDATE generation_tasks
      SET status = 'failed', error_message = ${errorMessage}, completed_at = ${timestamp}
      WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async incrementRetryCount(id: string): Promise<GenerationTask | null> {
    const result = await this.sql`
      UPDATE generation_tasks SET retry_count = retry_count + 1 WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async acceptTask(id: string): Promise<GenerationTask | null> {
    const timestamp = now();
    const result = await this.sql`
      UPDATE generation_tasks SET accepted_at = ${timestamp} WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async revertTask(id: string): Promise<GenerationTask | null> {
    const timestamp = now();
    const result = await this.sql`
      UPDATE generation_tasks SET reverted_at = ${timestamp} WHERE id = ${id}
    `;
    if (result.count === 0) return null;
    return this.getTaskById(id);
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await this.sql`DELETE FROM generation_tasks WHERE id = ${id}`;
    return result.count > 0;
  }

  // =========================================================================
  // Task Content Logs
  // =========================================================================

  async getLogsForTask(taskId: string): Promise<TaskContentLog[]> {
    const rows = await this.sql<TaskContentLogRow[]>`
      SELECT * FROM task_content_logs WHERE task_id = ${taskId} ORDER BY created_at
    `;
    return rows.map(rowToLog);
  }

  async createLog(
    taskId: string,
    entityType: string,
    entityId: string,
    action: string,
    previousData?: unknown | null
  ): Promise<TaskContentLog> {
    const id = generateUuid();
    const timestamp = now();
    await this.sql`
      INSERT INTO task_content_logs (id, task_id, entity_type, entity_id, action, previous_data, created_at)
      VALUES (${id}, ${taskId}, ${entityType}, ${entityId}, ${action}, ${previousData ? JSON.stringify(previousData) : null}, ${timestamp})
    `;

    return {
      id,
      taskId,
      entityType: entityType as "cluster" | "variant" | "answer",
      entityId,
      action: action as "created" | "updated" | "deleted",
      previousData: previousData ? JSON.stringify(previousData) : null,
      createdAt: timestamp,
    };
  }

  // =========================================================================
  // Queries
  // =========================================================================

  async getPendingTasks(): Promise<GenerationTask[]> {
    const rows = await this.sql<GenerationTaskRow[]>`
      SELECT * FROM generation_tasks
      WHERE status = 'pending'
        AND (delayed_until IS NULL OR delayed_until <= NOW())
      ORDER BY created_at
    `;
    return rows.map(rowToTask);
  }

  async getNextTaskToProcess(): Promise<GenerationTask | null> {
    const rows = await this.sql<GenerationTaskRow[]>`
      SELECT * FROM generation_tasks
      WHERE status = 'pending'
        AND (delayed_until IS NULL OR delayed_until <= NOW())
      ORDER BY created_at
      LIMIT 1
    `;
    const row = rows[0];
    return row ? rowToTask(row) : null;
  }
}
