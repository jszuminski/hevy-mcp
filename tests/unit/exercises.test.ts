import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerExerciseTools } from "../../src/tools/exercises.js";
import {
  createMockClient,
  createTestHarness,
  getTextContent,
  mockError,
  mockSuccess,
} from "../helpers.js";

describe("exercise tools", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    await cleanup();
  });

  describe("list_exercise_templates", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(
          mockSuccess({
            page: 1,
            page_count: 10,
            exercise_templates: [
              {
                id: "ex1",
                title: "Bench Press (Barbell)",
                type: "weight_reps",
                primary_muscle_group: "chest",
                secondary_muscle_groups: ["triceps", "shoulders"],
                is_custom: false,
              },
            ],
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerExerciseTools, mockHevyClient));
    });

    it("returns exercise templates", async () => {
      const result = await client.callTool({
        name: "list_exercise_templates",
        arguments: { pageSize: 10 },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.exercise_templates).toHaveLength(1);
      expect(parsed.exercise_templates[0].title).toBe("Bench Press (Barbell)");
      expect(parsed.exercise_templates[0].primary_muscle_group).toBe("chest");
    });
  });

  describe("get_exercise_template", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(
          mockSuccess({
            id: "ex1",
            title: "Squat (Barbell)",
            type: "weight_reps",
            primary_muscle_group: "quadriceps",
            secondary_muscle_groups: ["glutes", "hamstrings"],
            is_custom: false,
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerExerciseTools, mockHevyClient));
    });

    it("returns a single exercise template", async () => {
      const result = await client.callTool({
        name: "get_exercise_template",
        arguments: { exerciseTemplateId: "ex1" },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("Squat (Barbell)");
      expect(parsed.type).toBe("weight_reps");
    });
  });

  describe("create_exercise_template", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        POST: vi.fn().mockReturnValue(mockSuccess({ id: 123 })),
      });
      ({ client, cleanup } = await createTestHarness(registerExerciseTools, mockHevyClient));
    });

    it("creates a custom exercise template", async () => {
      const result = await client.callTool({
        name: "create_exercise_template",
        arguments: {
          title: "Cable Crunch",
          exercise_type: "weight_reps",
          equipment_category: "machine",
          muscle_group: "abdominals",
          other_muscles: ["forearms"],
        },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.id).toBe(123);
    });

    it("handles limit exceeded error", async () => {
      const mockHevyClient = createMockClient({
        POST: vi.fn().mockReturnValue(mockError("exceeds-custom-exercise-limit")),
      });
      const harness = await createTestHarness(registerExerciseTools, mockHevyClient);
      client = harness.client;
      const originalCleanup = cleanup;
      cleanup = async () => {
        await harness.cleanup();
        await originalCleanup();
      };

      const result = await client.callTool({
        name: "create_exercise_template",
        arguments: {
          title: "Too Many",
          exercise_type: "weight_reps",
          equipment_category: "none",
          muscle_group: "other",
        },
      });
      const text = getTextContent(result);
      expect(text).toContain("Error creating exercise template");
    });
  });

  describe("get_exercise_history", () => {
    const mockHistory = {
      exercise_history: [
        {
          workout_id: "w1",
          workout_title: "Pull Day",
          workout_start_time: "2024-01-01T08:00:00Z",
          workout_end_time: "2024-01-01T09:00:00Z",
          exercise_template_id: "ex1",
          weight_kg: 100,
          reps: 5,
          set_type: "normal",
        },
        {
          workout_id: "w2",
          workout_title: "Pull Day",
          workout_start_time: "2024-01-08T08:00:00Z",
          workout_end_time: "2024-01-08T09:00:00Z",
          exercise_template_id: "ex1",
          weight_kg: 105,
          reps: 5,
          set_type: "normal",
        },
      ],
    };

    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockSuccess(mockHistory)),
      });
      ({ client, cleanup } = await createTestHarness(registerExerciseTools, mockHevyClient));
    });

    it("returns exercise history", async () => {
      const result = await client.callTool({
        name: "get_exercise_history",
        arguments: { exerciseTemplateId: "ex1" },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.exercise_history).toHaveLength(2);
      expect(parsed.exercise_history[1].weight_kg).toBe(105);
    });

    it("accepts date range filters", async () => {
      const result = await client.callTool({
        name: "get_exercise_history",
        arguments: {
          exerciseTemplateId: "ex1",
          start_date: "2024-01-01T00:00:00Z",
          end_date: "2024-12-31T23:59:59Z",
        },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.exercise_history).toBeDefined();
    });
  });
});
