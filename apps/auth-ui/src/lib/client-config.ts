import type { ClientId } from "@/hooks/use-auth-redirect";

export interface ClientConfig {
  /** Display name of the application */
  appName: string;
  /** Background image URL (optional) */
  backgroundImage?: string;
  /** Primary color for accents (optional, defaults to orange) */
  primaryColor?: string;
}

/**
 * Client configurations for templating
 * Each client_id maps to its visual configuration
 */
export const clientConfigs: Record<ClientId, ClientConfig> = {
  "mindforge-admin": {
    appName: "MindForge",
    // No background image - uses default dark background
  },
  "dungeons-and-diplomas": {
    appName: "Dungeons & Diplomas",
    backgroundImage: "/backgrounds/dnd-background.png",
  },
};

/**
 * Get client config by client_id
 * Returns default MindForge config if client_id is invalid
 */
export function getClientConfig(clientId: ClientId | null): ClientConfig {
  if (!clientId || !clientConfigs[clientId]) {
    return clientConfigs["mindforge-admin"];
  }
  return clientConfigs[clientId];
}
