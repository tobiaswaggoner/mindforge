import type {
  GenerationTask,
  TaskContentLog,
  TaskStatus,
  CreateTaskRequest,
} from "@mindforge/shared-types";

/**
 * Task Repository Interface
 */
export interface TaskRepository {
  // Task CRUD
  getAllTasks(): Promise<GenerationTask[]>;
  getTasksByStatus(status: TaskStatus): Promise<GenerationTask[]>;
  getTaskById(id: string): Promise<GenerationTask | null>;
  createTask(data: CreateTaskRequest): Promise<GenerationTask>;
  updateTaskStatus(id: string, status: TaskStatus): Promise<GenerationTask | null>;
  updateTaskProgress(id: string, current: number, total: number, message?: string): Promise<GenerationTask | null>;
  updateTaskError(id: string, errorMessage: string): Promise<GenerationTask | null>;
  markTaskStarted(id: string): Promise<GenerationTask | null>;
  markTaskCompleted(id: string): Promise<GenerationTask | null>;
  markTaskFailed(id: string, errorMessage: string): Promise<GenerationTask | null>;
  incrementRetryCount(id: string): Promise<GenerationTask | null>;
  acceptTask(id: string): Promise<GenerationTask | null>;
  revertTask(id: string): Promise<GenerationTask | null>;
  deleteTask(id: string): Promise<boolean>;

  // Task Content Logs
  getLogsForTask(taskId: string): Promise<TaskContentLog[]>;
  createLog(
    taskId: string,
    entityType: string,
    entityId: string,
    action: string,
    previousData?: unknown | null
  ): Promise<TaskContentLog>;

  // Queries
  getPendingTasks(): Promise<GenerationTask[]>;
  getNextTaskToProcess(): Promise<GenerationTask | null>;
}
