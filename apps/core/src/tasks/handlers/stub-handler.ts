import type { GenerationTask, TaskType } from "@mindforge/shared-types";
import type { TaskHandler } from "../registry.js";
import type { TaskRepository } from "../../repositories/task.repository.js";

/**
 * Stub Task Handler
 *
 * A placeholder handler that simulates task execution.
 * Used for development and testing before real LLM integration.
 */
export class StubTaskHandler implements TaskHandler {
  constructor(
    public readonly taskType: TaskType,
    private taskRepo: TaskRepository,
    private options: {
      simulatedDelayMs?: number;
      failureRate?: number; // 0.0 to 1.0
    } = {}
  ) {}

  async execute(task: GenerationTask): Promise<void> {
    const { simulatedDelayMs = 1000, failureRate = 0 } = this.options;

    // Simulate processing steps
    const steps = this.getSteps(task);
    const totalSteps = steps.length;

    for (let i = 0; i < totalSteps; i++) {
      // Update progress
      this.taskRepo.updateTaskProgress(task.id, i + 1, totalSteps, steps[i]);

      // Simulate delay
      await this.delay(simulatedDelayMs / totalSteps);

      // Random failure simulation
      if (Math.random() < failureRate) {
        throw new Error(`Simulated failure at step ${i + 1}: ${steps[i]}`);
      }
    }

    console.log(`[StubHandler:${this.taskType}] Task ${task.id} completed (simulated)`);
  }

  validate(task: GenerationTask): boolean {
    // Basic payload validation
    const { payload } = task;

    switch (this.taskType) {
      case "generate_clusters":
        return !!payload.subjectId && (payload.count ?? 0) > 0;

      case "generate_variants":
        return !!payload.clusterId && (payload.variantsPerCluster ?? 0) > 0;

      case "regenerate_answers":
        return !!payload.variantId && (payload.answersPerVariant ?? 0) >= 2;

      default:
        return true;
    }
  }

  private getSteps(task: GenerationTask): string[] {
    switch (this.taskType) {
      case "generate_clusters":
        return [
          "Analysiere Fach...",
          "Generiere Cluster-Ideen...",
          "Erstelle Cluster...",
          "Validiere Ergebnisse...",
        ];

      case "generate_variants":
        return [
          "Lade Cluster...",
          "Generiere Varianten...",
          "Erstelle Varianten...",
          "Validiere Ergebnisse...",
        ];

      case "regenerate_answers":
        return [
          "Lade Variante...",
          "Generiere Antworten...",
          "Erstelle Antworten...",
          "Validiere Ergebnisse...",
        ];

      default:
        return ["Processing..."];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Create stub handlers for all task types
 */
export function createStubHandlers(taskRepo: TaskRepository): TaskHandler[] {
  const taskTypes: TaskType[] = [
    "generate_clusters",
    "generate_variants",
    "regenerate_answers",
  ];

  return taskTypes.map(
    (taskType) =>
      new StubTaskHandler(taskType, taskRepo, {
        simulatedDelayMs: 2000,
        failureRate: 0.1, // 10% failure rate for testing
      })
  );
}
