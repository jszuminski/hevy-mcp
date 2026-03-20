import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { HevyClient } from "../client.js";

export function registerFolderTools(server: McpServer, client: HevyClient): void {
  server.tool(
    "list_routine_folders",
    "Get a paginated list of routine folders.",
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
      const { data, error } = await client.GET("/v1/routine_folders", {
        params: { query: { page, pageSize } },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error listing routine folders: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_routine_folder",
    "Get a single routine folder by its ID.",
    {
      folderId: z.string().describe("The ID of the routine folder"),
    },
    async ({ folderId }) => {
      const { data, error } = await client.GET("/v1/routine_folders/{folderId}", {
        params: { path: { folderId } },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error getting routine folder: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "create_routine_folder",
    "Create a new routine folder. The folder will be created at index 0 and other folders will shift.",
    {
      title: z.string().describe("The title of the routine folder"),
    },
    async ({ title }) => {
      const { data, error } = await client.POST("/v1/routine_folders", {
        body: {
          routine_folder: {
            title,
          },
        },
      });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error creating routine folder: ${JSON.stringify(error)}` },
          ],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
