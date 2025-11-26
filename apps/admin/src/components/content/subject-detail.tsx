"use client";

import { useState } from "react";
import { Pencil, Trash2, Sparkles, Layers, Save, X } from "lucide-react";
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
import { useContent } from "@/contexts/content-context";
import type { Subject } from "@/types/content";

interface SubjectDetailProps {
  subject: Subject;
  onGenerateClick?: () => void;
}

export function SubjectDetail({ subject, onGenerateClick }: SubjectDetailProps) {
  const { updateSubject, deleteSubject, getClustersBySubject, setSelection } =
    useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: subject.name,
    description: subject.description || "",
  });

  const clusters = getClustersBySubject(subject.id);

  const handleSave = () => {
    updateSubject(subject.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: subject.name,
      description: subject.description || "",
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteSubject(subject.id);
    setSelection(null);
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
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            {isEditing ? (
              <Input
                value={editData.name}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="text-xl font-bold"
              />
            ) : (
              <CardTitle className="text-xl">{subject.name}</CardTitle>
            )}
            <p className="text-sm text-muted-foreground">
              Erstellt: {formatDate(subject.createdAt)} • Aktualisiert:{" "}
              {formatDate(subject.updatedAt)}
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
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" />
                      Löschen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Fach löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dadurch werden auch alle {clusters.length} zugehörigen
                        Cluster, Varianten und Antworten unwiderruflich gelöscht.
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
              Beschreibung
            </label>
            {isEditing ? (
              <Textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="mt-1"
                rows={3}
              />
            ) : (
              <p className="mt-1 text-sm">
                {subject.description || "Keine Beschreibung vorhanden"}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Key
              </label>
              <p className="mt-1 font-mono text-sm">{subject.key}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Cluster
              </label>
              <p className="mt-1 text-sm">{clusters.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button onClick={onGenerateClick} className="w-full sm:w-auto">
        <Sparkles className="mr-2 h-4 w-4" />
        Neue Fragen generieren
      </Button>

      {/* Clusters List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Cluster ({clusters.length})</h3>
        {clusters.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Noch keine Cluster vorhanden
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={onGenerateClick}>
                <Sparkles className="mr-2 h-4 w-4" />
                Cluster generieren
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {clusters.map((cluster) => (
              <Card
                key={cluster.id}
                className="cursor-pointer transition-colors hover:bg-accent/50"
                onClick={() =>
                  setSelection({
                    type: "cluster",
                    subjectId: subject.id,
                    clusterId: cluster.id,
                  })
                }
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{cluster.topic}</p>
                    {cluster.canonicalTemplate && (
                      <p className="text-sm text-muted-foreground">
                        {cluster.canonicalTemplate}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    Schwierigkeit: {cluster.difficultyBaseline}/10
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
