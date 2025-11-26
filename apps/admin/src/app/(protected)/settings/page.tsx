"use client";

import { useState } from "react";
import Link from "next/link";
import { PageContainer, PageHeader } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Bell, Globe, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [language, setLanguage] = useState("de");

  const handleSave = () => {
    toast.success("Einstellungen gespeichert");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Einstellungen"
        description="Konfiguriere dein Profil und Systemeinstellungen"
      />

      <div className="space-y-6 max-w-2xl">
        {/* Profile Link */}
        <Card className="cursor-pointer transition-colors hover:bg-accent/50">
          <Link href="/settings/profile">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Profil</p>
                  <p className="text-sm text-muted-foreground">
                    Name, E-Mail und Profilbild
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Benachrichtigungen</CardTitle>
            </div>
            <CardDescription>
              Verwalte, wie du über Aktivitäten informiert wirst
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalte Benachrichtigungen, wenn Tasks abgeschlossen sind
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">E-Mail-Benachrichtigungen</Label>
                <p className="text-sm text-muted-foreground">
                  Tägliche Zusammenfassung per E-Mail erhalten
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Sprache & Region</CardTitle>
            </div>
            <CardDescription>
              Anzeige- und Formatierungseinstellungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="language">Sprache</Label>
                <p className="text-sm text-muted-foreground">
                  Sprache der Benutzeroberfläche
                </p>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave}>Einstellungen speichern</Button>
        </div>
      </div>
    </PageContainer>
  );
}
