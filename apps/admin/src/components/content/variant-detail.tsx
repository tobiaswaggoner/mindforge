"use client";

import { useState } from "react";
import {
  Pencil,
  Trash2,
  Sparkles,
  Save,
  X,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import type { QuestionVariant, Answer } from "@/types/content";
import { cn } from "@/lib/utils";

interface VariantDetailProps {
  variant: QuestionVariant;
  onGenerateClick?: () => void;
}

export function VariantDetail({ variant, onGenerateClick }: VariantDetailProps) {
  const {
    updateVariant,
    deleteVariant,
    updateAnswer,
    deleteAnswer,
    getAnswersByVariant,
    getClusterById,
    setSelection,
  } = useContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    questionText: variant.questionText,
  });

  const answers = getAnswersByVariant(variant.id);
  const cluster = getClusterById(variant.clusterId);

  const handleSave = () => {
    updateVariant(variant.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ questionText: variant.questionText });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteVariant(variant.id);
    if (cluster) {
      setSelection({
        type: "cluster",
        subjectId: cluster.subjectId,
        clusterId: cluster.id,
      });
    }
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
          cluster &&
          setSelection({
            type: "cluster",
            subjectId: cluster.subjectId,
            clusterId: cluster.id,
          })
        }
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Zurück zu {cluster?.topic || "Cluster"}
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1 flex-1 mr-4">
            <CardTitle className="text-lg text-muted-foreground">
              Frage-Variante
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Erstellt: {formatDate(variant.createdAt)} • Aktualisiert:{" "}
              {formatDate(variant.updatedAt)}
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
                      <AlertDialogTitle>Variante löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dadurch werden auch alle {answers.length} zugehörigen
                        Antworten unwiderruflich gelöscht.
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
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editData.questionText}
              onChange={(e) =>
                setEditData((prev) => ({
                  ...prev,
                  questionText: e.target.value,
                }))
              }
              rows={3}
              className="text-lg"
            />
          ) : (
            <p className="text-lg font-medium">{variant.questionText}</p>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button onClick={onGenerateClick} variant="outline" className="w-full sm:w-auto">
        <Sparkles className="mr-2 h-4 w-4" />
        Antworten neu generieren
      </Button>

      {/* Answers List */}
      <div className="space-y-3">
        <h3 className="font-semibold">Antworten ({answers.length})</h3>
        {answers.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Check className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Noch keine Antworten vorhanden
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={onGenerateClick}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Antworten generieren
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {answers.map((answer) => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                onUpdate={(data) => updateAnswer(answer.id, data)}
                onDelete={() => deleteAnswer(answer.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface AnswerCardProps {
  answer: Answer;
  onUpdate: (data: Partial<Answer>) => void;
  onDelete: () => void;
}

function AnswerCard({ answer, onUpdate, onDelete }: AnswerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(answer.answerText);

  const handleSave = () => {
    onUpdate({ answerText: editText });
    setIsEditing(false);
  };

  return (
    <Card
      className={cn(
        "transition-colors",
        answer.isCorrect && "border-green-500/50 bg-green-500/5"
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-3">
          <Switch
            checked={answer.isCorrect}
            onCheckedChange={(checked) => onUpdate({ isCorrect: checked })}
          />
          <span className="text-xs text-muted-foreground w-16">
            {answer.isCorrect ? "Richtig" : "Falsch"}
          </span>
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none py-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p
              className="cursor-pointer hover:text-primary transition-colors"
              onDoubleClick={() => setIsEditing(true)}
              title="Doppelklick zum Bearbeiten"
            >
              {answer.answerText}
            </p>
          )}
        </div>

        {answer.distractorType && !isEditing && (
          <Badge variant="outline" className="text-xs">
            {answer.distractorType}
          </Badge>
        )}

        {!isEditing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Antwort löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Diese Antwort wird unwiderruflich gelöscht.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
