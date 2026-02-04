import * as React from "react";
import { cn } from "@/lib/utils";
import { useClient } from "@/contexts/client-context";

interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  const { hasBackground } = useClient();

  return (
    <div
      className={cn(
        "w-full max-w-md",
        "rounded-xl border border-slate-700",
        "shadow-2xl shadow-black/50",
        "p-6 sm:p-8",
        // Semi-transparent background when there's a background image
        hasBackground
          ? "bg-slate-800/80 backdrop-blur-sm"
          : "bg-slate-800",
        className
      )}
    >
      {children}
    </div>
  );
}

interface AuthCardHeaderProps {
  title: string;
  description?: string;
}

export function AuthCardHeader({ title, description }: AuthCardHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-50 mb-2">{title}</h1>
      {description && (
        <p className="text-slate-400 text-sm">{description}</p>
      )}
    </div>
  );
}

interface AuthCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCardFooter({ children, className }: AuthCardFooterProps) {
  return (
    <div className={cn("text-center text-slate-400 text-sm mt-8", className)}>
      {children}
    </div>
  );
}

interface AlertProps {
  variant: "error" | "success" | "warning" | "info";
  children: React.ReactNode;
  className?: string;
}

const alertVariants = {
  error: "bg-red-500/10 border-red-500/50 text-red-400",
  success: "bg-green-500/10 border-green-500/50 text-green-400",
  warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
  info: "bg-blue-500/10 border-blue-500/50 text-blue-400",
};

const alertIcons = {
  error: "❌",
  success: "✓",
  warning: "⚠️",
  info: "ℹ️",
};

export function Alert({ variant, children, className }: AlertProps) {
  return (
    <div
      className={cn(
        "border px-4 py-3 rounded-lg text-sm mb-6",
        alertVariants[variant],
        className
      )}
      role="alert"
    >
      <span className="mr-2">{alertIcons[variant]}</span>
      {children}
    </div>
  );
}
