"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authApi, ApiError } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { Button } from "@/components/ui/button";
import { AuthCard, AuthCardHeader, AuthCardFooter, Alert } from "@/components/auth/auth-card";
import { BadRequestError } from "@/components/auth/auth-error";
import { Mail } from "lucide-react";

function VerifyEmailPendingContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { validateParams, buildUrl } = useAuthRedirect();
  const email = searchParams.get("email") || "";

  // Validate required parameters
  const validation = validateParams();
  if ("error" in validation) {
    return <BadRequestError message={validation.error.message} />;
  }

  const handleResend = async () => {
    if (!email) {
      setError("Keine Email-Adresse gefunden");
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authApi.resendVerification({ email });
      setMessage("Verifizierungs-Email erneut gesendet!");
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

  return (
    <AuthCard>
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-orange-500" />
        </div>
        <AuthCardHeader
          title="Prüfe deine Emails"
          description="Wir haben dir eine Verifizierungs-Email gesendet"
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-center">
        <p className="text-slate-300 text-sm">
          Wir haben eine Email an{" "}
          <span className="font-semibold text-slate-100">{email || "deine Email-Adresse"}</span>{" "}
          gesendet.
        </p>
        <p className="text-slate-400 text-sm mt-2">
          Klicke auf den Link in der Email, um deinen Account zu aktivieren.
        </p>
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleResend}
        isLoading={isLoading}
        disabled={!email}
      >
        Email erneut senden
      </Button>

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

export default function VerifyEmailPendingPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Laden...</div>}>
      <VerifyEmailPendingContent />
    </Suspense>
  );
}
