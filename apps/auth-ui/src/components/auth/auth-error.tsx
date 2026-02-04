import { AlertTriangle } from "lucide-react";

interface AuthErrorProps {
  statusCode: number;
  title: string;
  message: string;
}

export function AuthError({ statusCode, title, message }: AuthErrorProps) {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 shadow-2xl shadow-black/50">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="text-6xl font-bold text-red-500 mb-2">
          {statusCode}
        </div>

        <h1 className="text-xl font-semibold text-slate-100 mb-2">
          {title}
        </h1>

        <p className="text-slate-400 text-sm">
          {message}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            Bitte verwende den Login-Link deiner Anwendung.
          </p>
        </div>
      </div>
    </div>
  );
}

export function BadRequestError({ message }: { message: string }) {
  return (
    <AuthError
      statusCode={400}
      title="Ungültige Anfrage"
      message={message}
    />
  );
}

export function NotFoundError() {
  return (
    <AuthError
      statusCode={404}
      title="Seite nicht gefunden"
      message="Diese Seite existiert nicht."
    />
  );
}
