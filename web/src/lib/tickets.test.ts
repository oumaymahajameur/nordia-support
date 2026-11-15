import { describe, expect, it } from "vitest";
import { applyFilters, DEFAULT_FILTERS } from "./tickets";
import type { Ticket } from "../types";

const make = (o: Partial<Ticket>): Ticket => ({
  id: 1, title: "t", customer: "c", requester: "r", priority: "low",
  status: "open", description: "d",
  createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z", ...o,
});

describe("applyFilters", () => {
  it("sorts by business priority (urgent > high > medium > low)", () => {
    const list = [
      make({ id: 1, priority: "low" }), make({ id: 2, priority: "urgent" }),
      make({ id: 3, priority: "medium" }), make({ id: 4, priority: "high" }),
    ];
    const ids = applyFilters(list, { ...DEFAULT_FILTERS, sort: "priority_desc" }).map((t) => t.id);
    expect(ids).toEqual([2, 4, 3, 1]);
  });

  it("sorts lowest priority first when asked", () => {
    const list = [
      make({ id: 1, priority: "urgent" }), make({ id: 2, priority: "low" }),
      make({ id: 3, priority: "medium" }),
    ];
    const ids = applyFilters(list, { ...DEFAULT_FILTERS, sort: "priority_asc" }).map((t) => t.id);
    expect(ids).toEqual([2, 3, 1]);
  });

  it("breaks priority ties with the newest ticket first", () => {
    const list = [
      make({ id: 1, priority: "high", createdAt: "2026-01-01T00:00:00Z" }),
      make({ id: 2, priority: "high", createdAt: "2026-02-01T00:00:00Z" }),
    ];
    const ids = applyFilters(list, { ...DEFAULT_FILTERS, sort: "priority_desc" }).map((t) => t.id);
    expect(ids).toEqual([2, 1]);
  });

  it("sorts by date, newest first by default", () => {
    const list = [
      make({ id: 1, createdAt: "2026-01-01T00:00:00Z" }),
      make({ id: 2, createdAt: "2026-03-01T00:00:00Z" }),
    ];
    expect(applyFilters(list, DEFAULT_FILTERS).map((t) => t.id)).toEqual([2, 1]);
  });

  it("combines search, status and priority", () => {
    const list = [
      make({ id: 1, title: "Export Excel", status: "open", priority: "high" }),
      make({ id: 2, title: "Export PDF", status: "resolved", priority: "high" }),
      make({ id: 3, title: "Login", status: "open", priority: "high" }),
    ];
    const res = applyFilters(list, {
      ...DEFAULT_FILTERS, search: "export", status: "open", priority: "high",
    });
    expect(res.map((t) => t.id)).toEqual([1]);
  });
});