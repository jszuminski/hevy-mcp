import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerWorkoutTools } from "../../src/tools/workouts";
import {
  createMockClient,
  createTestHarness,
  getTextContent,
  mockError,
  mockSuccess,
} from "../helpers";

describe("workout tools", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    await cleanup();
  });

  describe("list_workouts", () => {
    const mockWorkouts = {
      page: 1,
      page_count: 3,
      workouts: [
        {
          id: "w1",
          title: "Morning Workout",
          start_time: "2024-01-01T08:00:00Z",
          end_time: "2024-01-01T09:00:00Z",
          exercises: [],
        },
      ],
    };

    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockSuccess(mockWorkouts)),
      });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("returns paginated workouts", async () => {
      const result = await client.callTool({
        name: "list_workouts",
        arguments: { page: 1, pageSize: 5 },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.workouts).toHaveLength(1);
      expect(parsed.workouts[0].title).toBe("Morning Workout");
      expect(parsed.page).toBe(1);
      expect(parsed.page_count).toBe(3);
    });
  });

  describe("list_workouts error", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockError("API error")),
      });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("returns error message on failure", async () => {
      const result = await client.callTool({ name: "list_workouts", arguments: {} });
      const text = getTextContent(result);
      expect(text).toContain("Error listing workouts");
    });
  });

  describe("get_workout", () => {
    const mockWorkout = {
      id: "w1",
      title: "Leg Day",
      start_time: "2024-01-01T08:00:00Z",
      end_time: "2024-01-01T09:00:00Z",
      exercises: [
        {
          index: 0,
          title: "Squat",
          exercise_template_id: "ex1",
          sets: [{ index: 0, type: "normal", weight_kg: 100, reps: 5 }],
        },
      ],
    };

    beforeEach(async () => {
      const getMock = vi.fn().mockReturnValue(mockSuccess(mockWorkout));
      const mockHevyClient = createMockClient({ GET: getMock });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("returns workout details", async () => {
      const result = await client.callTool({ name: "get_workout", arguments: { workoutId: "w1" } });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("Leg Day");
      expect(parsed.exercises).toHaveLength(1);
      expect(parsed.exercises[0].sets[0].weight_kg).toBe(100);
    });
  });

  describe("get_workout_count", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockSuccess({ workout_count: 42 })),
      });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("returns the workout count", async () => {
      const result = await client.callTool({ name: "get_workout_count", arguments: {} });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.workout_count).toBe(42);
    });
  });

  describe("get_workout_events", () => {
    const mockEvents = {
      page: 1,
      page_count: 1,
      events: [
        { type: "updated", workout: { id: "w1", title: "Updated Workout" } },
        { type: "deleted", id: "w2", deleted_at: "2024-01-01T00:00:00Z" },
      ],
    };

    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockSuccess(mockEvents)),
      });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("returns workout events", async () => {
      const result = await client.callTool({
        name: "get_workout_events",
        arguments: { since: "2024-01-01T00:00:00Z" },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.events).toHaveLength(2);
      expect(parsed.events[0].type).toBe("updated");
      expect(parsed.events[1].type).toBe("deleted");
    });
  });

  describe("create_workout", () => {
    const createdWorkout = {
      id: "new-w1",
      title: "Push Day",
      start_time: "2024-01-01T08:00:00Z",
      end_time: "2024-01-01T09:00:00Z",
      exercises: [],
    };

    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        POST: vi.fn().mockReturnValue(mockSuccess(createdWorkout)),
      });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("creates a workout and returns it", async () => {
      const result = await client.callTool({
        name: "create_workout",
        arguments: {
          title: "Push Day",
          start_time: "2024-01-01T08:00:00Z",
          end_time: "2024-01-01T09:00:00Z",
          exercises: [
            {
              exercise_template_id: "ex1",
              sets: [{ type: "normal", weight_kg: 80, reps: 10 }],
            },
          ],
        },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.id).toBe("new-w1");
      expect(parsed.title).toBe("Push Day");
    });
  });

  describe("update_workout", () => {
    const updatedWorkout = {
      id: "w1",
      title: "Updated Push Day",
      start_time: "2024-01-01T08:00:00Z",
      end_time: "2024-01-01T09:30:00Z",
      exercises: [],
    };

    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        PUT: vi.fn().mockReturnValue(mockSuccess(updatedWorkout)),
      });
      ({ client, cleanup } = await createTestHarness(registerWorkoutTools, mockHevyClient));
    });

    it("updates a workout and returns it", async () => {
      const result = await client.callTool({
        name: "update_workout",
        arguments: {
          workoutId: "w1",
          title: "Updated Push Day",
          start_time: "2024-01-01T08:00:00Z",
          end_time: "2024-01-01T09:30:00Z",
          exercises: [],
        },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("Updated Push Day");
    });
  });
});
