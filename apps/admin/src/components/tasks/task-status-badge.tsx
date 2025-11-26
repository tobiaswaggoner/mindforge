"use client";

import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Loader2,
  CheckCircle,
  XCircle,
  Ban,
  Check,
  RotateCcw,
} from "lucide-react";
import type { TaskStatus } from "@/types/tasks";
import { cn } from "@/lib/utils";

interface TaskStatusBadgeProps {
  status: TaskStatus;
  acceptedAt?: string | null;
  revertedAt?: string | null;
  className?: string;
}

const statusConfig: Record<
  TaskStatus,
  {
    label: string;
    icon: typeof Clock;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
  }
> = {
  pending: {
    label: "Wartend",
    icon: Clock,
    variant: "secondary",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
  in_progress: {
    label: "In Bearbeitung",
    icon: Loader2,
    variant: "default",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  completed: {
    label: "Abgeschlossen",
    icon: CheckCircle,
    variant: "default",
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  failed: {
    label: "Fehlgeschlagen",
    icon: XCircle,
    variant: "destructive",
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  cancelled: {
    label: "Abgebrochen",
    icon: Ban,
    variant: "outline",
    className: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
};

export function TaskStatusBadge({
  status,
  acceptedAt,
  revertedAt,
  className,
}: TaskStatusBadgeProps) {
  // Show special status for accepted/reverted completed tasks
  if (status === "completed" && revertedAt) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-orange-500/10 text-orange-600 dark:text-orange-400",
          className
        )}
      >
        <RotateCcw className="mr-1 h-3 w-3" />
        Rückgängig
      </Badge>
    );
  }

  if (status === "completed" && acceptedAt) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "bg-green-500/10 text-green-600 dark:text-green-400",
          className
        )}
      >
        <Check className="mr-1 h-3 w-3" />
        Akzeptiert
      </Badge>
    );
  }

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <Icon
        className={cn(
          "mr-1 h-3 w-3",
          status === "in_progress" && "animate-spin"
        )}
      />
      {config.label}
    </Badge>
  );
}
