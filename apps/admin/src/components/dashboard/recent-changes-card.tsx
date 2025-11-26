"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { type RecentChange } from "@/lib/mock-data/dashboard";
import { cn } from "@/lib/utils";

interface RecentChangesCardProps {
  changes: RecentChange[];
}

const actionIcons = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  completed: CheckCircle,
};

const actionColors = {
  created: "text-green-500 bg-green-500/10",
  updated: "text-blue-500 bg-blue-500/10",
  deleted: "text-red-500 bg-red-500/10",
  completed: "text-primary bg-primary/10",
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RecentChangesCard({ changes }: RecentChangesCardProps) {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          Letzte Änderungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-3">
            {changes.map((change) => {
              const Icon = actionIcons[change.action];
              return (
                <div
                  key={change.id}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent/30"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                      actionColors[change.action]
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium leading-tight">
                      {change.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(change.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
