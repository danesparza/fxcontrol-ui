import { parseDiscovery } from "../mapper/discovery";
export async function getDiscovery(signal: AbortSignal) {
  const response = await fetch("/v1/discover/", {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok)
    throw new Error(`Discovery request failed (${response.status})`);
  return parseDiscovery(await response.json());
}
