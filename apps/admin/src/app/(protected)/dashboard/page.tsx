"use client";

import { PageContainer, PageHeader } from "@/components/layout";
import {
  ActiveTasksCard,
  RecentChangesCard,
  QuickStatsCard,
  QuickActionsCard,
} from "@/components/dashboard";
import {
  mockActiveTasks,
  mockRecentChanges,
  mockQuickStats,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Willkommen zurück! Hier ist eine Übersicht deiner Content Engine."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Tasks - spans 2 columns on lg */}
        <ActiveTasksCard tasks={mockActiveTasks} />

        {/* Quick Stats - 1 column */}
        <QuickStatsCard stats={mockQuickStats} />

        {/* Quick Actions - 1 column */}
        <QuickActionsCard />

        {/* Recent Changes - spans 2 columns on lg, full width below */}
        <RecentChangesCard changes={mockRecentChanges} />
      </div>
    </PageContainer>
  );
}
