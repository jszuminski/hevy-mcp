import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HevyClient } from "../client.js";

export function registerUserTools(server: McpServer, client: HevyClient): void {
  server.tool(
    "get_user_info",
    "Get the authenticated user's profile information (ID, name, and profile URL).",
    {},
    async () => {
      const { data, error } = await client.GET("/v1/user/info");

      if (error) {
        return {
          content: [{ type: "text", text: `Error getting user info: ${JSON.stringify(error)}` }],
        };
      }

      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    },
  );
}
