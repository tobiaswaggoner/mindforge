"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordRequestSchema, type ForgotPasswordRequest } from "@mindforge/shared-types";
import { authApi, ApiError } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, AuthCardHeader, AuthCardFooter, Alert } from "@/components/auth/auth-card";
import { BadRequestError } from "@/components/auth/auth-error";
import { Mail } from "lucide-react";

function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { validateParams, buildUrl } = useAuthRedirect();

  // Validate required parameters
  const validation = validateParams();
  if ("error" in validation) {
    return <BadRequestError message={validation.error.message} />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordRequest>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.forgotPassword(data);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthCard>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-orange-500" />
          </div>
          <AuthCardHeader
            title="Email gesendet"
            description="Falls ein Account mit dieser Email existiert, haben wir dir einen Link zum Zurücksetzen geschickt."
          />
        </div>

        <Alert variant="info">
          Der Link ist 1 Stunde gültig. Prüfe auch deinen Spam-Ordner.
        </Alert>

        <Button asChild variant="secondary" className="w-full">
          <Link href={buildUrl("/login")}>Zurück zur Anmeldung</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Passwort vergessen?"
        description="Gib deine Email-Adresse ein und wir senden dir einen Link zum Zurücksetzen."
      />

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="deine@email.de"
            autoComplete="email"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Link senden
        </Button>
      </form>

      <AuthCardFooter>
        <Link
          href={buildUrl("/login")}
          className="text-orange-500 hover:text-orange-400 font-medium transition-colors duration-150"
        >
          Zurück zur Anmeldung
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Laden...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
