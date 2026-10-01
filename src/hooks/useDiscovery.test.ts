import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useDiscovery } from "./useDiscovery";
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("polls every 30 seconds and stops polling after unmount", async () => {
  vi.useFakeTimers();
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
  vi.stubGlobal("fetch", fetch);
  const hook = renderHook(useDiscovery);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(fetch).toHaveBeenCalledTimes(2);
  hook.unmount();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(fetch).toHaveBeenCalledTimes(2);
});
it("aborts a stalled request after ten seconds and exposes a retryable error", async () => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      (_url, { signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    ),
  );
  const { result } = renderHook(useDiscovery);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBe("Discovery request timed out");
});
