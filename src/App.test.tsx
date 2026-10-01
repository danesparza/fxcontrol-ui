import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
const service = {
  id: "stage:3030",
  name: "Stage audio",
  service: "fxaudio",
  host: "stage.local.",
  port: 3030,
  addresses: ["192.168.1.10"],
  api: "v1",
  scheme: "http",
  path: "/v1",
};
function response(data: unknown) {
  return { ok: true, json: async () => data } as Response;
}
afterEach(() => vi.unstubAllGlobals());
describe("workspace discovery", () => {
  it("loads discovery, filters services, and inspects advertised metadata", async () => {
    const fetch = vi.fn().mockResolvedValue(response({ data: [service] }));
    vi.stubGlobal("fetch", fetch);
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /Stage audio/ }));
    expect(screen.getByText("192.168.1.10")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      "/v1/discover/",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Search services" }), {
      target: { value: "missing" },
    });
    expect(
      screen.queryByRole("button", { name: /Stage audio/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/No services match/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play sequence" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Stop all" })).toBeDisabled();
  });
  it("retains a stale snapshot on failure and recovers on refresh", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(response({ data: [service] }))
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce(response({ data: [] }));
    vi.stubGlobal("fetch", fetch);
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: /Stage audio/ }));
    fireEvent.click(screen.getByRole("button", { name: "Refresh discovery" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Showing the last successful snapshot",
    );
    expect(
      screen.getByRole("button", { name: /Stage audio/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByText("Waiting for your services"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Service no longer discovered"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("aborts a pending request when the workspace unmounts", async () => {
    const fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal("fetch", fetch);
    const view = render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const signal = fetch.mock.calls[0][1].signal as AbortSignal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });
});
