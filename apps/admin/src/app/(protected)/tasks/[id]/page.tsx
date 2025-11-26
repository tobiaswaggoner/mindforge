"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout";
import { useTasks } from "@/contexts/task-context";
import { TaskDetail } from "@/components/tasks";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getTaskById } = useTasks();
  const task = getTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <PageContainer>
      <TaskDetail task={task} />
    </PageContainer>
  );
}
