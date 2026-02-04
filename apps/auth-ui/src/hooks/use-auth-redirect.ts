"use client";

import { useSearchParams } from "next/navigation";

// Allowed redirect hosts
const ALLOWED_HOSTS = [
  "localhost",
  "mindforge-hub.de",
  "dnd.mindforge-hub.de",
  "admin.mindforge-hub.de",
];

// Known client IDs for template customization
export const VALID_CLIENT_IDS = [
  "mindforge-admin",
  "dungeons-and-diplomas",
] as const;

export type ClientId = (typeof VALID_CLIENT_IDS)[number];

export interface AuthParams {
  redirectUri: string;
  clientId: ClientId;
}

export interface AuthParamsError {
  type: "missing_redirect_uri" | "missing_client_id" | "invalid_redirect_uri" | "invalid_client_id";
  message: string;
}

/**
 * Hook to handle auth redirect_uri and client_id parameters
 * Both parameters are MANDATORY
 */
export function useAuthRedirect() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get("redirect_uri");
  const clientId = searchParams.get("client_id");

  /**
   * Validate the auth parameters
   * Returns either valid params or an error
   */
  const validateParams = (): { params: AuthParams } | { error: AuthParamsError } => {
    // Check redirect_uri
    if (!redirectUri) {
      return {
        error: {
          type: "missing_redirect_uri",
          message: "Parameter 'redirect_uri' ist erforderlich",
        },
      };
    }

    // Check client_id
    if (!clientId) {
      return {
        error: {
          type: "missing_client_id",
          message: "Parameter 'client_id' ist erforderlich",
        },
      };
    }

    // Validate client_id
    if (!VALID_CLIENT_IDS.includes(clientId as ClientId)) {
      return {
        error: {
          type: "invalid_client_id",
          message: `Ungültige client_id: ${clientId}`,
        },
      };
    }

    // Validate redirect_uri
    try {
      const url = new URL(redirectUri);

      const isAllowed = ALLOWED_HOSTS.some(
        (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
      );

      if (!isAllowed) {
        return {
          error: {
            type: "invalid_redirect_uri",
            message: `Redirect zu ${url.hostname} ist nicht erlaubt`,
          },
        };
      }

      return {
        params: {
          redirectUri,
          clientId: clientId as ClientId,
        },
      };
    } catch {
      // Invalid URL format
      return {
        error: {
          type: "invalid_redirect_uri",
          message: "Ungültiges URL-Format für redirect_uri",
        },
      };
    }
  };

  /**
   * Redirect to target URL with token
   */
  const redirectWithToken = (token: string): void => {
    if (!redirectUri) return;

    const separator = redirectUri.includes("?") ? "&" : "?";
    const targetUrl = `${redirectUri}${separator}token=${encodeURIComponent(token)}`;

    window.location.href = targetUrl;
  };

  /**
   * Redirect without token (for errors, etc.)
   */
  const redirectWithoutToken = (): void => {
    if (!redirectUri) return;
    window.location.href = redirectUri;
  };

  /**
   * Build a URL preserving redirect_uri and client_id
   */
  const buildUrl = (path: string): string => {
    const params = new URLSearchParams();
    if (redirectUri) params.set("redirect_uri", redirectUri);
    if (clientId) params.set("client_id", clientId);

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  return {
    redirectUri,
    clientId: clientId as ClientId | null,
    validateParams,
    redirectWithToken,
    redirectWithoutToken,
    buildUrl,
  };
}
