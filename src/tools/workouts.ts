import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../client.js";

export function registerWorkoutTools(server: McpServer, client: HevyClient): void {
  server.tool(
    "list_workouts",
    "Get a paginated list of workouts. Returns workout details including exercises and sets.",
    {
      page: z.number().int().min(1).default(1).describe("Page number (must be 1 or greater)"),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Number of items per page (max 10)"),
    },
    async ({ page, pageSize }) => {
      const { data, error } = await client.GET("/v1/workouts", {
        params: { query: { page, pageSize } },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error listing workouts: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_workout",
    "Get a single workout's complete details by its ID, including all exercises and sets.",
    {
      workoutId: z.string().describe("The ID of the workout to retrieve"),
    },
    async ({ workoutId }) => {
      const { data, error } = await client.GET("/v1/workouts/{workoutId}", {
        params: { path: { workoutId } },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error getting workout: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_workout_count",
    "Get the total number of workouts on the account.",
    {},
    async () => {
      const { data, error } = await client.GET("/v1/workouts/count");

      if (error) {
        return {
          content: [
            { type: "text", text: `Error getting workout count: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_workout_events",
    "Get a paginated list of workout events (updates or deletes) since a given date. Useful for syncing changes.",
    {
      page: z.number().int().min(1).default(1).describe("Page number (must be 1 or greater)"),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(10)
        .default(5)
        .describe("Number of items per page (max 10)"),
      since: z
        .string()
        .default("1970-01-01T00:00:00Z")
        .describe("ISO 8601 date to get events since"),
    },
    async ({ page, pageSize, since }) => {
      const { data, error } = await client.GET("/v1/workouts/events", {
        params: { query: { page, pageSize, since } },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error getting workout events: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_workout",
    "Create a new workout with exercises and sets. Weights are in kilograms. Set types: warmup, normal, failure, dropset. RPE values: 6, 7, 7.5, 8, 8.5, 9, 9.5, 10.",
    {
      title: z.string().describe("The title of the workout"),
      description: z.string().nullable().optional().describe("A description for the workout"),
      start_time: z.string().describe("ISO 8601 timestamp of when the workout started"),
      end_time: z.string().describe("ISO 8601 timestamp of when the workout ended"),
      is_private: z.boolean().default(false).describe("Whether the workout is private"),
      exercises: z
        .array(
          z.object({
            exercise_template_id: z.string().describe("The ID of the exercise template"),
            superset_id: z
              .number()
              .int()
              .nullable()
              .optional()
              .describe("Superset ID, null if not in a superset"),
            notes: z.string().nullable().optional().describe("Notes for this exercise"),
            sets: z.array(
              z.object({
                type: z
                  .enum(["warmup", "normal", "failure", "dropset"])
                  .describe("The type of set"),
                weight_kg: z.number().nullable().optional().describe("Weight in kilograms"),
                reps: z.number().int().nullable().optional().describe("Number of repetitions"),
                distance_meters: z
                  .number()
                  .int()
                  .nullable()
                  .optional()
                  .describe("Distance in meters"),
                duration_seconds: z
                  .number()
                  .int()
                  .nullable()
                  .optional()
                  .describe("Duration in seconds"),
                rpe: z
                  .union([
                    z.literal(6),
                    z.literal(7),
                    z.literal(7.5),
                    z.literal(8),
                    z.literal(8.5),
                    z.literal(9),
                    z.literal(9.5),
                    z.literal(10),
                  ])
                  .nullable()
                  .optional()
                  .describe("Rating of Perceived Exertion (6, 7, 7.5, 8, 8.5, 9, 9.5, or 10)"),
                custom_metric: z
                  .number()
                  .nullable()
                  .optional()
                  .describe("Custom metric (steps/floors for stair machines)"),
              }),
            ),
          }),
        )
        .describe("Array of exercises with their sets"),
    },
    async ({ title, description, start_time, end_time, is_private, exercises }) => {
      const { data, error } = await client.POST("/v1/workouts", {
        body: {
          workout: {
            title,
            description,
            start_time,
            end_time,
            is_private,
            exercises,
          },
        },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error creating workout: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "update_workout",
    "Update an existing workout. Provide the full workout data (exercises and sets) as it will replace the existing workout.",
    {
      workoutId: z.string().describe("The ID of the workout to update"),
      title: z.string().describe("The title of the workout"),
      description: z.string().nullable().optional().describe("A description for the workout"),
      start_time: z.string().describe("ISO 8601 timestamp of when the workout started"),
      end_time: z.string().describe("ISO 8601 timestamp of when the workout ended"),
      exercises: z
        .array(
          z.object({
            exercise_template_id: z.string().describe("The ID of the exercise template"),
            superset_id: z.number().int().nullable().optional().describe("Superset ID"),
            notes: z.string().nullable().optional().describe("Notes for this exercise"),
            sets: z.array(
              z.object({
                type: z
                  .enum(["warmup", "normal", "failure", "dropset"])
                  .describe("The type of set"),
                weight_kg: z.number().nullable().optional().describe("Weight in kilograms"),
                reps: z.number().int().nullable().optional().describe("Number of repetitions"),
                distance_meters: z
                  .number()
                  .int()
                  .nullable()
                  .optional()
                  .describe("Distance in meters"),
                duration_seconds: z
                  .number()
                  .int()
                  .nullable()
                  .optional()
                  .describe("Duration in seconds"),
                rpe: z
                  .union([
                    z.literal(6),
                    z.literal(7),
                    z.literal(7.5),
                    z.literal(8),
                    z.literal(8.5),
                    z.literal(9),
                    z.literal(9.5),
                    z.literal(10),
                  ])
                  .nullable()
                  .optional()
                  .describe("Rating of Perceived Exertion (6, 7, 7.5, 8, 8.5, 9, 9.5, or 10)"),
                custom_metric: z
                  .number()
                  .nullable()
                  .optional()
                  .describe("Custom metric (steps/floors)"),
              }),
            ),
          }),
        )
        .describe("Array of exercises with their sets"),
    },
    async ({ workoutId, title, description, start_time, end_time, exercises }) => {
      const { data, error } = await client.PUT("/v1/workouts/{workoutId}", {
        params: { path: { workoutId } },
        body: {
          workout: {
            title,
            description,
            start_time,
            end_time,
            exercises,
          },
        },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error updating workout: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
