"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginRequestSchema, type LoginRequest } from "@mindforge/shared-types";
import { authApi, ApiError } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useClient } from "@/contexts/client-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthCard, AuthCardHeader, AuthCardFooter, Alert } from "@/components/auth/auth-card";
import { BadRequestError } from "@/components/auth/auth-error";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateParams, redirectWithToken, buildUrl } = useAuthRedirect();
  const { config } = useClient();

  // Validate required parameters
  const validation = validateParams();
  if ("error" in validation) {
    return <BadRequestError message={validation.error.message} />;
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login(data);
      redirectWithToken(response.accessToken);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Ein unerwarteter Fehler ist aufgetreten");
      }
      setIsLoading(false);
    }
  };

  return (
    <AuthCard>
      <AuthCardHeader
        title="Willkommen zurück"
        description={`Melde dich bei deinem ${config.appName} Account an`}
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

        <div>
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setValue("rememberMe", checked === true)}
            />
            <span className="text-slate-300">Angemeldet bleiben</span>
          </label>
          <Link
            href={buildUrl("/forgot-password")}
            className="text-orange-500 hover:text-orange-400 transition-colors duration-150"
          >
            Passwort vergessen?
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Anmelden
        </Button>
      </form>

      <AuthCardFooter>
        Noch kein Konto?{" "}
        <Link
          href={buildUrl("/register")}
          className="text-orange-500 hover:text-orange-400 font-medium transition-colors duration-150"
        >
          Jetzt registrieren
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Laden...</div>}>
      <LoginForm />
    </Suspense>
  );
}
