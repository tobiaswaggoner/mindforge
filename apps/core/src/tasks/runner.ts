import type { GenerationTask } from "@mindforge/shared-types";
import type { TaskRepository } from "../repositories/task.repository.js";
import { TaskRegistry, taskRegistry } from "./registry.js";
import { CircuitBreaker, CircuitOpenError } from "../core/circuit-breaker.js";

export interface TaskRunnerOptions {
  /** Polling interval in ms */
  pollInterval?: number;
  /** Maximum concurrent tasks */
  maxConcurrent?: number;
  /** Circuit breaker options */
  circuitBreaker?: {
    failureThreshold?: number;
    resetTimeout?: number;
  };
}

const DEFAULT_OPTIONS: Required<TaskRunnerOptions> = {
  pollInterval: 5000, // 5 seconds
  maxConcurrent: 1,
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
  },
};

/**
 * Task Runner
 *
 * Background worker that polls for pending tasks and executes them
 * using registered handlers.
 */
export class TaskRunner {
  private isRunning = false;
  private pollTimer: Timer | null = null;
  private activeTaskCount = 0;
  private readonly options: Required<TaskRunnerOptions>;
  private readonly circuitBreaker: CircuitBreaker;

  constructor(
    private taskRepo: TaskRepository,
    private registry: TaskRegistry = taskRegistry,
    options: TaskRunnerOptions = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.circuitBreaker = new CircuitBreaker({
      name: "TaskRunner",
      ...this.options.circuitBreaker,
    });
  }

  /**
   * Start the task runner
   */
  start(): void {
    if (this.isRunning) {
      console.warn("[TaskRunner] Already running");
      return;
    }

    this.isRunning = true;
    console.log(`[TaskRunner] Started (poll interval: ${this.options.pollInterval}ms)`);
    this.poll();
  }

  /**
   * Stop the task runner
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
    console.log("[TaskRunner] Stopped");
  }

  /**
   * Get runner status
   */
  getStatus(): {
    isRunning: boolean;
    activeTaskCount: number;
    circuitState: string;
  } {
    return {
      isRunning: this.isRunning,
      activeTaskCount: this.activeTaskCount,
      circuitState: this.circuitBreaker.getState(),
    };
  }

  /**
   * Process a single task (for manual execution)
   */
  async processTask(taskId: string): Promise<void> {
    const task = await this.taskRepo.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    await this.executeTask(task);
  }

  /**
   * Poll for and process tasks
   */
  private async poll(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      // Check circuit breaker
      if (this.circuitBreaker.getState() === "OPEN") {
        console.log("[TaskRunner] Circuit breaker is open, skipping poll");
      } else if (this.activeTaskCount < this.options.maxConcurrent) {
        const task = await this.taskRepo.getNextTaskToProcess();
        if (task) {
          // Don't await - let it run in background
          this.executeTaskWithCircuitBreaker(task);
        }
      }
    } catch (error) {
      console.error("[TaskRunner] Poll error:", error);
    }

    // Schedule next poll
    this.pollTimer = setTimeout(() => this.poll(), this.options.pollInterval);
  }

  /**
   * Execute task through circuit breaker
   */
  private async executeTaskWithCircuitBreaker(task: GenerationTask): Promise<void> {
    try {
      await this.circuitBreaker.execute(() => this.executeTask(task));
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        console.log(`[TaskRunner] Circuit open, task ${task.id} will be retried later`);
      }
      // Error is already handled in executeTask
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: GenerationTask): Promise<void> {
    const handler = this.registry.getHandler(task.taskType);
    if (!handler) {
      console.error(`[TaskRunner] No handler registered for task type: ${task.taskType}`);
      await this.taskRepo.markTaskFailed(task.id, `No handler for task type: ${task.taskType}`);
      return;
    }

    // Validate task
    if (handler.validate && !handler.validate(task)) {
      console.error(`[TaskRunner] Task ${task.id} validation failed`);
      await this.taskRepo.markTaskFailed(task.id, "Task validation failed");
      return;
    }

    this.activeTaskCount++;
    console.log(`[TaskRunner] Starting task ${task.id} (${task.taskType})`);

    try {
      // Mark as started
      await this.taskRepo.markTaskStarted(task.id);

      // Execute handler
      await handler.execute(task);

      // Mark as completed
      await this.taskRepo.markTaskCompleted(task.id);
      console.log(`[TaskRunner] Task ${task.id} completed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[TaskRunner] Task ${task.id} failed:`, errorMessage);

      // Check if we should retry
      const updatedTask = await this.taskRepo.getTaskById(task.id);
      if (updatedTask && updatedTask.retryCount < updatedTask.maxRetries) {
        await this.taskRepo.incrementRetryCount(task.id);
        await this.taskRepo.updateTaskStatus(task.id, "pending");
        await this.taskRepo.updateTaskError(task.id, `Retry ${updatedTask.retryCount + 1}: ${errorMessage}`);
        console.log(`[TaskRunner] Task ${task.id} will be retried (${updatedTask.retryCount + 1}/${updatedTask.maxRetries})`);
      } else {
        await this.taskRepo.markTaskFailed(task.id, errorMessage);
      }

      throw error; // Re-throw for circuit breaker
    } finally {
      this.activeTaskCount--;
    }
  }
}

// Singleton runner instance (created when needed)
let runnerInstance: TaskRunner | null = null;

export function getTaskRunner(
  taskRepo: TaskRepository,
  options?: TaskRunnerOptions
): TaskRunner {
  if (!runnerInstance) {
    runnerInstance = new TaskRunner(taskRepo, taskRegistry, options);
  }
  return runnerInstance;
}
