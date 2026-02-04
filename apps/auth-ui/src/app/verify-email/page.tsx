"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { AuthCard, AuthCardHeader, Alert } from "@/components/auth/auth-card";
import { BadRequestError } from "@/components/auth/auth-error";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { validateParams, buildUrl } = useAuthRedirect();
  const token = searchParams.get("token");

  // Validate required parameters
  const validation = validateParams();
  if ("error" in validation) {
    return <BadRequestError message={validation.error.message} />;
  }

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Kein Verifizierungstoken gefunden");
      return;
    }

    const verifyEmail = async () => {
      try {
        await authApi.verifyEmail({ token });
        setStatus("success");
      } catch (err) {
        setStatus("error");
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Ein unerwarteter Fehler ist aufgetreten");
        }
      }
    };

    verifyEmail();
  }, [token]);

  if (status === "loading") {
    return (
      <AuthCard>
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Email wird verifiziert...</p>
        </div>
      </AuthCard>
    );
  }

  if (status === "error") {
    return (
      <AuthCard>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <AuthCardHeader
            title="Verifizierung fehlgeschlagen"
            description={error || "Der Link ist ungültig oder abgelaufen"}
          />
        </div>

        <Alert variant="error">
          {error || "Bitte fordere einen neuen Verifizierungslink an."}
        </Alert>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href={buildUrl("/login")}>Zur Anmeldung</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <AuthCardHeader
          title="Email bestätigt!"
          description="Dein Account ist jetzt aktiviert"
        />
      </div>

      <Alert variant="success">
        Du kannst dich jetzt mit deiner Email-Adresse anmelden.
      </Alert>

      <Button asChild className="w-full">
        <Link href={buildUrl("/login")}>Jetzt anmelden</Link>
      </Button>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Laden...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
