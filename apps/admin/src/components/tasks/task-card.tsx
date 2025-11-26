"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge } from "./task-status-badge";
import {
  Eye,
  Check,
  RotateCcw,
  XCircle,
  RefreshCw,
  Clock,
  BookOpen,
  Layers,
  FileText,
} from "lucide-react";
import type { GenerationTask } from "@/types/tasks";
import { TASK_TYPE_LABELS } from "@/types/tasks";
import { useTasks } from "@/contexts/task-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface TaskCardProps {
  task: GenerationTask;
}

const taskTypeIcons = {
  generate_clusters: BookOpen,
  generate_variants: Layers,
  regenerate_answers: FileText,
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  return `vor ${diffDays} Tag${diffDays > 1 ? "en" : ""}`;
}

function formatDuration(startedAt: string, completedAt?: string | null): string {
  const start = new Date(startedAt);
  const end = completedAt ? new Date(completedAt) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  return `${diffMins}:${diffSecs.toString().padStart(2, "0")}`;
}

export function TaskCard({ task }: TaskCardProps) {
  const { cancelTask, retryTask, acceptTask, revertTask } = useTasks();
  const Icon = taskTypeIcons[task.taskType];

  const handleAccept = () => {
    acceptTask(task.id);
    toast.success("Task akzeptiert", {
      description: "Die generierten Inhalte wurden akzeptiert.",
    });
  };

  const handleRevert = () => {
    revertTask(task.id);
    toast.success("Task rückgängig gemacht", {
      description: "Alle Änderungen wurden rückgängig gemacht.",
    });
  };

  const handleCancel = () => {
    cancelTask(task.id);
    toast.info("Task abgebrochen");
  };

  const handleRetry = () => {
    retryTask(task.id);
    toast.info("Task wird wiederholt...");
  };

  const showProgress =
    task.status === "in_progress" ||
    (task.status === "failed" && task.progressCurrent > 0);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">
                  {TASK_TYPE_LABELS[task.taskType]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {task.userContext
                    ? task.userContext.slice(0, 60) +
                      (task.userContext.length > 60 ? "..." : "")
                    : "Keine Beschreibung"}
                </p>
              </div>
              <TaskStatusBadge
                status={task.status}
                acceptedAt={task.acceptedAt}
                revertedAt={task.revertedAt}
              />
            </div>

            {/* Progress */}
            {showProgress && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {task.progressMessage || "Verarbeite..."}
                  </span>
                  <span className="font-medium">{task.progressCurrent}%</span>
                </div>
                <Progress value={task.progressCurrent} className="h-1.5" />
              </div>
            )}

            {/* Error Message */}
            {task.status === "failed" && task.errorMessage && (
              <div className="mt-3 rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
                {task.errorMessage}
                {task.retryCount > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    (Versuch {task.retryCount}/{task.maxRetries})
                  </span>
                )}
              </div>
            )}

            {/* Meta Info */}
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(task.createdAt)}
              </span>
              {task.startedAt && (
                <span>
                  Dauer: {formatDuration(task.startedAt, task.completedAt)}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/tasks/${task.id}`}>
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  Details
                </Link>
              </Button>

              {task.status === "completed" &&
                !task.acceptedAt &&
                !task.revertedAt && (
                  <>
                    <Button size="sm" onClick={handleAccept}>
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Akzeptieren
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <RotateCcw className="mr-1 h-3.5 w-3.5" />
                          Rückgängig
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Änderungen rückgängig machen?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Alle von diesem Task generierten Inhalte werden
                            gelöscht. Diese Aktion kann nicht rückgängig gemacht
                            werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction onClick={handleRevert}>
                            Rückgängig machen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

              {task.status === "failed" && (
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Wiederholen
                </Button>
              )}

              {(task.status === "pending" || task.status === "in_progress") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Abbrechen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Task abbrechen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Der Task wird gestoppt und bereits generierte Inhalte
                        werden verworfen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Nicht abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancel}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Abbrechen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
