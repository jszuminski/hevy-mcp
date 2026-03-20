import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerUserTools } from "../../src/tools/user.js";
import {
  createMockClient,
  createTestHarness,
  getTextContent,
  mockError,
  mockSuccess,
} from "../helpers.js";

describe("user tools", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    await cleanup();
  });

  describe("get_user_info", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(
          mockSuccess({
            data: {
              id: "user-123",
              name: "John Doe",
              url: "https://hevy.com/user/john",
            },
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerUserTools, mockHevyClient));
    });

    it("returns user profile info", async () => {
      const result = await client.callTool({ name: "get_user_info", arguments: {} });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.data.name).toBe("John Doe");
      expect(parsed.data.url).toBe("https://hevy.com/user/john");
    });
  });

  describe("get_user_info error", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockError("User not found")),
      });
      ({ client, cleanup } = await createTestHarness(registerUserTools, mockHevyClient));
    });

    it("returns error message on failure", async () => {
      const result = await client.callTool({ name: "get_user_info", arguments: {} });
      const text = getTextContent(result);
      expect(text).toContain("Error getting user info");
    });
  });
});
