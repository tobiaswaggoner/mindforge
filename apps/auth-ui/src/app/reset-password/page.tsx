"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordRequestSchema } from "@mindforge/shared-types";
import { authApi, ApiError } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, AuthCardHeader, Alert } from "@/components/auth/auth-card";
import { BadRequestError } from "@/components/auth/auth-error";
import { CheckCircle, XCircle } from "lucide-react";

// Extended schema with password confirmation
const resetPasswordFormSchema = resetPasswordRequestSchema
  .extend({
    confirmPassword: z.string().min(1, "Bitte Passwort bestätigen"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const { validateParams, buildUrl } = useAuthRedirect();
  const token = searchParams.get("token");

  // Validate required parameters
  const validation = validateParams();
  if ("error" in validation) {
    return <BadRequestError message={validation.error.message} />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      token: token || "",
      password: "",
      confirmPassword: "",
    },
  });

  // No token provided
  if (!token) {
    return (
      <AuthCard>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <AuthCardHeader
            title="Ungültiger Link"
            description="Der Reset-Link ist ungültig oder abgelaufen"
          />
        </div>

        <Alert variant="error">
          Bitte fordere einen neuen Link an.
        </Alert>

        <Button asChild className="w-full">
          <Link href={buildUrl("/forgot-password")}>Neuen Link anfordern</Link>
        </Button>
      </AuthCard>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({
        token: data.token,
        password: data.password,
      });
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
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <AuthCardHeader
            title="Passwort geändert!"
            description="Dein Passwort wurde erfolgreich zurückgesetzt"
          />
        </div>

        <Alert variant="success">
          Du kannst dich jetzt mit deinem neuen Passwort anmelden.
        </Alert>

        <Button asChild className="w-full">
          <Link href={buildUrl("/login")}>Jetzt anmelden</Link>
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthCardHeader
        title="Neues Passwort setzen"
        description="Wähle ein neues sicheres Passwort"
      />

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register("token")} />

        <div>
          <Label htmlFor="password">Neues Passwort</Label>
          <Input
            id="password"
            type="password"
            placeholder="Mindestens 8 Zeichen"
            autoComplete="new-password"
            error={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Passwort wiederholen"
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Passwort ändern
        </Button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Laden...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
