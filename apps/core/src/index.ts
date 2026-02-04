import { createApp } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./db/database.js";

// Initialize database and start server
async function main() {
  // Initialize database schema
  await initializeDatabase();

  const app = createApp();

  console.log(`
╔════════════════════════════════════════╗
║     MindForge Core API                 ║
║     Port: ${config.PORT}                          ║
║     Env: ${config.NODE_ENV.padEnd(22)}║
╚════════════════════════════════════════╝
`);

  return {
    port: config.PORT,
    fetch: app.fetch,
  };
}

export default await main();
