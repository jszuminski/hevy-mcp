import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../client.js";

const muscleGroupEnum = z.enum([
  "abdominals",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "calves",
  "glutes",
  "abductors",
  "adductors",
  "lats",
  "upper_back",
  "traps",
  "lower_back",
  "chest",
  "cardio",
  "neck",
  "full_body",
  "other",
]);

const exerciseTypeEnum = z.enum([
  "weight_reps",
  "reps_only",
  "bodyweight_reps",
  "bodyweight_assisted_reps",
  "duration",
  "weight_duration",
  "distance_duration",
  "short_distance_weight",
]);

const equipmentCategoryEnum = z.enum([
  "none",
  "barbell",
  "dumbbell",
  "kettlebell",
  "machine",
  "plate",
  "resistance_band",
  "suspension",
  "other",
]);

export function registerExerciseTools(server: McpServer, client: HevyClient): void {
  server.tool(
    "list_exercise_templates",
    "Get a paginated list of exercise templates available on the account. Includes both built-in and custom exercises.",
    {
      page: z.number().int().min(1).default(1).describe("Page number (must be 1 or greater)"),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10)
        .describe("Number of items per page (max 100)"),
    },
    async ({ page, pageSize }) => {
      const { data, error } = await client.GET("/v1/exercise_templates", {
        params: { query: { page, pageSize } },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error listing exercise templates: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_exercise_template",
    "Get a single exercise template by its ID.",
    {
      exerciseTemplateId: z.string().describe("The ID of the exercise template"),
    },
    async ({ exerciseTemplateId }) => {
      const { data, error } = await client.GET("/v1/exercise_templates/{exerciseTemplateId}", {
        params: { path: { exerciseTemplateId } },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error getting exercise template: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_exercise_template",
    "Create a new custom exercise template.",
    {
      title: z.string().describe("The title of the exercise"),
      exercise_type: exerciseTypeEnum.describe("The type of exercise"),
      equipment_category: equipmentCategoryEnum.describe("The equipment category"),
      muscle_group: muscleGroupEnum.describe("The primary muscle group"),
      other_muscles: z.array(muscleGroupEnum).optional().describe("Secondary muscle groups"),
    },
    async ({ title, exercise_type, equipment_category, muscle_group, other_muscles }) => {
      const { data, error } = await client.POST("/v1/exercise_templates", {
        body: {
          exercise: {
            title,
            exercise_type,
            equipment_category,
            muscle_group,
            other_muscles,
          },
        },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error creating exercise template: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_exercise_history",
    "Get the workout history for a specific exercise template. Optionally filter by date range.",
    {
      exerciseTemplateId: z.string().describe("The ID of the exercise template"),
      start_date: z
        .string()
        .optional()
        .describe("Optional start date filter (ISO 8601 format, e.g. 2024-01-01T00:00:00Z)"),
      end_date: z
        .string()
        .optional()
        .describe("Optional end date filter (ISO 8601 format, e.g. 2024-12-31T23:59:59Z)"),
    },
    async ({ exerciseTemplateId, start_date, end_date }) => {
      const { data, error } = await client.GET("/v1/exercise_history/{exerciseTemplateId}", {
        params: {
          path: { exerciseTemplateId },
          query: { start_date, end_date },
        },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error getting exercise history: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
