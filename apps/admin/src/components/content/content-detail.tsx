"use client";

import { useContent } from "@/contexts/content-context";
import { SubjectDetail } from "./subject-detail";
import { ClusterDetail } from "./cluster-detail";
import { VariantDetail } from "./variant-detail";
import { BookOpen } from "lucide-react";

interface ContentDetailProps {
  onGenerateClick?: (
    type: "clusters" | "variants" | "answers",
    contextId: string
  ) => void;
}

export function ContentDetail({ onGenerateClick }: ContentDetailProps) {
  const { selection, getSubjectById, getClusterById, getVariantById } =
    useContent();

  if (!selection) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-8">
        <div className="rounded-full bg-muted p-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">
          Wähle ein Element aus
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          Klicke auf ein Fach, Cluster oder eine Variante in der Seitenleiste,
          um Details anzuzeigen und zu bearbeiten.
        </p>
      </div>
    );
  }

  if (selection.type === "variant" && selection.variantId) {
    const variant = getVariantById(selection.variantId);
    if (!variant) return <div>Variante nicht gefunden</div>;
    return (
      <VariantDetail
        variant={variant}
        onGenerateClick={() =>
          onGenerateClick?.("answers", variant.id)
        }
      />
    );
  }

  if (selection.type === "cluster" && selection.clusterId) {
    const cluster = getClusterById(selection.clusterId);
    if (!cluster) return <div>Cluster nicht gefunden</div>;
    return (
      <ClusterDetail
        cluster={cluster}
        onGenerateClick={() =>
          onGenerateClick?.("variants", cluster.id)
        }
      />
    );
  }

  if (selection.type === "subject" && selection.subjectId) {
    const subject = getSubjectById(selection.subjectId);
    if (!subject) return <div>Fach nicht gefunden</div>;
    return (
      <SubjectDetail
        subject={subject}
        onGenerateClick={() =>
          onGenerateClick?.("clusters", subject.id)
        }
      />
    );
  }

  return <div>Unbekannte Auswahl</div>;
}
