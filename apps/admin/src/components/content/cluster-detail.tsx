"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Sparkles,
  FileText,
  Save,
  X,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContent } from "@/contexts/content-context";
import type { QuestionCluster } from "@/types/content";

interface ClusterDetailProps {
  cluster: QuestionCluster;
  onGenerateClick?: () => void;
}

export function ClusterDetail({ cluster, onGenerateClick }: ClusterDetailProps) {
  const {
    updateCluster,
    deleteCluster,
    getVariantsByCluster,
    getSubjectById,
    setSelection,
  } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    topic: cluster.topic,
    canonicalTemplate: cluster.canonicalTemplate || "",
    difficultyBaseline: cluster.difficultyBaseline,
  });

  const variants = getVariantsByCluster(cluster.id);
  const subject = getSubjectById(cluster.subjectId);

  const handleSave = () => {
    updateCluster(cluster.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      topic: cluster.topic,
      canonicalTemplate: cluster.canonicalTemplate || "",
      difficultyBaseline: cluster.difficultyBaseline,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteCluster(cluster.id);
    setSelection({
      type: "subject",
      subjectId: cluster.subjectId,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          setSelection({ type: "subject", subjectId: cluster.subjectId })
        }
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Zurück zu {subject?.name || "Fach"}
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {isEditing ? (
              <Input
                value={editData.topic}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, topic: e.target.value }))
                }
                className="text-xl font-bold"
              />
            ) : (
              <CardTitle className="text-xl">{cluster.topic}</CardTitle>
            )}
            <p className="text-sm text-muted-foreground">
              Erstellt: {formatDate(cluster.createdAt)} • Aktualisiert:{" "}
              {formatDate(cluster.updatedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="mr-1 h-4 w-4" />
                  Abbrechen
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="mr-1 h-4 w-4" />
                  Speichern
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="mr-1 h-4 w-4" />
                  Bearbeiten
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cluster löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dadurch werden auch alle {variants.length} zugehörigen
                        Varianten und Antworten unwiderruflich gelöscht.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Kanonische Vorlage
            </label>
            {isEditing ? (
              <Textarea
                value={editData.canonicalTemplate}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    canonicalTemplate: e.target.value,
                  }))
                }
                className="mt-1"
                rows={2}
                placeholder="z.B. 'Löse die Gleichung nach x auf'"
              />
            ) : (
              <p className="mt-1 text-sm">
                {cluster.canonicalTemplate || "Keine Vorlage definiert"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Schwierigkeit
              </label>
              {isEditing ? (
                <Select
                  value={editData.difficultyBaseline.toString()}
                  onValueChange={(value) =>
                    setEditData((prev) => ({
                      ...prev,
                      difficultyBaseline: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="mt-1 w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}/10
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${cluster.difficultyBaseline * 10}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm">{cluster.difficultyBaseline}/10</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Varianten
              </label>
              <p className="mt-1 text-sm">{variants.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button onClick={onGenerateClick} className="w-full sm:w-auto">
        <Sparkles className="mr-2 h-4 w-4" />
        Neue Varianten generieren
      </Button>

      {/* Variants List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Varianten ({variants.length})</h3>
        {variants.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Noch keine Varianten vorhanden
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onGenerateClick}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Varianten generieren
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {variants.map((variant) => (
              <Card
                key={variant.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() =>
                  setSelection({
                    type: "variant",
                    subjectId: cluster.subjectId,
                    clusterId: cluster.id,
                    variantId: variant.id,
                  })
                }
              >
                <CardContent className="p-4">
                  <p className="font-medium">{variant.questionText}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
