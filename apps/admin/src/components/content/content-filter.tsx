"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContent } from "@/contexts/content-context";

export function ContentFilter() {
  const { subjects, filters, setFilters } = useContent();

  const handleClearFilters = () => {
    setFilters({ search: "", taskId: null, subjectId: null });
  };

  const hasActiveFilters =
    filters.search || filters.taskId || filters.subjectId;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Subject Filter */}
      <Select
        value={filters.subjectId || "all"}
        onValueChange={(value) =>
          setFilters({ subjectId: value === "all" ? null : value })
        }
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Alle Fächer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Fächer</SelectItem>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="shrink-0"
        >
          <X className="mr-1 h-4 w-4" />
          Filter löschen
        </Button>
      )}
    </div>
  );
}
