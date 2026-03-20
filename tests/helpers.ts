import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { HevyClient } from "../src/client.js";

type MockResponse<T> = {
  data: T;
  error: undefined;
  response: Response;
};

type MockErrorResponse = {
  data: undefined;
  error: { error?: string };
  response: Response;
};

export function createMockClient(
  overrides: Partial<Record<"GET" | "POST" | "PUT", (...args: unknown[]) => unknown>> = {},
): HevyClient {
  const defaultHandler = () =>
    Promise.resolve({
      data: undefined,
      error: { error: "not mocked" },
      response: new Response(),
    });

  return {
    GET: overrides.GET ?? defaultHandler,
    POST: overrides.POST ?? defaultHandler,
    PUT: overrides.PUT ?? defaultHandler,
  } as unknown as HevyClient;
}

export function mockSuccess<T>(data: T): Promise<MockResponse<T>> {
  return Promise.resolve({
    data,
    error: undefined,
    response: new Response(),
  });
}

export function mockError(message = "Something went wrong"): Promise<MockErrorResponse> {
  return Promise.resolve({
    data: undefined,
    error: { error: message },
    response: new Response(),
  });
}

export async function createTestHarness(
  registerTools: (server: McpServer, client: HevyClient) => void,
  mockClient: HevyClient,
): Promise<{ client: Client; cleanup: () => Promise<void> }> {
  const server = new McpServer({ name: "test-server", version: "1.0.0" });
  registerTools(server, mockClient);

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "1.0.0" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return {
    client,
    cleanup: async () => {
      await client.close();
      await server.close();
    },
  };
}

export function getTextContent(result: Awaited<ReturnType<Client["callTool"]>>): string {
  const content = result.content;
  if (!Array.isArray(content) || content.length === 0) {
    throw new Error("Expected content array with at least one item");
  }
  const first = content[0];
  if (!first || typeof first !== "object" || !("text" in first)) {
    throw new Error("Expected text content");
  }
  return first.text as string;
}
