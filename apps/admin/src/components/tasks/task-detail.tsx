"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TaskStatusBadge } from "./task-status-badge";
import {
  ChevronLeft,
  Check,
  RotateCcw,
  XCircle,
  RefreshCw,
  Clock,
  FileText,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { GenerationTask, TaskContentLog } from "@/types/tasks";
import { TASK_TYPE_LABELS } from "@/types/tasks";
import { useTasks } from "@/contexts/task-context";
import { getLogsByTaskId } from "@/lib/mock-data/tasks";
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

interface TaskDetailProps {
  task: GenerationTask;
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const actionIcons = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
};

const actionLabels = {
  created: "Erstellt",
  updated: "Aktualisiert",
  deleted: "Gelöscht",
};

const entityLabels = {
  cluster: "Cluster",
  variant: "Variante",
  answer: "Antwort",
};

export function TaskDetail({ task }: TaskDetailProps) {
  const { cancelTask, retryTask, acceptTask, revertTask } = useTasks();
  const logs = getLogsByTaskId(task.id);

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

  // Count changes by type
  const changeStats = logs.reduce(
    (acc, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm">
        <Link href="/tasks">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Zurück zur Übersicht
        </Link>
      </Button>

      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {TASK_TYPE_LABELS[task.taskType]}
            </CardTitle>
            <p className="text-sm text-muted-foreground">Task ID: {task.id}</p>
          </div>
          <TaskStatusBadge
            status={task.status}
            acceptedAt={task.acceptedAt}
            revertedAt={task.revertedAt}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          {(task.status === "in_progress" || task.status === "failed") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {task.progressMessage || "Verarbeite..."}
                </span>
                <span className="font-medium">{task.progressCurrent}%</span>
              </div>
              <Progress value={task.progressCurrent} className="h-2" />
            </div>
          )}

          {/* Error */}
          {task.status === "failed" && task.errorMessage && (
            <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">Fehler:</p>
              <p className="text-sm">{task.errorMessage}</p>
              {task.retryCount > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Versuch {task.retryCount} von {task.maxRetries}
                </p>
              )}
            </div>
          )}

          {/* User Context */}
          {task.userContext && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Zusätzliche Anweisungen
              </h4>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-sm whitespace-pre-wrap">{task.userContext}</p>
              </div>
            </div>
          )}

          {/* Payload */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Parameter
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(task.payload).map(([key, value]) => (
                <Badge key={key} variant="outline">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Erstellt</p>
              <p className="font-medium">{formatDateTime(task.createdAt)}</p>
            </div>
            {task.startedAt && (
              <div>
                <p className="text-muted-foreground">Gestartet</p>
                <p className="font-medium">{formatDateTime(task.startedAt)}</p>
              </div>
            )}
            {task.completedAt && (
              <div>
                <p className="text-muted-foreground">Abgeschlossen</p>
                <p className="font-medium">
                  {formatDateTime(task.completedAt)}
                </p>
              </div>
            )}
            {task.acceptedAt && (
              <div>
                <p className="text-muted-foreground">Akzeptiert</p>
                <p className="font-medium">{formatDateTime(task.acceptedAt)}</p>
              </div>
            )}
            {task.revertedAt && (
              <div>
                <p className="text-muted-foreground">Rückgängig</p>
                <p className="font-medium">{formatDateTime(task.revertedAt)}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {task.status === "completed" &&
              !task.acceptedAt &&
              !task.revertedAt && (
                <>
                  <Button onClick={handleAccept}>
                    <Check className="mr-2 h-4 w-4" />
                    Akzeptieren
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Rückgängig machen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Änderungen rückgängig machen?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Alle von diesem Task generierten Inhalte werden
                          gelöscht.
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

            {task.status === "completed" && (
              <Button asChild variant="outline">
                <Link href={`/content?taskId=${task.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ergebnisse anzeigen
                </Link>
              </Button>
            )}

            {task.status === "failed" && (
              <Button variant="outline" onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Wiederholen
              </Button>
            )}

            {(task.status === "pending" || task.status === "in_progress") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <XCircle className="mr-2 h-4 w-4" />
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
        </CardContent>
      </Card>

      {/* Content Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Änderungsprotokoll
            {logs.length > 0 && (
              <Badge variant="secondary">{logs.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Noch keine Änderungen protokolliert.</p>
              <p className="text-sm">
                {task.status === "in_progress"
                  ? "Das Protokoll wird während der Generierung gefüllt."
                  : "Keine Änderungen in diesem Task."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Stats */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(changeStats).map(([type, count]) => (
                  <Badge key={type} variant="outline">
                    {count} {entityLabels[type as keyof typeof entityLabels]}
                    {count > 1 ? "s" : ""}
                  </Badge>
                ))}
              </div>

              {/* Log entries */}
              <div className="space-y-2">
                {logs.map((log) => {
                  const Icon = actionIcons[log.action];
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p>
                          <span className="font-medium">
                            {entityLabels[log.entityType]}
                          </span>{" "}
                          {actionLabels[log.action].toLowerCase()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                      <code className="text-xs text-muted-foreground">
                        {log.entityId.slice(0, 12)}...
                      </code>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
