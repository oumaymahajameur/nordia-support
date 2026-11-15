import type { Status, Ticket } from "../types";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  status: number; // 0 = network unreachable
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(BASE + path, init);
  } catch {
    throw new ApiError(0, "Server unreachable. Check that the API is running.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? `Error ${res.status}`);
  return body as T;
}

// Reads (GET) are retried automatically: a 500 error may be temporary.
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      const retriable = e instanceof ApiError && (e.status === 0 || e.status >= 500);
      if (!retriable || i === attempts - 1) break;
      await sleep(300 * 2 ** i);
    }
  }
  throw last;
}

export const api = {
  listTickets: () => withRetry(() => request<Ticket[]>("/tickets")),

  // No automatic retry on writes: the user decides whether to try again.
  updateStatus: (id: number, status: Status) =>
    request<Ticket>(`/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
};