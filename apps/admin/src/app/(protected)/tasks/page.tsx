"use client";

import { PageContainer, PageHeader } from "@/components/layout";
import { TaskList } from "@/components/tasks";

export default function TasksPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        description="Überwache und verwalte AI-Generierungs-Jobs"
      />
      <TaskList />
    </PageContainer>
  );
}
