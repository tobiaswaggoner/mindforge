"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, KeyRound, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Bitte alle Felder ausfüllen");
      return;
    }

    if (!isPasswordValid) {
      setError("Das Passwort erfüllt nicht alle Anforderungen");
      return;
    }

    if (!passwordsMatch) {
      setError("Die Passwörter stimmen nicht überein");
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, we'd get the token from the URL
      await resetPassword("mock-token", password);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Neues Passwort</CardTitle>
        <CardDescription>
          Gib dein neues Passwort ein, um dein Konto zu sichern.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {password.length > 0 && (
              <div className="mt-2 space-y-1 text-xs">
                <PasswordCheck
                  valid={passwordChecks.length}
                  label="Mindestens 8 Zeichen"
                />
                <PasswordCheck
                  valid={passwordChecks.uppercase}
                  label="Ein Großbuchstabe"
                />
                <PasswordCheck
                  valid={passwordChecks.lowercase}
                  label="Ein Kleinbuchstabe"
                />
                <PasswordCheck
                  valid={passwordChecks.number}
                  label="Eine Zahl"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-destructive">
                Die Passwörter stimmen nicht überein
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isPasswordValid || !passwordsMatch}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Passwort speichern"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Link abgelaufen?{" "}
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Neuen Link anfordern
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordCheck({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        valid ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
      )}
    >
      {valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );
}
