import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ApiError, api } from "./api/client";
import type { Ticket } from "./types";

vi.mock("./api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/client")>();
  return { ...actual, api: { listTickets: vi.fn(), updateStatus: vi.fn() } };
});

const ticket: Ticket = {
  id: 1, title: "Login broken", customer: "Acme", requester: "Sam", priority: "low",
  status: "open", description: "Cannot log in",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  window.history.replaceState(null, "", "/"); // the URL state must not leak between tests
  vi.mocked(api.listTickets).mockReset();
  vi.mocked(api.updateStatus).mockReset();
});

describe("App components", () => {
  it("shows an error with a retry button, then recovers", async () => {
    vi.mocked(api.listTickets).mockRejectedValueOnce(new ApiError(500, "boom"));
    render(<App />);

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByRole("button", { name: "Try again" })).toBeInTheDocument();

    vi.mocked(api.listTickets).mockResolvedValue([ticket]);
    await userEvent.click(within(alert).getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Login broken")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("opens the detail panel with focus, and closes it with Escape", async () => {
    vi.mocked(api.listTickets).mockResolvedValue([ticket]);
    render(<App />);

    const row = (await screen.findByText("Login broken")).closest("button")!;
    await userEvent.click(row);

    const panel = screen.getByRole("complementary", { name: "Ticket details" });
    expect(within(panel).getByRole("heading", { name: "Login broken" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
    await waitFor(() => expect(row).toHaveFocus());
  });

  it("rolls back the status and shows an error message when the API fails", async () => {
    vi.mocked(api.listTickets).mockResolvedValue([ticket]);
    vi.mocked(api.updateStatus).mockRejectedValue(new ApiError(500, "boom"));
    render(<App />);

    await userEvent.click((await screen.findByText("Login broken")).closest("button")!);
    const panel = screen.getByRole("complementary", { name: "Ticket details" });
    const select = within(panel).getByLabelText("Status");

    await userEvent.selectOptions(select, "resolved");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    await waitFor(() => expect(select).toHaveValue("open"));
  });
});