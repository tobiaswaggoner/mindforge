"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, BookOpen, Layers, FileText } from "lucide-react";
import type { TaskType } from "@/types/tasks";
import { TASK_TYPE_LABELS } from "@/types/tasks";
import { useTasks } from "@/contexts/task-context";
import { toast } from "sonner";

interface GenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType;
  contextId: string;
  contextName: string;
}

const taskTypeIcons = {
  generate_clusters: BookOpen,
  generate_variants: Layers,
  regenerate_answers: FileText,
};

export function GenerateModal({
  isOpen,
  onClose,
  taskType,
  contextId,
  contextName,
}: GenerateModalProps) {
  const { createTask } = useTasks();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [count, setCount] = useState(
    taskType === "regenerate_answers" ? 4 : 10
  );
  const [variantsPerCluster, setVariantsPerCluster] = useState(5);
  const [answersPerVariant, setAnswersPerVariant] = useState(4);
  const [userContext, setUserContext] = useState("");

  const Icon = taskTypeIcons[taskType];

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Build payload based on task type
    const payload: Record<string, unknown> = { count };

    if (taskType === "generate_clusters") {
      payload.subjectId = contextId;
      payload.variantsPerCluster = variantsPerCluster;
      payload.answersPerVariant = answersPerVariant;
    } else if (taskType === "generate_variants") {
      payload.clusterId = contextId;
      payload.answersPerVariant = answersPerVariant;
    } else {
      payload.variantId = contextId;
    }

    // Create the task
    createTask(taskType, payload, userContext || undefined);

    // Show success toast
    toast.success("Task erstellt", {
      description: `${TASK_TYPE_LABELS[taskType]} wurde gestartet.`,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Content generieren
          </DialogTitle>
          <DialogDescription>
            Starte einen neuen Generierungs-Task mit AI-Unterstützung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Context Display */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {TASK_TYPE_LABELS[taskType]}
                </p>
                <p className="text-sm text-muted-foreground">{contextName}</p>
              </div>
              <Badge variant="secondary">{taskType.split("_")[0]}</Badge>
            </div>
          </div>

          {/* Parameters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  {taskType === "generate_clusters"
                    ? "Anzahl Cluster"
                    : taskType === "generate_variants"
                      ? "Anzahl Varianten"
                      : "Anzahl Antworten"}
                </Label>
                <span className="text-sm font-medium">{count}</span>
              </div>
              <Slider
                value={[count]}
                onValueChange={([v]) => setCount(v)}
                min={1}
                max={taskType === "regenerate_answers" ? 6 : 20}
                step={1}
              />
            </div>

            {taskType === "generate_clusters" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Varianten pro Cluster</Label>
                  <span className="text-sm font-medium">
                    {variantsPerCluster}
                  </span>
                </div>
                <Slider
                  value={[variantsPerCluster]}
                  onValueChange={([v]) => setVariantsPerCluster(v)}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
            )}

            {(taskType === "generate_clusters" ||
              taskType === "generate_variants") && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Antworten pro Variante</Label>
                  <span className="text-sm font-medium">{answersPerVariant}</span>
                </div>
                <Slider
                  value={[answersPerVariant]}
                  onValueChange={([v]) => setAnswersPerVariant(v)}
                  min={2}
                  max={6}
                  step={1}
                />
              </div>
            )}
          </div>

          {/* User Context */}
          <div className="space-y-2">
            <Label htmlFor="userContext">
              Zusätzliche Anweisungen (optional)
            </Label>
            <Textarea
              id="userContext"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="z.B. Fokus auf lineare Gleichungen mit Brüchen. Schwierigkeitsgrad zwischen 3 und 6. Anwendungsaufgaben aus dem Alltag bevorzugen."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Diese Anweisungen werden dem AI-Modell als zusätzlicher Kontext
              mitgegeben.
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium">Zusammenfassung:</p>
            <p className="text-muted-foreground">
              {taskType === "generate_clusters" &&
                `${count} Cluster mit je ${variantsPerCluster} Varianten und ${answersPerVariant} Antworten = ca. ${count * variantsPerCluster * answersPerVariant} Antworten`}
              {taskType === "generate_variants" &&
                `${count} Varianten mit je ${answersPerVariant} Antworten = ${count * answersPerVariant} Antworten`}
              {taskType === "regenerate_answers" &&
                `${count} neue Antworten für diese Variante`}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starten...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generierung starten
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
