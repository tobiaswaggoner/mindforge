"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./task-card";
import { useTasks } from "@/contexts/task-context";
import type { TaskStatus } from "@/types/tasks";
import { ListTodo } from "lucide-react";

const statusTabs: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "pending", label: "Wartend" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "failed", label: "Fehlgeschlagen" },
];

export function TaskList() {
  const { tasks, filterStatus, setFilterStatus } = useTasks();

  const filteredTasks =
    filterStatus === "all"
      ? tasks
      : tasks.filter((t) => t.status === filterStatus);

  const getCount = (status: TaskStatus | "all") => {
    if (status === "all") return tasks.length;
    return tasks.filter((t) => t.status === status).length;
  };

  return (
    <div className="space-y-4">
      {/* Status Tabs */}
      <Tabs
        value={filterStatus}
        onValueChange={(v) => setFilterStatus(v as TaskStatus | "all")}
      >
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {statusTabs.map((tab) => {
            const count = getCount(tab.value);
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1.5"
              >
                {tab.label}
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 min-w-5 px-1.5 text-xs"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <ListTodo className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">Keine Tasks gefunden</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {filterStatus === "all"
              ? "Starte einen neuen Generierungs-Task im Content-Bereich."
              : `Keine Tasks mit Status "${statusTabs.find((t) => t.value === filterStatus)?.label}" vorhanden.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
