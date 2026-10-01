export interface FxService {
  id: string;
  name: string;
  service: string;
  host: string;
  port: number;
  addresses: string[];
  api: string;
  scheme: string;
  path: string;
}
const fields = [
  "id",
  "name",
  "service",
  "host",
  "api",
  "scheme",
  "path",
] as const;
export function parseDiscovery(value: unknown): FxService[] {
  if (
    !value ||
    typeof value !== "object" ||
    !("data" in value) ||
    !Array.isArray(value.data)
  )
    throw new Error("Unexpected discovery response");
  return value.data.map((item: unknown) => {
    if (!item || typeof item !== "object")
      throw new Error("Invalid service in discovery response");
    const row = item as Record<string, unknown>;
    if (
      !fields.every((key) => typeof row[key] === "string") ||
      !Number.isInteger(row.port) ||
      Number(row.port) < 1 ||
      Number(row.port) > 65535 ||
      !Array.isArray(row.addresses) ||
      !row.addresses.every((address) => typeof address === "string")
    )
      throw new Error("Invalid service in discovery response");
    return row as unknown as FxService;
  });
}
export const serviceKey = (service: FxService) =>
  `${service.service}:${service.id}`;
