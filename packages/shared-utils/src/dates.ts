/**
 * Get current ISO timestamp
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * Get ISO timestamp for a date in the future
 */
export function addTime(
  date: Date | string,
  amount: number,
  unit: "seconds" | "minutes" | "hours" | "days"
): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date);

  const multipliers = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  };

  d.setTime(d.getTime() + amount * multipliers[unit]);
  return d.toISOString();
}

/**
 * Check if a date/timestamp has expired
 */
export function isExpired(date: Date | string | null | undefined): boolean {
  if (!date) return true;
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Parse a date string or return null if invalid
 */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a date for display (German locale)
 */
export function formatDateDE(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a datetime for display (German locale)
 */
export function formatDateTimeDE(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
