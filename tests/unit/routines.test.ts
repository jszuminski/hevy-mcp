import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerRoutineTools } from "../../src/tools/routines";
import {
  createMockClient,
  createTestHarness,
  getTextContent,
  mockError,
  mockSuccess,
} from "../helpers";

describe("routine tools", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    await cleanup();
  });

  describe("list_routines", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(
          mockSuccess({
            page: 1,
            page_count: 2,
            routines: [{ id: "r1", title: "Upper Body", exercises: [] }],
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerRoutineTools, mockHevyClient));
    });

    it("returns paginated routines", async () => {
      const result = await client.callTool({ name: "list_routines", arguments: {} });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.routines).toHaveLength(1);
      expect(parsed.routines[0].title).toBe("Upper Body");
    });
  });

  describe("get_routine", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(
          mockSuccess({
            routine: {
              id: "r1",
              title: "Pull Day",
              exercises: [
                {
                  index: 0,
                  title: "Pull Up",
                  exercise_template_id: "ex2",
                  rest_seconds: "90",
                  sets: [{ index: 0, type: "normal", reps: 8 }],
                },
              ],
            },
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerRoutineTools, mockHevyClient));
    });

    it("returns routine details", async () => {
      const result = await client.callTool({ name: "get_routine", arguments: { routineId: "r1" } });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.routine.title).toBe("Pull Day");
      expect(parsed.routine.exercises[0].rest_seconds).toBe("90");
    });
  });

  describe("create_routine", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        POST: vi
          .fn()
          .mockReturnValue(mockSuccess({ id: "r-new", title: "New Routine", exercises: [] })),
      });
      ({ client, cleanup } = await createTestHarness(registerRoutineTools, mockHevyClient));
    });

    it("creates a routine", async () => {
      const result = await client.callTool({
        name: "create_routine",
        arguments: {
          title: "New Routine",
          exercises: [
            {
              exercise_template_id: "ex1",
              rest_seconds: 60,
              sets: [{ type: "normal", weight_kg: 50, reps: 12 }],
            },
          ],
        },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("New Routine");
    });
  });

  describe("create_routine error", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        POST: vi.fn().mockReturnValue(mockError("Routine limit exceeded")),
      });
      ({ client, cleanup } = await createTestHarness(registerRoutineTools, mockHevyClient));
    });

    it("returns error on failure", async () => {
      const result = await client.callTool({
        name: "create_routine",
        arguments: {
          title: "Too Many Routines",
          exercises: [],
        },
      });
      const text = getTextContent(result);
      expect(text).toContain("Error creating routine");
    });
  });

  describe("update_routine", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        PUT: vi
          .fn()
          .mockReturnValue(mockSuccess({ id: "r1", title: "Updated Routine", exercises: [] })),
      });
      ({ client, cleanup } = await createTestHarness(registerRoutineTools, mockHevyClient));
    });

    it("updates a routine", async () => {
      const result = await client.callTool({
        name: "update_routine",
        arguments: {
          routineId: "r1",
          title: "Updated Routine",
          exercises: [],
        },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("Updated Routine");
    });
  });
});
