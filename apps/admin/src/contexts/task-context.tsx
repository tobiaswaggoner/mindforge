"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import type { GenerationTask, TaskStatus, TaskType } from "@/types/tasks";
import { mockTasks } from "@/lib/mock-data/tasks";

interface TaskContextType {
  tasks: GenerationTask[];
  getTaskById: (id: string) => GenerationTask | undefined;
  createTask: (
    taskType: TaskType,
    payload: GenerationTask["payload"],
    userContext?: string
  ) => GenerationTask;
  cancelTask: (id: string) => void;
  retryTask: (id: string) => void;
  acceptTask: (id: string) => void;
  revertTask: (id: string) => void;
  filterStatus: TaskStatus | "all";
  setFilterStatus: (status: TaskStatus | "all") => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<GenerationTask[]>(mockTasks);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");

  // Simulate progress updates for in_progress tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.status !== "in_progress") return task;

          const newProgress = Math.min(task.progressCurrent + 2, 100);
          const messages = [
            "Generiere Content...",
            "Verarbeite Daten...",
            "Erstelle Varianten...",
            "Prüfe Qualität...",
          ];

          if (newProgress >= 100) {
            return {
              ...task,
              status: "completed" as TaskStatus,
              progressCurrent: 100,
              progressMessage: null,
              completedAt: new Date().toISOString(),
            };
          }

          return {
            ...task,
            progressCurrent: newProgress,
            progressMessage:
              messages[Math.floor(Math.random() * messages.length)],
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getTaskById = useCallback(
    (id: string) => {
      return tasks.find((t) => t.id === id);
    },
    [tasks]
  );

  const createTask = useCallback(
    (
      taskType: TaskType,
      payload: GenerationTask["payload"],
      userContext?: string
    ): GenerationTask => {
      const newTask: GenerationTask = {
        id: `task-${Date.now()}`,
        taskType,
        status: "pending",
        payload,
        userContext: userContext || null,
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        delayedUntil: null,
        progressCurrent: 0,
        progressTotal: 100,
        progressMessage: null,
        errorMessage: null,
        retryCount: 0,
        maxRetries: 3,
        acceptedAt: null,
        revertedAt: null,
      };

      // Simulate starting after a short delay
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === newTask.id
              ? {
                  ...t,
                  status: "in_progress",
                  startedAt: new Date().toISOString(),
                  progressMessage: "Starte Generierung...",
                }
              : t
          )
        );
      }, 1000);

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    []
  );

  const cancelTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && (t.status === "pending" || t.status === "in_progress")
          ? { ...t, status: "cancelled" as TaskStatus, progressMessage: null }
          : t
      )
    );
  }, []);

  const retryTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "failed"
          ? {
              ...t,
              status: "pending" as TaskStatus,
              retryCount: t.retryCount + 1,
              errorMessage: null,
              delayedUntil: null,
            }
          : t
      )
    );

    // Simulate starting after a short delay
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id && t.status === "pending"
            ? {
                ...t,
                status: "in_progress",
                startedAt: new Date().toISOString(),
                progressMessage: "Wiederhole Generierung...",
              }
            : t
        )
      );
    }, 1000);
  }, []);

  const acceptTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "completed" && !t.acceptedAt
          ? { ...t, acceptedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  const revertTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id && t.status === "completed" && !t.revertedAt
          ? { ...t, revertedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        getTaskById,
        createTask,
        cancelTask,
        retryTask,
        acceptTask,
        revertTask,
        filterStatus,
        setFilterStatus,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
