"use client";

import { createContext, useContext, ReactNode } from "react";
import type { ClientConfig } from "@/lib/client-config";
import { getClientConfig } from "@/lib/client-config";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

interface ClientContextType {
  config: ClientConfig;
  hasBackground: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { clientId } = useAuthRedirect();
  const config = getClientConfig(clientId);
  const hasBackground = !!config.backgroundImage;

  return (
    <ClientContext.Provider value={{ config, hasBackground }}>
      {/* Background layer */}
      {hasBackground && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${config.backgroundImage})` }}
        >
          {/* Dark overlay for better readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}
      {children}
    </ClientContext.Provider>
  );
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    // Return default config if not in provider (e.g., error pages)
    return {
      config: getClientConfig(null),
      hasBackground: false,
    };
  }
  return context;
}
