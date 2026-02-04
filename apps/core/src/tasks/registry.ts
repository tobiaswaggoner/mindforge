import type { GenerationTask, TaskType } from "@mindforge/shared-types";

/**
 * Task Handler Interface
 *
 * Handlers are responsible for executing tasks of a specific type.
 */
export interface TaskHandler {
  /** Task type this handler processes */
  taskType: TaskType;

  /** Execute the task */
  execute(task: GenerationTask): Promise<void>;

  /** Validate task payload before execution */
  validate?(task: GenerationTask): boolean;

  /** Called when task is accepted (content approved) */
  onAccept?(task: GenerationTask): Promise<void>;

  /** Called when task is reverted (content rejected) */
  onRevert?(task: GenerationTask): Promise<void>;
}

/**
 * Task Handler Registry
 *
 * Central registry for task handlers. Each task type should have exactly one handler.
 */
export class TaskRegistry {
  private handlers: Map<TaskType, TaskHandler> = new Map();

  /**
   * Register a handler for a task type
   */
  register(handler: TaskHandler): void {
    if (this.handlers.has(handler.taskType)) {
      console.warn(`Handler for task type '${handler.taskType}' is being replaced`);
    }
    this.handlers.set(handler.taskType, handler);
    console.log(`✅ Registered handler for task type: ${handler.taskType}`);
  }

  /**
   * Get handler for a task type
   */
  getHandler(taskType: TaskType): TaskHandler | undefined {
    return this.handlers.get(taskType);
  }

  /**
   * Check if a handler exists for a task type
   */
  hasHandler(taskType: TaskType): boolean {
    return this.handlers.has(taskType);
  }

  /**
   * Get all registered task types
   */
  getRegisteredTypes(): TaskType[] {
    return [...this.handlers.keys()];
  }
}

// Singleton instance
export const taskRegistry = new TaskRegistry();
