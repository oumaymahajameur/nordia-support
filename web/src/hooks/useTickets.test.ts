import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "../api/client";
import type { Ticket } from "../types";
import { useTickets } from "./useTickets";

vi.mock("../api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/client")>();
  return { ...actual, api: { listTickets: vi.fn(), updateStatus: vi.fn() } };
});

const ticket: Ticket = {
  id: 1, title: "t", customer: "c", requester: "r", priority: "high",
  status: "in_progress", description: "d",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  vi.mocked(api.listTickets).mockReset();
  vi.mocked(api.listTickets).mockResolvedValue([ticket]);
  vi.mocked(api.updateStatus).mockReset();
});

async function setup() {
  const hook = renderHook(() => useTickets());
  await waitFor(() => expect(hook.result.current.state).toBe("ready"));
  return hook;
}

describe("useTickets.changeStatus", () => {
  it("updates the screen immediately, before the API answers", async () => {
    let resolve!: (t: Ticket) => void;
    vi.mocked(api.updateStatus).mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = await setup();

    let promise!: Promise<unknown>;
    act(() => { promise = result.current.changeStatus(1, "resolved"); });
    expect(result.current.tickets[0].status).toBe("resolved");

    await act(async () => { resolve({ ...ticket, status: "resolved" }); await promise; });
    expect(result.current.tickets[0].status).toBe("resolved");
  });

  it("rolls back and returns a clear message when the API answers 409", async () => {
    vi.mocked(api.updateStatus).mockRejectedValue(new ApiError(409, "conflict"));
    const { result } = await setup();

    let res: Awaited<ReturnType<typeof result.current.changeStatus>> | undefined;
    await act(async () => { res = await result.current.changeStatus(1, "waiting_customer"); });

    expect(result.current.tickets[0].status).toBe("in_progress");
    expect(res).toEqual({ ok: false, message: expect.stringContaining("resolved") });
  });

  it("rolls back on a server error (500)", async () => {
    vi.mocked(api.updateStatus).mockRejectedValue(new ApiError(500, "boom"));
    const { result } = await setup();

    await act(async () => { await result.current.changeStatus(1, "resolved"); });
    expect(result.current.tickets[0].status).toBe("in_progress");
  });

  it("ignores a second change on the same ticket while one is in flight", async () => {
    let resolve!: (t: Ticket) => void;
    vi.mocked(api.updateStatus).mockReturnValue(new Promise((r) => (resolve = r)));
    const { result } = await setup();

    let first!: Promise<unknown>;
    let second: Awaited<ReturnType<typeof result.current.changeStatus>> | undefined;
    await act(async () => {
      first = result.current.changeStatus(1, "resolved");
      second = await result.current.changeStatus(1, "waiting_customer");
    });

    expect(second).toEqual({ ok: false, message: expect.any(String) });
    expect(api.updateStatus).toHaveBeenCalledTimes(1);

    await act(async () => { resolve({ ...ticket, status: "resolved" }); await first; });
  });

  it("keeps the latest load when an older one answers last", async () => {
    let resolveSlow!: (t: Ticket[]) => void;
    vi.mocked(api.listTickets)
      .mockReset()
      .mockReturnValueOnce(new Promise((r) => (resolveSlow = r)))
      .mockResolvedValueOnce([{ ...ticket, title: "fresh" }]);

    const { result } = renderHook(() => useTickets());
    await act(async () => { await result.current.reload(); });
    await waitFor(() => expect(result.current.tickets[0]?.title).toBe("fresh"));

    await act(async () => { resolveSlow([{ ...ticket, title: "stale" }]); });
    expect(result.current.tickets[0].title).toBe("fresh");
  });
});