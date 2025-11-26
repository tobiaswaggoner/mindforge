"use client";

import { useState } from "react";
import { ChevronRight, BookOpen, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContent } from "@/contexts/content-context";
import { cn } from "@/lib/utils";

interface ContentSidebarProps {
  onGenerateClick?: (type: "subject" | "cluster", id?: string) => void;
}

export function ContentSidebar({ onGenerateClick }: ContentSidebarProps) {
  const { subjects, selection, setSelection, getClustersBySubject, filters } =
    useContent();
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set()
  );

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  const filteredSubjects = subjects.filter((subject) => {
    if (filters.subjectId && subject.id !== filters.subjectId) return false;
    if (
      filters.search &&
      !subject.name.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="flex h-full flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold">Fächer</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onGenerateClick?.("subject")}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Neues Fach</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredSubjects.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Keine Fächer gefunden
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSubjects.map((subject) => {
                const isExpanded = expandedSubjects.has(subject.id);
                const isSelected =
                  selection?.type === "subject" &&
                  selection.subjectId === subject.id;
                const clusters = getClustersBySubject(subject.id);

                return (
                  <div key={subject.id}>
                    <button
                      onClick={() => {
                        setSelection({
                          type: "subject",
                          subjectId: subject.id,
                        });
                        if (clusters.length > 0) {
                          toggleSubject(subject.id);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      {clusters.length > 0 && (
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      )}
                      {clusters.length === 0 && <div className="w-4" />}
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                      <span className="flex-1 truncate">{subject.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {clusters.length}
                      </span>
                    </button>

                    {isExpanded && clusters.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1 border-l border-border pl-2">
                        {clusters.map((cluster) => {
                          const isClusterSelected =
                            selection?.type === "cluster" &&
                            selection.clusterId === cluster.id;

                          return (
                            <button
                              key={cluster.id}
                              onClick={() =>
                                setSelection({
                                  type: "cluster",
                                  subjectId: subject.id,
                                  clusterId: cluster.id,
                                })
                              }
                              className={cn(
                                "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                                isClusterSelected
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                              )}
                            >
                              <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="flex-1 truncate">
                                {cluster.topic}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
