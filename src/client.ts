import createClient, { type Client } from "openapi-fetch";
import type { paths } from "./generated/hevy-api";

const BASE_URL = "https://api.hevyapp.com";

export type HevyClient = Client<paths>;

export function createHevyClient(apiKey: string): HevyClient {
  return createClient<paths>({
    baseUrl: BASE_URL,
    headers: {
      "api-key": apiKey,
    },
  });
}
