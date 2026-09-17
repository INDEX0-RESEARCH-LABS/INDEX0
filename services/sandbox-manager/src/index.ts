/**
 * Server Entrypoint — @index0/sandbox-manager
 */

import { createApp } from "./app.js";
import { config } from "./config.js";
import { ExecutionService } from "./services/execution.service.js";

const executionService = new ExecutionService();
const app = createApp(executionService);

const server = app.listen(config.port, config.host, () => {
  console.log(
    `[SandboxManager] Listening on http://${config.host}:${config.port} (Provider: ${executionService.getProviderName()})`
  );
});

// Graceful shutdown
function shutdown(signal: string) {
  console.log(`[SandboxManager] Received ${signal}, terminating gracefully...`);
  server.close(() => {
    console.log("[SandboxManager] Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { app, server };
