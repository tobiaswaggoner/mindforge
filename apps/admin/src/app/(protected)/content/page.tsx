"use client";

import { useState } from "react";
import { PageContainer, Breadcrumb, MobileSheet } from "@/components/layout";
import { ContentProvider, useContent } from "@/contexts/content-context";
import {
  ContentFilter,
  ContentSidebar,
  ContentDetail,
} from "@/components/content";
import { GenerateModal } from "@/components/generate/generate-modal";
import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";
import type { TaskType } from "@/types/tasks";

function ContentPageInner() {
  const { selection, getSubjectById, getClusterById, getVariantById } = useContent();
  const [generateModal, setGenerateModal] = useState<{
    isOpen: boolean;
    taskType: TaskType;
    contextId: string;
    contextName: string;
  } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGenerateClick = (
    type: "clusters" | "variants" | "answers",
    contextId: string
  ) => {
    let contextName = "";
    let taskType: TaskType;

    if (type === "clusters") {
      taskType = "generate_clusters";
      const subject = getSubjectById(contextId);
      contextName = subject?.name || "Unbekannt";
    } else if (type === "variants") {
      taskType = "generate_variants";
      const cluster = getClusterById(contextId);
      contextName = cluster?.topic || "Unbekannt";
    } else {
      taskType = "regenerate_answers";
      const variant = getVariantById(contextId);
      contextName = variant?.questionText.slice(0, 50) + "..." || "Unbekannt";
    }

    setGenerateModal({
      isOpen: true,
      taskType,
      contextId,
      contextName,
    });
  };

  // Build breadcrumb items
  const breadcrumbItems = [];
  if (selection?.subjectId) {
    const subject = getSubjectById(selection.subjectId);
    breadcrumbItems.push({
      label: subject?.name || "Fach",
      href: selection.type === "subject" ? undefined : "/content",
    });
  }
  if (selection?.clusterId) {
    const cluster = getClusterById(selection.clusterId);
    breadcrumbItems.push({
      label: cluster?.topic || "Cluster",
      href: selection.type === "cluster" ? undefined : "/content",
    });
  }
  if (selection?.variantId) {
    const variant = getVariantById(selection.variantId);
    breadcrumbItems.push({
      label:
        variant?.questionText.slice(0, 30) +
          (variant?.questionText && variant.questionText.length > 30
            ? "..."
            : "") || "Variante",
    });
  }

  // Handle mobile sidebar item click
  const handleMobileSidebarSelect = () => {
    setMobileMenuOpen(false);
  };

  return (
    <PageContainer className="p-0 md:p-0 lg:p-0">
      <div className="flex h-[calc(100vh-3.5rem-4rem)] md:h-[calc(100vh-3.5rem)] flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-4 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Fächer anzeigen</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold md:text-2xl">Content Editor</h1>
                {breadcrumbItems.length > 0 && (
                  <Breadcrumb items={breadcrumbItems} className="mt-1" />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Neues Fach</span>
                <span className="sm:hidden">Neu</span>
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <ContentFilter />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden w-72 flex-shrink-0 md:block">
            <ContentSidebar />
          </div>

          {/* Detail View */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <ContentDetail onGenerateClick={handleGenerateClick} />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Sheet */}
      <MobileSheet
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        title="Fächer"
      >
        <div onClick={handleMobileSidebarSelect}>
          <ContentSidebar />
        </div>
      </MobileSheet>

      {/* Generate Modal */}
      {generateModal && (
        <GenerateModal
          isOpen={generateModal.isOpen}
          onClose={() => setGenerateModal(null)}
          taskType={generateModal.taskType}
          contextId={generateModal.contextId}
          contextName={generateModal.contextName}
        />
      )}
    </PageContainer>
  );
}

export default function ContentPage() {
  return (
    <ContentProvider>
      <ContentPageInner />
    </ContentProvider>
  );
}
