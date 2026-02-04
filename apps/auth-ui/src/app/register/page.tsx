"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerRequestSchema } from "@mindforge/shared-types";
import { authApi, ApiError } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { useClient } from "@/contexts/client-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard, AuthCardHeader, AuthCardFooter, Alert } from "@/components/auth/auth-card";
import { BadRequestError } from "@/components/auth/auth-error";

// Extended schema with password confirmation
const registerFormSchema = registerRequestSchema.extend({
  confirmPassword: z.string().min(1, "Bitte Passwort bestätigen"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { validateParams, buildUrl } = useAuthRedirect();
  const { config } = useClient();

  // Validate required parameters
  const validation = validateParams();
  if ("error" in validation) {
    return <BadRequestError message={validation.error.message} />;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register({
        email: data.email,
        password: data.password,
      });

      // Redirect to verification pending page
      router.push(buildUrl("/verify-email-pending") + `&email=${encodeURIComponent(data.email)}`);
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
        title="Account erstellen"
        description={`Registriere dich kostenlos bei ${config.appName}`}
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
          Registrieren
        </Button>
      </form>

      <AuthCardFooter>
        Bereits registriert?{" "}
        <Link
          href={buildUrl("/login")}
          className="text-orange-500 hover:text-orange-400 font-medium transition-colors duration-150"
        >
          Jetzt anmelden
        </Link>
      </AuthCardFooter>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Laden...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
