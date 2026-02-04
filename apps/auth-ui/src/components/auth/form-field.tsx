"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  helpText?: string;
  disabled?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  error,
  helpText,
  disabled,
  autoComplete,
  value,
  onChange,
  onBlur,
  className,
}: FormFieldProps) {
  const id = React.useId();

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        error={!!error}
        disabled={disabled}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
      {helpText && !error && (
        <p className="text-xs text-slate-400 mt-1">{helpText}</p>
      )}
    </div>
  );
}

// Re-export for convenience in forms using react-hook-form
export { Input, Label };
