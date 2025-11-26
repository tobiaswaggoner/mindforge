"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, FileSearch, Settings } from "lucide-react";

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Schnellaktionen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/content">
            <Plus className="mr-2 h-4 w-4" />
            Neues Fach anlegen
          </Link>
        </Button>
        <Button asChild className="w-full justify-start">
          <Link href="/content">
            <Sparkles className="mr-2 h-4 w-4" />
            Fragen generieren
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full justify-start">
          <Link href="/content">
            <FileSearch className="mr-2 h-4 w-4" />
            Content durchsuchen
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Einstellungen
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
