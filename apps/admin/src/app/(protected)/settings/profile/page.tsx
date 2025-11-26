"use client";

import { useState } from "react";
import { PageContainer, PageHeader, Breadcrumb } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { Save, Mail, User } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isEditing, setIsEditing] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    // Mock save
    toast.success("Profil aktualisiert", {
      description: "Deine Änderungen wurden gespeichert.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setIsEditing(false);
  };

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Einstellungen", href: "/settings" },
          { label: "Profil" },
        ]}
        className="mb-6"
      />

      <PageHeader
        title="Profil"
        description="Verwalte deine persönlichen Informationen"
      />

      <div className="max-w-2xl space-y-6">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profilbild</CardTitle>
            <CardDescription>
              Dein Avatar wird in der Navigation und bei Kommentaren angezeigt
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm" disabled>
                Bild hochladen
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG oder GIF. Maximal 2MB.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Persönliche Informationen</CardTitle>
            <CardDescription>
              Dein Name und deine E-Mail-Adresse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Name
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dein Name"
                />
              ) : (
                <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                  {name || "Nicht angegeben"}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                E-Mail-Adresse
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="deine@email.de"
                />
              ) : (
                <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                  {email || "Nicht angegeben"}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-muted-foreground">Rolle</Label>
              <p className="text-sm py-2 px-3 rounded-md bg-muted/50 capitalize">
                {user?.role || "Benutzer"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Abbrechen
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Profil bearbeiten
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
