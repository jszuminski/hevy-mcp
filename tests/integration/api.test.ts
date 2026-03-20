import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createHevyClient } from "../../src/client";
import { registerExerciseTools } from "../../src/tools/exercises";
import { registerFolderTools } from "../../src/tools/folders";
import { registerRoutineTools } from "../../src/tools/routines";
import { registerUserTools } from "../../src/tools/user";
import { registerWorkoutTools } from "../../src/tools/workouts";

const API_KEY = process.env.HEVY_API_KEY;

const describeIntegration = API_KEY ? describe : describe.skip;

describeIntegration("Hevy API integration tests", () => {
  let client: Client;
  let server: McpServer;

  beforeAll(async () => {
    if (!API_KEY) return;

    const hevyClient = createHevyClient(API_KEY);
    server = new McpServer({ name: "hevy-integration", version: "1.0.0" });

    registerWorkoutTools(server, hevyClient);
    registerRoutineTools(server, hevyClient);
    registerExerciseTools(server, hevyClient);
    registerFolderTools(server, hevyClient);
    registerUserTools(server, hevyClient);

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "integration-test", version: "1.0.0" });

    await server.connect(serverTransport);
    await client.connect(clientTransport);
  });

  afterAll(async () => {
    await client?.close();
    await server?.close();
  });

  it("get_user_info returns user data", async () => {
    const result = await client.callTool({ name: "get_user_info", arguments: {} });
    const content = result.content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content) || content.length === 0) return;
    const first = content[0];
    if (!first || typeof first !== "object" || !("text" in first)) return;
    const parsed = JSON.parse(first.text as string);
    expect(parsed.data).toBeDefined();
    expect(parsed.data.name).toBeTypeOf("string");
  });

  it("list_workouts returns paginated data", async () => {
    const result = await client.callTool({
      name: "list_workouts",
      arguments: { page: 1, pageSize: 2 },
    });
    const content = result.content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content) || content.length === 0) return;
    const first = content[0];
    if (!first || typeof first !== "object" || !("text" in first)) return;
    const parsed = JSON.parse(first.text as string);
    expect(parsed.page).toBe(1);
    expect(parsed.workouts).toBeDefined();
    expect(Array.isArray(parsed.workouts)).toBe(true);
  });

  it("get_workout_count returns a number", async () => {
    const result = await client.callTool({ name: "get_workout_count", arguments: {} });
    const content = result.content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content) || content.length === 0) return;
    const first = content[0];
    if (!first || typeof first !== "object" || !("text" in first)) return;
    const parsed = JSON.parse(first.text as string);
    expect(parsed.workout_count).toBeTypeOf("number");
  });

  it("list_exercise_templates returns templates", async () => {
    const result = await client.callTool({
      name: "list_exercise_templates",
      arguments: { page: 1, pageSize: 5 },
    });
    const content = result.content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content) || content.length === 0) return;
    const first = content[0];
    if (!first || typeof first !== "object" || !("text" in first)) return;
    const parsed = JSON.parse(first.text as string);
    expect(parsed.exercise_templates).toBeDefined();
    expect(Array.isArray(parsed.exercise_templates)).toBe(true);
  });

  it("list_routines returns paginated data", async () => {
    const result = await client.callTool({
      name: "list_routines",
      arguments: { page: 1, pageSize: 5 },
    });
    const content = result.content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content) || content.length === 0) return;
    const first = content[0];
    if (!first || typeof first !== "object" || !("text" in first)) return;
    const parsed = JSON.parse(first.text as string);
    expect(parsed.page).toBe(1);
    expect(parsed.routines).toBeDefined();
  });

  it("list_routine_folders returns folders", async () => {
    const result = await client.callTool({
      name: "list_routine_folders",
      arguments: { page: 1, pageSize: 5 },
    });
    const content = result.content;
    expect(Array.isArray(content)).toBe(true);
    if (!Array.isArray(content) || content.length === 0) return;
    const first = content[0];
    if (!first || typeof first !== "object" || !("text" in first)) return;
    const parsed = JSON.parse(first.text as string);
    expect(parsed.routine_folders).toBeDefined();
  });
});
