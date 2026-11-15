import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { api } from "./api/client";

vi.mock("./api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/client")>();
  return { ...actual, api: { listTickets: vi.fn(), updateStatus: vi.fn() } };
});

describe("App", () => {
  it("shows an empty state when no ticket matches the search", async () => {
    vi.mocked(api.listTickets).mockResolvedValue([
      {
        id: 1, title: "Login broken", customer: "Acme", requester: "Sam", priority: "low",
        status: "open", description: "d",
        createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
      },
    ]);
    render(<App />);

    await screen.findByText("Login broken");
    await userEvent.type(screen.getByLabelText("Search"), "zzz");

    expect(screen.getByText("No ticket matches your filters.")).toBeInTheDocument();
  });
});