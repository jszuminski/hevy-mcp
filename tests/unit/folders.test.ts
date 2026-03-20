import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerFolderTools } from "../../src/tools/folders.js";
import { createMockClient, createTestHarness, getTextContent, mockSuccess } from "../helpers.js";

describe("folder tools", () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  afterEach(async () => {
    await cleanup();
  });

  describe("list_routine_folders", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(
          mockSuccess({
            page: 1,
            page_count: 1,
            routine_folders: [
              { id: 1, index: 0, title: "Push Pull Legs", updated_at: "2024-01-01T00:00:00Z" },
              { id: 2, index: 1, title: "Accessories", updated_at: "2024-01-01T00:00:00Z" },
            ],
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerFolderTools, mockHevyClient));
    });

    it("returns routine folders", async () => {
      const result = await client.callTool({ name: "list_routine_folders", arguments: {} });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.routine_folders).toHaveLength(2);
      expect(parsed.routine_folders[0].title).toBe("Push Pull Legs");
    });
  });

  describe("get_routine_folder", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        GET: vi.fn().mockReturnValue(mockSuccess({ id: 1, index: 0, title: "Push Pull Legs" })),
      });
      ({ client, cleanup } = await createTestHarness(registerFolderTools, mockHevyClient));
    });

    it("returns a single folder", async () => {
      const result = await client.callTool({
        name: "get_routine_folder",
        arguments: { folderId: "1" },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("Push Pull Legs");
    });
  });

  describe("create_routine_folder", () => {
    beforeEach(async () => {
      const mockHevyClient = createMockClient({
        POST: vi.fn().mockReturnValue(
          mockSuccess({
            id: 3,
            index: 0,
            title: "New Folder",
            created_at: "2024-06-01T00:00:00Z",
            updated_at: "2024-06-01T00:00:00Z",
          }),
        ),
      });
      ({ client, cleanup } = await createTestHarness(registerFolderTools, mockHevyClient));
    });

    it("creates a folder", async () => {
      const result = await client.callTool({
        name: "create_routine_folder",
        arguments: { title: "New Folder" },
      });
      const parsed = JSON.parse(getTextContent(result));
      expect(parsed.title).toBe("New Folder");
      expect(parsed.index).toBe(0);
    });
  });
});
