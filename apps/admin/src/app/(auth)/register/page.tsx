"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
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

    if (!name || !email || !password || !confirmPassword) {
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

    if (!acceptTerms) {
      setError("Bitte akzeptiere die Nutzungsbedingungen");
      return;
    }

    try {
      await register(name, email, password);
    } catch {
      setError("Registrierung fehlgeschlagen. Bitte versuche es erneut.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Registrieren</CardTitle>
        <CardDescription>
          Erstelle ein Konto für das Admin Portal
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
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Max Mustermann"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="max@example.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
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
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="text-sm font-normal text-muted-foreground cursor-pointer leading-tight"
            >
              Ich akzeptiere die{" "}
              <Link href="#" className="text-primary hover:underline">
                Nutzungsbedingungen
              </Link>{" "}
              und{" "}
              <Link href="#" className="text-primary hover:underline">
                Datenschutzrichtlinie
              </Link>
            </Label>
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
                Registrieren...
              </>
            ) : (
              "Registrieren"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Bereits ein Konto?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Anmelden
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
