import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../client";

const routineSetSchema = z.object({
  type: z.enum(["warmup", "normal", "failure", "dropset"]).describe("The type of set"),
  weight_kg: z.number().nullable().optional().describe("Weight in kilograms"),
  reps: z.number().int().nullable().optional().describe("Number of repetitions"),
  distance_meters: z.number().int().nullable().optional().describe("Distance in meters"),
  duration_seconds: z.number().int().nullable().optional().describe("Duration in seconds"),
  custom_metric: z.number().nullable().optional().describe("Custom metric (steps/floors)"),
  rep_range: z
    .object({
      start: z.number().describe("Starting rep count"),
      end: z.number().describe("Ending rep count"),
    })
    .nullable()
    .optional()
    .describe("Rep range for the set"),
});

const routineExerciseSchema = z.object({
  exercise_template_id: z.string().describe("The ID of the exercise template"),
  superset_id: z.number().int().nullable().optional().describe("Superset ID"),
  rest_seconds: z
    .number()
    .int()
    .nullable()
    .optional()
    .describe("Rest time in seconds between sets"),
  notes: z.string().nullable().optional().describe("Notes for this exercise"),
  sets: z.array(routineSetSchema),
});

export function registerRoutineTools(server: McpServer, client: HevyClient): void {
  server.tool(
    "list_routines",
    "Get a paginated list of workout routines.",
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
      const { data, error } = await client.GET("/v1/routines", {
        params: { query: { page, pageSize } },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error listing routines: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_routine",
    "Get a single routine's complete details by its ID.",
    {
      routineId: z.string().describe("The ID of the routine to retrieve"),
    },
    async ({ routineId }) => {
      const { data, error } = await client.GET("/v1/routines/{routineId}", {
        params: { path: { routineId } },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error getting routine: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_routine",
    "Create a new workout routine with exercises and sets. Include rest times and rep ranges.",
    {
      title: z.string().describe("The title of the routine"),
      folder_id: z
        .number()
        .nullable()
        .optional()
        .describe("Folder ID to add the routine to. Null for default folder."),
      notes: z.string().optional().describe("Additional notes for the routine"),
      exercises: z.array(routineExerciseSchema).describe("Array of exercises with their sets"),
    },
    async ({ title, folder_id, notes, exercises }) => {
      const { data, error } = await client.POST("/v1/routines", {
        body: {
          routine: {
            title,
            folder_id,
            notes,
            exercises,
          },
        },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error creating routine: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "update_routine",
    "Update an existing routine. Provide the full routine data as it will replace the existing one.",
    {
      routineId: z.string().describe("The ID of the routine to update"),
      title: z.string().describe("The title of the routine"),
      notes: z.string().nullable().optional().describe("Additional notes for the routine"),
      exercises: z.array(routineExerciseSchema).describe("Array of exercises with their sets"),
    },
    async ({ routineId, title, notes, exercises }) => {
      const { data, error } = await client.PUT("/v1/routines/{routineId}", {
        params: { path: { routineId } },
        body: {
          routine: {
            title,
            notes,
            exercises,
          },
        },
      });

      if (error) {
        return {
          content: [{ type: "text", text: `Error updating routine: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
