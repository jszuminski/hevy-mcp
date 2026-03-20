import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createHevyClient } from "./client.js";
import { registerExerciseTools } from "./tools/exercises.js";
import { registerFolderTools } from "./tools/folders.js";
import { registerRoutineTools } from "./tools/routines.js";
import { registerUserTools } from "./tools/user.js";
import { registerWorkoutTools } from "./tools/workouts.js";

function getApiKey(): string {
  const apiKey = process.env.HEVY_API_KEY;
  if (!apiKey) {
    console.error("HEVY_API_KEY environment variable is required.");
    console.error("Get your API key at https://hevy.com/settings?developer (requires Hevy Pro).");
    process.exit(1);
  }
  return apiKey;
}

async function main(): Promise<void> {
  const apiKey = getApiKey();
  const client = createHevyClient(apiKey);

  const server = new McpServer({
    name: "hevy",
    version: "1.0.0",
  });

  registerWorkoutTools(server, client);
  registerRoutineTools(server, client);
  registerExerciseTools(server, client);
  registerFolderTools(server, client);
  registerUserTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
