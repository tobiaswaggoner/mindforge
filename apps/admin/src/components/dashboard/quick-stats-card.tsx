"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Layers, FileText, CheckSquare } from "lucide-react";
import { type QuickStats } from "@/lib/mock-data/dashboard";

interface QuickStatsCardProps {
  stats: QuickStats;
}

const statItems = [
  {
    key: "subjects" as const,
    label: "Fächer",
    icon: BookOpen,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    key: "clusters" as const,
    label: "Cluster",
    icon: Layers,
    color: "text-purple-500 bg-purple-500/10",
  },
  {
    key: "variants" as const,
    label: "Varianten",
    icon: FileText,
    color: "text-green-500 bg-green-500/10",
  },
  {
    key: "answers" as const,
    label: "Antworten",
    icon: CheckSquare,
    color: "text-primary bg-primary/10",
  },
];

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export function QuickStatsCard({ stats }: QuickStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/30"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {formatNumber(stats[item.key])}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
