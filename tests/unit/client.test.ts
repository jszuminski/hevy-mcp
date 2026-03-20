import { describe, expect, it } from "vitest";
import { createHevyClient } from "../../src/client.js";

describe("createHevyClient", () => {
  it("creates a client with the provided API key", () => {
    const client = createHevyClient("test-api-key");
    expect(client).toBeDefined();
    expect(client.GET).toBeTypeOf("function");
    expect(client.POST).toBeTypeOf("function");
    expect(client.PUT).toBeTypeOf("function");
  });
});
