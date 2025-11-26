"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ExternalLink } from "lucide-react";
import { type ActiveTask } from "@/lib/mock-data/dashboard";

interface ActiveTasksCardProps {
  tasks: ActiveTask[];
}

function formatDuration(startedAt: string): string {
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor((diffMs % 60000) / 1000);
  return `${diffMins}:${diffSecs.toString().padStart(2, "0")}`;
}

export function ActiveTasksCard({ tasks }: ActiveTasksCardProps) {
  const hasActiveTasks = tasks.length > 0;

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Aktive Tasks</CardTitle>
          {hasActiveTasks && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {tasks.length}
            </Badge>
          )}
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/tasks">
            Alle anzeigen
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {hasActiveTasks ? (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-medium">{task.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {task.subject}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <span className="font-mono text-muted-foreground">
                        {formatDuration(task.startedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {task.progressMessage}
                      </span>
                      <span className="font-medium">{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex h-[200px] flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-3">
              <Loader2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">Keine aktiven Tasks</p>
            <p className="text-xs text-muted-foreground">
              Starte einen neuen Generierungs-Task im Content-Bereich
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
